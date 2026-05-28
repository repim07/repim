// =============================================================================
// REPIM — Page du tunnel KYC (/dashboard/kyc)
// =============================================================================
// Server Component : récupère le profil pro et les documents déjà uploadés,
// puis passe tout au composant client KycClient pour l'affichage interactif.
// =============================================================================

export const dynamic = 'force-dynamic'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect }  from 'next/navigation'
import Link          from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import KycClient, { type ProDocument } from './KycClient'

// ─── Labels du statut KYC ─────────────────────────────────────────────────────

const STATUS_UI: Record<string, { label: string; cls: string }> = {
  draft:          { label: 'Brouillon',               cls: 'bg-stone-100  text-stone-600'  },
  pending_review: { label: 'En cours d\'examen',       cls: 'bg-blue-100   text-blue-700'   },
  verified:       { label: 'Certifié ✓',               cls: 'bg-green-100  text-green-700'  },
  rejected:       { label: 'Dossier rejeté',           cls: 'bg-red-100    text-red-700'    },
  suspended:      { label: 'Compte suspendu',          cls: 'bg-red-900    text-white'      },
}

// ─── Labels des catégories pro ───────────────────────────────────────────────

const CATEGORIE_LABELS: Record<string, string> = {
  agence:       'Agence immobilière',
  promoteur:    'Promoteur immobilier',
  proprietaire: 'Propriétaire',
  communaute:   'Communauté villageoise',
  agent:        'Démarcheur / Agent',
}

// ─── Rôles professionnels ─────────────────────────────────────────────────────

const PRO_ROLES = new Set(['agence', 'promoteur', 'proprietaire', 'communaute', 'agent'])

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function KycPage() {

  // ─── 1. Authentification ────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // ─── 2. Lecture du rôle ─────────────────────────────────────────────────
  const admin = createAdminClient()

  const { data: profileRow } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profileRow as { role?: string } | null)?.role ?? 'chercheur'

  // Seuls les pros ont un tunnel KYC
  if (!PRO_ROLES.has(role)) {
    redirect('/dashboard')
  }

  // ─── 3. Lecture du profil pro (KYC) ─────────────────────────────────────
  const { data: proRow } = await admin
    .from('pro_profiles')
    .select('categorie, verification_status, rejection_reason')
    .eq('id', user.id)
    .single()

  const proProfile = proRow as {
    categorie:          string
    verification_status: string
    rejection_reason:   string | null
  } | null

  // Si le pro_profiles n'existe pas encore (migration non jouée ?)
  if (!proProfile) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-stone-800 mb-2">Profil professionnel introuvable</h1>
          <p className="text-sm text-stone-500 mb-4">
            Votre dossier professionnel n'a pas encore été créé. Reconnectez-vous ou contactez le support.
          </p>
          <Link href="/dashboard" className="text-orange-500 hover:underline text-sm">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { categorie, verification_status, rejection_reason } = proProfile

  // ─── 4. Lecture des documents déjà uploadés ──────────────────────────────
  const { data: docsRows } = await admin
    .from('pro_documents')
    .select('doc_type, storage_path, status, reviewer_notes, uploaded_at')
    .eq('pro_profile_id', user.id)
    .order('uploaded_at', { ascending: true })

  const uploadedDocs: ProDocument[] = (docsRows ?? []) as ProDocument[]

  // ─── 5. Dérivations pour l'affichage ─────────────────────────────────────
  const statusUi  = STATUS_UI[verification_status] ?? STATUS_UI['draft']
  const catLabel  = CATEGORIE_LABELS[categorie] ?? categorie

  // ─── 6. Rendu ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-500"
            aria-label="Retour au dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-stone-900 leading-none">
              Certification professionnelle
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">{catLabel}</p>
          </div>

          {/* Badge de statut KYC */}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusUi.cls}`}>
            {statusUi.label}
          </span>
        </div>
      </header>

      {/* ── Contenu ───────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* ── En-tête explicatif ─────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-extrabold text-stone-900">
              Votre dossier KYC
            </h2>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed">
            Déposez vos pièces justificatives pour être certifié sur REPIM.
            Une fois validé, vos annonces seront visibles par tous les utilisateurs.
          </p>
        </div>

        {/* ── Composant client interactif ────────────────────────────────── */}
        {/* Toute la logique d'upload/delete/submit est dans KycClient.tsx   */}
        <KycClient
          userId={user.id}
          categorie={categorie}
          verificationStatus={verification_status}
          rejectionReason={rejection_reason}
          uploadedDocs={uploadedDocs}
        />

        {/* ── Aide ──────────────────────────────────────────────────────── */}
        <div className="mt-8 text-center">
          <p className="text-xs text-stone-400">
            Formats acceptés : PDF, JPG, PNG, WEBP, HEIC · Taille max : 10 Mo par fichier
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Des questions ? Contactez-nous à{' '}
            <a href="mailto:support@repim.ci" className="text-orange-500 hover:underline">
              support@repim.ci
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
