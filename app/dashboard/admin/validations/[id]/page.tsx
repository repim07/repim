// =============================================================================
// REPIM — Back-office admin : détail d'un dossier KYC
// =============================================================================
// Affiche toutes les infos du professionnel, ses documents avec liens signés
// (valides 1h) et les boutons Approuver / Rejeter / Suspendre.
// =============================================================================

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/server'
import { notFound }  from 'next/navigation'
import Link          from 'next/link'
import {
  ArrowLeft, FileText, ExternalLink, CheckCircle2,
  XCircle, Clock, AlertTriangle, User, Mail, Phone, Building,
} from 'lucide-react'
import ReviewClient from './ReviewClient'

// ─── Labels ───────────────────────────────────────────────────────────────────

const CAT_LABELS: Record<string, string> = {
  agence:       'Agence immobilière',
  promoteur:    'Promoteur immobilier',
  proprietaire: 'Propriétaire',
  communaute:   'Communauté villageoise',
  agent:        'Démarcheur / Agent',
}

const DOC_LABELS: Record<string, string> = {
  agrement_mclu:          'Agrément MCLU',
  rccm:                   'RCCM',
  dfe:                    'DFE',
  cni_dirigeant:          'CNI du représentant légal',
  carte_professionnelle:  'Carte professionnelle',
  attestation_villageoise:'Attestation villageoise',
  avis_lotissement:       'Avis de lotissement',
  attestation_mandat:     'Attestation de mandat',
}

const DOC_STATUS_UI: Record<string, { cls: string; Icon: React.ElementType; label: string }> = {
  pending:  { cls: 'text-blue-700 bg-blue-50 border-blue-200',  Icon: Clock,        label: 'En attente' },
  verified: { cls: 'text-green-700 bg-green-50 border-green-200', Icon: CheckCircle2, label: 'Vérifié'    },
  rejected: { cls: 'text-red-700 bg-red-50 border-red-200',    Icon: XCircle,      label: 'Rejeté'     },
}

const STATUS_UI: Record<string, { cls: string; label: string }> = {
  draft:          { cls: 'bg-stone-100 text-stone-600',   label: 'Brouillon'          },
  pending_review: { cls: 'bg-blue-100  text-blue-700',    label: 'En attente'         },
  verified:       { cls: 'bg-green-100 text-green-700',   label: 'Certifié'           },
  rejected:       { cls: 'bg-red-100   text-red-700',     label: 'Rejeté'             },
  suspended:      { cls: 'bg-red-900   text-white',       label: 'Suspendu'           },
}

// ─── Exigences par rôle (copie du SQL pour vérification côté serveur) ─────────

const DOC_REQUIREMENTS: Record<string, { required: string[]; alternatives: string[][] }> = {
  agence:       { required: ['agrement_mclu','rccm','dfe','cni_dirigeant'], alternatives: [] },
  promoteur:    { required: ['agrement_mclu','rccm','dfe','cni_dirigeant'], alternatives: [] },
  proprietaire: { required: ['cni_dirigeant'], alternatives: [] },
  communaute:   { required: ['cni_dirigeant'], alternatives: [['attestation_villageoise','avis_lotissement']] },
  agent:        { required: ['cni_dirigeant'], alternatives: [['attestation_mandat','carte_professionnelle']] },
}

