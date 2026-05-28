// =============================================================================
// POST /api/payments/genius-pay
// Initie une transaction GeniusPay pour l'abonnement partenaire.
// Retourne { paymentUrl } au frontend qui redirige l'utilisateur.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { PLANS_DEFAUT, type PlanAbonnement } from '@/lib/partenaires-config'

const GENIUS_PAY_API_URL   = process.env.GENIUS_PAY_API_URL   ?? 'https://api.geniuspay.africa'
const GENIUS_PAY_SECRET_KEY = process.env.GENIUS_PAY_SECRET_KEY ?? ''
const APP_URL               = process.env.NEXT_PUBLIC_APP_URL  ?? 'http://localhost:3000'

const PLANS_VALIDES = ['mensuel', 'trimestriel', 'semestriel', 'annuel'] as const

export async function POST(req: NextRequest) {
  try {
    // ── 1. Authentification ─────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentification requise.' },
        { status: 401 }
      )
    }

    // ── 2. Lecture + validation du body ─────────────────────────────────────
    let body: { plan?: string; phone?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Body JSON invalide.' }, { status: 400 })
    }

    const { plan, phone } = body

    if (!plan || !PLANS_VALIDES.includes(plan as PlanAbonnement)) {
      return NextResponse.json({ error: 'Plan invalide.' }, { status: 400 })
    }

    const planInfo = PLANS_DEFAUT[plan as PlanAbonnement]

    // ── 3. Vérification de l'existence du partenaire ────────────────────────
    const admin = createAdminClient()
    const { data: partenaire, error: partErr } = await admin
      .from('partenaires')
      .select('id, statut_abonnement')
      .eq('user_id', user.id)
      .maybeSingle()

    if (partErr || !partenaire) {
      return NextResponse.json(
        { error: 'Profil partenaire introuvable.' },
        { status: 404 }
      )
    }

    // ── 4. Génération d'une référence unique ─────────────────────────────────
    const transactionRef = `REPIM-${crypto.randomUUID()}`

    // ── 5. Pré-enregistrement de la référence dans Supabase ─────────────────
    const { error: updateErr } = await admin
      .from('partenaires')
      .update({
        statut_abonnement: 'en_attente',
        plan_actif:        plan,
        payment_provider:  'geniuspay',
        payment_ref:       transactionRef,
        payment_phone:     phone ?? null,
      })
      .eq('user_id', user.id)

    if (updateErr) {
      console.error('[genius-pay] update partenaire:', updateErr.message)
      return NextResponse.json(
        { error: 'Erreur lors de la preparation du paiement.' },
        { status: 500 }
      )
    }

    // ── 6. Récupération de l'email de l'utilisateur ─────────────────────────
    const { data: { user: fullUser } } = await admin.auth.admin.getUserById(user.id)
    const userEmail = fullUser?.email ?? user.email ?? ''

    // ── 7. Appel à l'API GeniusPay ──────────────────────────────────────────
    const gpPayload = {
      amount:         planInfo.prix,
      currency:       'XOF',
      customer_email: userEmail,
      customer_phone: phone ?? '',
      description:    `Abonnement REPIM Pro - ${planInfo.label}`,
      reference:      transactionRef,
      callback_url:   `${APP_URL}/api/payments/genius-pay/webhook`,
      return_url:     `${APP_URL}/paiement/succes?ref=${transactionRef}`,
      cancel_url:     `${APP_URL}/paiement/annule?ref=${transactionRef}`,
      metadata: {
        user_id:  user.id,
        plan,
        platform: 'repim',
      },
    }

    const gpResponse = await fetch(`${GENIUS_PAY_API_URL}/v1/payments`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GENIUS_PAY_SECRET_KEY}`,
        'X-API-Key':     GENIUS_PAY_SECRET_KEY,
      },
      body: JSON.stringify(gpPayload),
    })

    if (!gpResponse.ok) {
      const errText = await gpResponse.text()
      console.error('[genius-pay] GeniusPay API error:', gpResponse.status, errText)
      return NextResponse.json(
        { error: 'La passerelle de paiement est temporairement indisponible.' },
        { status: 502 }
      )
    }

    const gpData = await gpResponse.json() as {
      success?:     boolean
      payment_url?: string
      checkout_url?: string
      data?: { payment_url?: string; checkout_url?: string }
    }

    // Compatibilite multi-format de réponse GeniusPay
    const paymentUrl =
      gpData.payment_url  ??
      gpData.checkout_url ??
      gpData.data?.payment_url ??
      gpData.data?.checkout_url

    if (!paymentUrl) {
      console.error('[genius-pay] Pas de paymentUrl dans la réponse:', JSON.stringify(gpData))
      return NextResponse.json(
        { error: 'Impossible de generer le lien de paiement.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ paymentUrl, transactionRef })
  } catch (err) {
    console.error('[genius-pay] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    )
  }
}
