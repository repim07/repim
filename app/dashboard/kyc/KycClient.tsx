'use client'

// =============================================================================
// REPIM — Composant client du tunnel KYC
// =============================================================================
// Ce composant affiche les cartes de documents à uploader, les boutons
// de suppression et le bouton de soumission du dossier.
//
// Il reçoit ses données depuis la page serveur (page.tsx) et appelle les
// Server Actions de actions/kyc.ts pour les mutations.
// =============================================================================

import { useRef, useTransition, useState } from 'react'
import {
  Upload, Trash2, CheckCircle2, Clock, XCircle,
  AlertTriangle, FileText, Send, ChevronDown, RotateCcw,
  Loader2,
} from 'lucide-react'
import {
  uploadKycDocument,
  deleteKycDocument,
  submitKycDossier,
  resetKycToDraft,
} from '@/actions/kyc'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProDocument {
  doc_type:      string
  storage_path:  string
  status:        string   // 'pending' | 'verified' | 'rejected'
  reviewer_notes: string | null
  uploaded_at:   string
}

export interface KycClientProps {
  userId:             string
  categorie:          string   // rôle pro (agence, promoteur, …)
  verificationStatus: string   // draft | pending_review | verified | rejected | suspended
  rejectionReason:    string | null
  uploadedDocs:       ProDocument[]
}

// ─── Configuration des documents ──────────────────────────────────────────────
// Source de vérité côté front pour les labels, descriptions et exigences.

interface DocConfig {
  label:       string
  description: string
  accept:      string   // attribut HTML accept du <input type="file">
}

const DOC_CONFIG: Record<string, DocConfig> = {
  agrement_mclu: {
    label:       'Agrément MCLU',
    description: 'Agrément délivré par le Ministère de la Construction, du Logement et de l\'Urbanisme',
    accept:      '.pdf,.jpg,.jpeg,.png',
  },
  rccm: {
    label:       'RCCM',
    description: 'Registre du Commerce et du Crédit Mobilier de votre structure',
    accept:      '.pdf,.jpg,.jpeg,.png',
  },
  dfe: {
    label:       'DFE — Déclaration Fiscale d\'Existence',
    description: 'Document fiscal attestant l\'existence légale de votre structure',
    accept:      '.pdf,.jpg,.jpeg,.png',
  },
  cni_dirigeant: {
    label:       'CNI du représentant légal',
    description: 'Carte Nationale d\'Identité recto-verso du représentant légal',
    accept:      '.pdf,.jpg,.jpeg,.png,.heic,.webp',
  },
  carte_professionnelle: {
    label:       'Carte professionnelle',
    description: 'Carte pro d\'agent immobilier (OACI ou équivalent)',
    accept:      '.pdf,.jpg,.jpeg,.png',
  },
  attestation_villageoise: {
    label:       'Attestation villageoise',
    description: 'Attestation du chef de village reconnaissant votre autorité foncière',
    accept:      '.pdf,.jpg,.jpeg,.png',
  },
  avis_lotissement: {
    label:       'Avis de lotissement',
    description: 'Avis de lotissement approuvé par les autorités compétentes',
    accept:      '.pdf,.jpg,.jpeg,.png',
  },
  attestation_mandat: {
    label:       'Attestation de mandat',
    description: 'Mandat signé par le propriétaire vous autorisant à commercialiser ses biens',
    accept:      '.pdf,.jpg,.jpeg,.png',
  },
}

// ─── Exigences par rôle ───────────────────────────────────────────────────────
// Correspond exactement à required_doc_types_for_role() dans le SQL.
// Les alternatives sont groupées dans un tableau :
//   ["a","b"] = un de A ou B suffit

interface DocRequirement {
  required:     string[]         // doc_types obligatoires
  alternatives: string[][]       // groupes d'alternatives (un par groupe suffit)
}

// RCCM et DFE retires du parcours d'inscription pour simplifier les conversions.
// Seuls l'agrement MCLU et la CNI sont requis pour les agences et promoteurs.
const DOC_REQUIREMENTS: Record<string, DocRequirement> = {
  agence:       { required: ['agrement_mclu', 'cni_dirigeant'], alternatives: [] },
  promoteur:    { required: ['agrement_mclu', 'cni_dirigeant'], alternatives: [] },
  proprietaire: { required: ['cni_dirigeant'], alternatives: [] },
  communaute:   { required: ['cni_dirigeant'], alternatives: [['attestation_villageoise','avis_lotissement']] },
  agent:        { required: ['cni_dirigeant'], alternatives: [['attestation_mandat','carte_professionnelle']] },
}

// ─── Composant : carte d'un document individuel ───────────────────────────────

interface DocCardProps {
  docType:    string
  uploaded:   ProDocument | undefined
  isReadOnly: boolean   // true si dossier en pending_review, verified, suspended
  onUpload:   (docType: string, file: File) => void
  onDelete:   (docType: string) => void
  isPending:  boolean   // un traitement est en cours
}