function isDossierComplet(categorie: string, uploadedTypes: string[]): boolean {
  const req = DOC_REQUIREMENTS[categorie]
  if (!req) return false
  const uploaded = new Set(uploadedTypes)
  const mandatoryOk = req.required.every(dt => uploaded.has(dt))
  const altsOk = req.alternatives.every(group => group.some(dt => uploaded.has(dt)))
  return mandatoryOk && altsOk
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ValidationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin   = createAdminClient()

  // ─── 1. Chargement du profil pro ──────────────────────────────────────────
  const { data: proRow } = await admin
    .from('pro_profiles')
    .select('id, categorie, prenom, email_pro, telephone_pro, raison_sociale, adresse, verification_status, submitted_at, reviewed_at, rejection_reason')
    .eq('id', id)
    .single()

  if (!proRow) notFound()

  const pro = proRow as {
    id:                 string
    categorie:          string
    prenom:             string
    email_pro:          string
    telephone_pro:      string
    raison_sociale:     string | null
    adresse:            Record<string, string> | null
    verification_status: string
    submitted_at:       string | null
    reviewed_at:        string | null
    rejection_reason:   string | null
  }

  // ─── 2. Chargement du profil utilisateur (nom) ────────────────────────────
  const { data: profileRow } = await admin
    .from('profiles')
    .select('nom, email')
    .eq('id', id)
    .single()

  const profile = profileRow as { nom: string; email: string } | null

  // ─── 3. Chargement des documents ──────────────────────────────────────────
  const { data: docsRows } = await admin
    .from('pro_documents')
    .select('id, doc_type, storage_path, status, reviewer_notes, uploaded_at')
    .eq('pro_profile_id', id)
    .order('uploaded_at', { ascending: true })

  const docs = (docsRows ?? []) as Array<{
    id:             string
    doc_type:       string
    storage_path:   string
    status:         string
    reviewer_notes: string | null
    uploaded_at:    string
  }>

  // ─── 4. Génération des URLs signées (valides 1 heure) ─────────────────────
  const signedUrls: Record<string, string> = {}
  for (const doc of docs) {
    const { data } = await admin.storage
      .from('kyc-documents')
      .createSignedUrl(doc.storage_path, 3600)
    if (data?.signedUrl) signedUrls[doc.doc_type] = data.signedUrl
  }

  // ─── 5. Calcul dossier complet ─────────────────────────────────────────────
  const uploadedTypes = docs.map(d => d.doc_type)
  const complet       = isDossierComplet(pro.categorie, uploadedTypes)
  const statusUi      = STATUS_UI[pro.verification_status] ?? STATUS_UI['draft']
  const nomAffiche    = pro.raison_sociale ?? profile?.nom ?? `${pro.prenom} (${pro.email_pro})`

  return (
    <div>

      {/* ── Navigation retour ─────────────────────────────────────────────── */}
      <Link
        href="/dashboard/admin/validations"
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-orange-500 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la file d'attente
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ═══════════════════════════════════════════════════════════════════
            Colonne gauche : infos pro + documents
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Carte identité pro ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <h1 className="text-xl font-extrabold text-stone-900">{nomAffiche}</h1>
                <p className="text-sm text-stone-500 mt-0.5">
                  {CAT_LABELS[pro.categorie] ?? pro.categorie}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusUi.cls}`}>
                {statusUi.label}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-stone-600">
                <User className="w-4 h-4 text-stone-400 flex-shrink-0" />
                {pro.prenom} {profile?.nom ?? ''}
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                {pro.email_pro}
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
                {pro.telephone_pro}
              </div>
              {pro.raison_sociale && (
                <div className="flex items-center gap-2 text-stone-600">
                  <Building className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  {pro.raison_sociale}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="mt-4 pt-4 border-t border-stone-50 flex flex-wrap gap-4 text-xs text-stone-400">
              {pro.submitted_at && (
                <span>
                  <span className="font-semibold text-stone-500">Soumis le </span>
                  {new Date(pro.submitted_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              )}
              {pro.reviewed_at && (
                <span>
                  <span className="font-semibold text-stone-500">Examiné le </span>
                  {new Date(pro.reviewed_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* ── Documents ────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest">
                Documents
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                complet ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {complet ? '✓ Dossier complet' : '⚠ Dossier incomplet'}
              </span>
            </div>

            {docs.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-6">
                Aucun document déposé.
              </p>
            ) : (
              <div className="space-y-3">
                {docs.map((doc) => {
                  const st  = DOC_STATUS_UI[doc.status] ?? DOC_STATUS_UI['pending']
                  const Icon = st.Icon
                  const url  = signedUrls[doc.doc_type]

                  return (
                    <div
                      key={doc.id}
                      className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-4"
                    >
                      {/* Icône statut */}
                      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        doc.status === 'verified' ? 'text-green-500' :
                        doc.status === 'rejected' ? 'text-red-500'   : 'text-blue-400'
                      }`} />

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-stone-800">
                            {DOC_LABELS[doc.doc_type] ?? doc.doc_type}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.cls}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5 font-mono truncate">
                          {doc.storage_path.split('/').pop()}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Déposé le {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                        </p>
                        {doc.reviewer_notes && (
                          <p className="text-xs text-red-600 mt-1 bg-red-50 rounded px-2 py-1">
                            Note : {doc.reviewer_notes}
                          </p>
                        )}
                      </div>

                      {/* Lien de visualisation */}
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-700 border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Voir
                        </a>
                      ) : (
                        <span className="text-xs text-stone-400 flex-shrink-0 px-3 py-1.5">
                          Indisponible
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            Colonne droite : actions admin
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">

          {/* ── Panneau de décision ───────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-5">
              Décision
            </h2>

            {/* Le dossier est déjà traité → lecture seule */}
            {['verified', 'rejected', 'suspended'].includes(pro.verification_status) ? (
              <div className={`rounded-xl border p-4 ${
                pro.verification_status === 'verified'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}>
                <p className="text-sm font-semibold">
                  {pro.verification_status === 'verified'
                    ? '✓ Ce dossier a été approuvé.'
                    : pro.verification_status === 'suspended'
                    ? '⛔ Ce compte est suspendu.'
                    : '✗ Ce dossier a été rejeté.'}
                </p>
                {pro.rejection_reason && (
                  <p className="text-xs mt-2 opacity-80">
                    <span className="font-semibold">Motif : </span>
                    {pro.rejection_reason}
                  </p>
                )}
              </div>
            ) : (
              /* Dossier en attente → boutons actifs */
              <ReviewClient proId={pro.id} canApprove={complet} />
            )}
          </div>

          {/* ── Résumé du dossier ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4">
              Résumé
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Documents déposés</dt>
                <dd className="font-semibold text-stone-800">{docs.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Vérifiés</dt>
                <dd className="font-semibold text-green-600">
                  {docs.filter(d => d.status === 'verified').length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Rejetés</dt>
                <dd className="font-semibold text-red-600">
                  {docs.filter(d => d.status === 'rejected').length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Dossier complet</dt>
                <dd className={`font-semibold ${complet ? 'text-green-600' : 'text-amber-600'}`}>
                  {complet ? 'Oui ✓' : 'Non'}
                </dd>
              </div>
            </dl>
          </div>

        </div>
      </div>
    </div>
  )
}
