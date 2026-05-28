// =============================================================================
// POST /api/payments/genius-pay/webhook
// Reçoit les notifications de paiement de GeniusPay.
// Vérifie la signature HMAC-SHA256 avant toute action.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { PLANS_DEFAUT, type PlanAbonnement } from '@/lib/partenaires-config'

const GENIUS_PAY_SECRET_KEY = process.env.GENIUS_PAY_SECRET_KEY ?? ''

// ── Statuts de paiement reconnus comme "réussi" ──────────────────────────────
const STATUTS_SUCCES = new Set([
  'COMPLETED', 'SUCCESSFUL', 'SUCCESS', 'APPROVED', 'PAID', 'completed', 'success', 'paid',
])

// ── Vérification de signature HMAC-SHA256 ────────────────────────────────────
function verifierSignature(rawBody: string, signatureHeader: string): boolean {
  if (!GENIUS_PAY_SECRET_KEY) {
    console.error('[webhook] GENIUS_PAY_SECRET_KEY manquant !')
    return false
  }

  // GeniusPay envoie typiquement "sha256=<hex>" dans X-Genius-Signature
  const expectedHex = createHmac('sha256', GENIUS_PAY_SECRET_KEY)
    .update(rawBody, 'utf8')
    .digest('hex')

  // Supporte les formats "sha256=..." et la hex brute
  const receivedHex = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader

  if (expectedHex.length !== receivedHex.length) return false

  try {
    return timingSafeEqual(
      Buffer.from(expectedHex, 'hex'),
      Buffer.from(receivedHex, 'hex')
    )
  } catch {
    return false
  }
}

// ── Handler principal ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Lecture du corps brut (nécessaire pour HMAC)
  const rawBody = await req.text()

  // 2. Vérification de la signature
  const signature =
    req.headers.get('x-genius-signature') ??
    req.headers.get('x-geniuspay-signature') ??
    req.headers.get('x-signature') ??
    ''

  if (!verifierSignature(rawBody, signature)) {
    console.warn('[webhook] Signature invalide — requête rejetée.')
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 })
  }

  // 3. Parsing du payload
  let payload: {
    event?:          string
    status?:         string
    reference?:      string
    transaction_id?: string
    amount?:         number
    currency?:       string
    metadata?: {
      user_id?: string
      plan?:    string
    }
    data?: {
      status?:         string
      reference?:      string
      transaction_id?: string
      amount?:         number
    }
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload JSON invalide.' }, { status: 400 })
  }

  // Normalisation (certaines versions de GeniusPay encapsulent dans data{})
  const status    = payload.status    ?? payload.data?.status    ?? ''
  const reference = payload.reference ?? payload.data?.reference ?? ''

  // 4. On ne traite que les paiements réussis
  if (!STATUTS_SUCCES.has(status)) {
    console.info(`[webhook] Statut non-actionnable : "${status}" pour ref="${reference}"`)
    // Répondre 200 pour éviter les re-tentatives GeniusPay sur events normaux
    return NextResponse.json({ received: true, action: 'ignored' })
  }

  if (!reference) {
    console.error('[webhook] Aucune référence de transaction dans le payload.')
    return NextResponse.json({ error: 'Reference manquante.' }, { status: 400 })
  }

  // 5. Recherche du partenaire par payment_ref
  const admin = createAdminClient()

  const { data: partenaire, error: findErr } = await admin
    .from('partenaires')
    .select('id, user_id, plan_actif, statut_abonnement')
    .eq('payment_ref', reference)
    .maybeSingle()

  if (findErr || !partenaire) {
    console.error('[webhook] Partenaire introuvable pour ref:', reference, findErr?.message)
    return NextResponse.json({ error: 'Partenaire introuvable.' }, { status: 404 })
  }

  // 6. Idempotence — ne pas retraiter un paiement déjà actif
  if (partenaire.statut_abonnement === 'actif') {
    console.info('[webhook] Paiement déjà traité — partenaire actif.')
    return NextResponse.json({ received: true, action: 'already_processed' })
  }

  // 7. Calcul des dates d'abonnement
  const plan       = (partenaire.plan_actif ?? 'mensuel') as PlanAbonnement
  const planInfo   = PLANS_DEFAUT[plan]
  const dateDebut  = new Date()
  const dateFin    = new Date(dateDebut.getTime() + planInfo.dureeJours * 24 * 60 * 60 * 1000)

  // 8. Activation du partenaire
  const { error: updatePartenErr } = await admin
    .from('partenaires')
    .update({
      statut_abonnement: 'actif',
      date_debut_abo:    dateDebut.toISOString(),
      date_fin_abo:      dateFin.toISOString(),
    })
    .eq('id', partenaire.id)

  if (updatePartenErr) {
    console.error('[webhook] Erreur MAJ partenaire:', updatePartenErr.message)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 })
  }

  // 9. Vérification KYC automatique : met à jour pro_profiles si la ligne existe
  const { error: updateProErr } = await admin
    .from('pro_profiles')
    .update({ verification_status: 'verified' })
    .eq('id', partenaire.user_id)

  if (updateProErr) {
    // Non bloquant : log seulement (pro_profiles n'existe pas toujours pour les partenaires)
    console.warn('[webhook] Erreur MAJ pro_profiles:', updateProErr.message)
  }

  console.info(`[webhook] Partenaire ${partenaire.id} activé — plan=${plan} ref=${reference}`)

  return NextResponse.json({ received: true, action: 'activated' })
}