function DocCard({ docType, uploaded, isReadOnly, onUpload, onDelete, isPending }: DocCardProps) {
  // Référence vers l'<input type="file"> caché
  const inputRef = useRef<HTMLInputElement>(null)
  const cfg      = DOC_CONFIG[docType]
  const isUploaded = !!uploaded

  // ── Couleur du badge de statut ──
  const statusBadge = uploaded
    ? uploaded.status === 'verified'
      ? { cls: 'text-green-700 bg-green-50 border-green-200', label: 'Vérifié ✓' }
      : uploaded.status === 'rejected'
      ? { cls: 'text-red-700 bg-red-50 border-red-200', label: 'Rejeté' }
      : { cls: 'text-blue-700 bg-blue-50 border-blue-200', label: 'Déposé' }
    : null

  return (
    <div className={`relative rounded-2xl border p-4 transition-all ${
      isUploaded
        ? 'border-green-200 bg-green-50/50'
        : 'border-stone-200 bg-white hover:border-orange-200'
    }`}>
      {/* ── En-tête de la carte ── */}
      <div className="flex items-start gap-3">
        {/* Icône de statut */}
        <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUploaded ? 'bg-green-100' : 'bg-stone-100'
        }`}>
          {isUploaded
            ? <CheckCircle2 className="w-5 h-5 text-green-600" />
            : <FileText     className="w-5 h-5 text-stone-400" />
          }
        </div>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-stone-800">{cfg?.label ?? docType}</span>
            {statusBadge && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusBadge.cls}`}>
                {statusBadge.label}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{cfg?.description}</p>

          {/* Nom du fichier uploadé */}
          {uploaded && (
            <p className="text-xs text-stone-400 mt-1 font-mono truncate">
              {uploaded.storage_path.split('/').pop()} — {new Date(uploaded.uploaded_at).toLocaleDateString('fr-FR')}
            </p>
          )}

          {/* Note du reviewer si rejeté */}
          {uploaded?.status === 'rejected' && uploaded.reviewer_notes && (
            <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">
              <span className="font-semibold">Motif : </span>{uploaded.reviewer_notes}
            </div>
          )}
        </div>
      </div>

      {/* ── Boutons d'action ── */}
      {!isReadOnly && (
        <div className="mt-3 flex gap-2 justify-end">
          {/* Supprimer — uniquement si un fichier est uploadé */}
          {isUploaded && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => onDelete(docType)}
              className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Supprimer
            </button>
          )}

          {/* Téléverser / Remplacer */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
              isUploaded
                ? 'text-stone-600 border border-stone-200 hover:border-orange-300 hover:text-orange-600'
                : 'bg-orange-500 hover:bg-orange-600 text-white border border-transparent'
            }`}
          >
            {isPending
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Upload   className="w-3 h-3" />
            }
            {isUploaded ? 'Remplacer' : 'Téléverser'}
          </button>

          {/* Input file caché */}
          <input
            ref={inputRef}
            type="file"
            accept={cfg?.accept ?? '.pdf,.jpg,.jpeg,.png'}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                onUpload(docType, file)
                // Réinitialise l'input pour permettre le même fichier
                e.target.value = ''
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function KycClient({
  userId,
  categorie,
  verificationStatus,
  rejectionReason,
  uploadedDocs,
}: KycClientProps) {

  // ── State ──
  const [isPending, startTransition]    = useTransition()
  const [actionError, setActionError]   = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  const requirements  = DOC_REQUIREMENTS[categorie] ?? { required: [], alternatives: [] }
  const uploadedMap   = new Map(uploadedDocs.map(d => [d.doc_type, d]))

  // Vue lecture seule si le dossier ne peut pas être modifié
  const isReadOnly = ['pending_review', 'verified', 'suspended'].includes(verificationStatus)

  // ── Calcul de progression ──
  const requiredCount    = requirements.required.length
  const requiredUploaded = requirements.required.filter(dt => uploadedMap.has(dt)).length

  // Pour les alternatives : chaque groupe est satisfait si au moins un type est uploadé
  const altGroupsSatisfied = requirements.alternatives.filter(group =>
    group.some(dt => uploadedMap.has(dt))
  ).length
  const altGroupsTotal = requirements.alternatives.length

  const totalRequired = requiredCount + altGroupsTotal
  const totalUploaded = requiredUploaded + altGroupsSatisfied
  const isComplete    = totalUploaded >= totalRequired && totalRequired > 0

  // ── Handlers ──

  function handleUpload(docType: string, file: File) {
    setActionError(null)
    setActionSuccess(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('doc_type', docType)

    startTransition(async () => {
      const result = await uploadKycDocument(formData)
      if (!result.success) {
        setActionError(result.error)
      } else {
        setActionSuccess('Document téléversé avec succès.')
      }
    })
  }

  function handleDelete(docType: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await deleteKycDocument(docType)
      if (!result.success) setActionError(result.error)
    })
  }

  function handleSubmit() {
    setActionError(null)
    setShowSubmitConfirm(false)
    startTransition(async () => {
      const result = await submitKycDossier()
      if (!result.success) setActionError(result.error)
    })
  }

  function handleResetToDraft() {
    setActionError(null)
    startTransition(async () => {
      const result = await resetKycToDraft()
      if (!result.success) setActionError(result.error)
    })
  }

  // ── Rendu : vue lecture seule (pending / verified / suspended) ──

  if (verificationStatus === 'verified') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-green-800 mb-1">Dossier certifié !</h2>
        <p className="text-sm text-green-700">
          Votre profil est vérifié. Vous pouvez publier des annonces sur REPIM.
        </p>
      </div>
    )
  }

  if (verificationStatus === 'pending_review') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 flex items-start gap-4">
          <Clock className="w-8 h-8 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-blue-900 mb-1">Dossier soumis — en cours d'examen</h2>
            <p className="text-sm text-blue-700 leading-relaxed">
              Notre équipe examine votre dossier. Vous recevrez une notification dès que la revue sera terminée (généralement 24 à 72 heures ouvrées).
            </p>
          </div>
        </div>

        {/* Documents soumis en lecture seule */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-stone-600 uppercase tracking-widest">Documents soumis</p>
          {[...requirements.required, ...requirements.alternatives.flat()].map(dt => (
            <DocCard
              key={dt}
              docType={dt}
              uploaded={uploadedMap.get(dt)}
              isReadOnly={true}
              onUpload={() => {}}
              onDelete={() => {}}
              isPending={false}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Rendu : formulaire d'upload (draft / rejected) ──

  return (
    <div className="space-y-6">

      {/* ── Message de rejet ──────────────────────────────────────────────── */}
      {verificationStatus === 'rejected' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-4">
          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-1">Dossier refusé</h3>
            {rejectionReason && (
              <p className="text-sm text-red-700 leading-relaxed mb-3">
                <span className="font-semibold">Motif : </span>{rejectionReason}
              </p>
            )}
            <p className="text-sm text-red-600">
              Corrigez les documents signalés ci-dessous et soumettez à nouveau.
            </p>
          </div>
        </div>
      )}

      {/* ── Barre de progression ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-stone-700">Progression du dossier</span>
          <span className="text-sm font-bold text-orange-600">
            {totalUploaded} / {totalRequired} documents
          </span>
        </div>
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-orange-400'
            }`}
            style={{ width: totalRequired > 0 ? `${(totalUploaded / totalRequired) * 100}%` : '0%' }}
          />
        </div>
        {isComplete && (
          <p className="text-xs text-green-600 font-medium mt-2">
            ✓ Tous les documents requis sont présents. Vous pouvez soumettre votre dossier.
          </p>
        )}
      </div>

      {/* ── Notification de succès/erreur ─────────────────────────────────── */}
      {actionError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && !actionError && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── Documents OBLIGATOIRES ────────────────────────────────────────── */}
      {requirements.required.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
            Documents obligatoires
          </h3>
          <div className="space-y-3">
            {requirements.required.map(dt => (
              <DocCard
                key={dt}
                docType={dt}
                uploaded={uploadedMap.get(dt)}
                isReadOnly={isReadOnly}
                onUpload={handleUpload}
                onDelete={handleDelete}
                isPending={isPending}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Documents ALTERNATIFS (un parmi plusieurs suffit) ────────────── */}
      {requirements.alternatives.map((group, groupIdx) => (
        <section key={groupIdx}>
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
            Document complémentaire
            <span className="ml-2 text-orange-500 font-normal normal-case tracking-normal">
              (un seul suffit)
            </span>
          </h3>
          <div className="rounded-2xl border border-dashed border-stone-200 p-4 space-y-3 bg-stone-50/50">
            {group.map((dt, i) => (
              <div key={dt}>
                {i > 0 && (
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 h-px bg-stone-200" />
                    <span className="text-xs font-bold text-stone-400 px-2">OU</span>
                    <div className="flex-1 h-px bg-stone-200" />
                  </div>
                )}
                <DocCard
                  docType={dt}
                  uploaded={uploadedMap.get(dt)}
                  isReadOnly={isReadOnly}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  isPending={isPending}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ── Bouton de soumission ──────────────────────────────────────────── */}
      {!isReadOnly && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          {!showSubmitConfirm ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  {isComplete ? 'Prêt à soumettre !' : 'Dossier incomplet'}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isComplete
                    ? 'Votre dossier sera examiné par notre équipe sous 24–72 h.'
                    : `Encore ${totalRequired - totalUploaded} document(s) requis avant de pouvoir soumettre.`
                  }
                </p>
              </div>
              <button
                type="button"
                disabled={!isComplete || isPending}
                onClick={() => setShowSubmitConfirm(true)}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send    className="w-4 h-4" />
                }
                Soumettre mon dossier
              </button>
            </div>

          ) : (
            /* ── Confirmation avant soumission ── */
            <div className="text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-stone-800">
                Confirmer la soumission ?
              </p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Une fois soumis, vous ne pourrez plus modifier vos documents jusqu'à la fin de l'examen par notre équipe.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="text-sm px-4 py-2 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send    className="w-4 h-4" />
                  }
                  Confirmer la soumission
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
