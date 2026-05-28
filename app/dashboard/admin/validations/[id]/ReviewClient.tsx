'use client'

// =============================================================================
// REPIM — Composant de revue d'un dossier KYC (admin)
// =============================================================================
// Gère les boutons Approuver / Rejeter / Suspendre et le champ de motif.
// Reçoit l'ID du pro depuis la page serveur parente.
// =============================================================================

import { useState, useTransition } from 'react'
import { CheckCircle2, XCircle, ShieldOff, AlertTriangle, Loader2, ChevronDown } from 'lucide-react'
import { approveKycDossier, rejectKycDossier, suspendKycDossier } from '@/actions/admin-kyc'
import { useRouter } from 'next/navigation'

interface ReviewClientProps {
  proId:   string
  canApprove: boolean   // false si dossier incomplet
}

type PanelState = 'idle' | 'rejecting' | 'suspending'

export default function ReviewClient({ proId, canApprove }: ReviewClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [panel, setPanel]     = useState<PanelState>('idle')
  const [reason, setReason]   = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ── Approuver ──────────────────────────────────────────────────────────────

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveKycDossier(proId)
      if (!result.success) {
        setError(result.error)
      } else {
        setSuccess('✓ Dossier approuvé — le professionnel est maintenant certifié.')
        setTimeout(() => router.push('/dashboard/admin/validations'), 1800)
      }
    })
  }

  // ── Rejeter ────────────────────────────────────────────────────────────────

  function handleReject() {
    setError(null)
    if (reason.trim().length < 10) {
      setError('Le motif doit contenir au moins 10 caractères.')
      return
    }
    startTransition(async () => {
      const result = await rejectKycDossier(proId, reason)
      if (!result.success) {
        setError(result.error)
      } else {
        setSuccess('✓ Dossier rejeté. Le professionnel a été notifié.')
        setTimeout(() => router.push('/dashboard/admin/validations'), 1800)
      }
    })
  }

  // ── Suspendre ──────────────────────────────────────────────────────────────

  function handleSuspend() {
    setError(null)
    if (reason.trim().length < 10) {
      setError('Le motif doit contenir au moins 10 caractères.')
      return
    }
    startTransition(async () => {
      const result = await suspendKycDossier(proId, reason)
      if (!result.success) {
        setError(result.error)
      } else {
        setSuccess('✓ Compte suspendu.')
        setTimeout(() => router.push('/dashboard/admin/validations'), 1800)
      }
    })
  }

  // ── Message de succès ──────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
        <p className="text-sm font-semibold text-green-800">{success}</p>
      </div>
    )
  }

  // ── Rendu principal ────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Erreur ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Avertissement dossier incomplet ───────────────────────────────── */}
      {!canApprove && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Le dossier est incomplet selon les exigences de ce rôle. Vérifiez les documents manquants avant d'approuver.</span>
        </div>
      )}

      {/* ── Bouton Approuver ──────────────────────────────────────────────── */}
      {panel === 'idle' && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleApprove}
          className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
        >
          {isPending
            ? <Loader2    className="w-5 h-5 animate-spin" />
            : <CheckCircle2 className="w-5 h-5" />
          }
          Approuver et certifier ce professionnel
        </button>
      )}

      {/* ── Bouton Rejeter (ouvre le panneau de motif) ────────────────────── */}
      {panel === 'idle' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => { setPanel('rejecting'); setReason(''); setError(null) }}
          className="w-full inline-flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
        >
          <XCircle className="w-5 h-5" />
          Rejeter le dossier
        </button>
      )}

      {/* ── Bouton Suspendre ──────────────────────────────────────────────── */}
      {panel === 'idle' && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => { setPanel('suspending'); setReason(''); setError(null) }}
          className="w-full inline-flex items-center justify-center gap-2 border border-stone-200 text-stone-500 hover:bg-stone-50 font-medium text-sm py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50"
        >
          <ShieldOff className="w-4 h-4" />
          Suspendre ce compte
        </button>
      )}

      {/* ── Panneau motif (rejet ou suspension) ──────────────────────────── */}
      {(panel === 'rejecting' || panel === 'suspending') && (
        <div className={`rounded-2xl border p-5 space-y-4 ${
          panel === 'rejecting' ? 'border-red-200 bg-red-50' : 'border-stone-200 bg-stone-50'
        }`}>
          <div className="flex items-center gap-2">
            {panel === 'rejecting'
              ? <XCircle   className="w-5 h-5 text-red-500" />
              : <ShieldOff className="w-5 h-5 text-stone-500" />
            }
            <h3 className="font-bold text-stone-800">
              {panel === 'rejecting' ? 'Motif du rejet' : 'Motif de la suspension'}
            </h3>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              panel === 'rejecting'
                ? 'Ex : L\'agrément MCLU fourni est illisible. Merci de téléverser un scan de meilleure qualité.'
                : 'Ex : Activité frauduleuse signalée par plusieurs utilisateurs.'
            }
            rows={4}
            className="w-full text-sm border border-stone-200 rounded-xl px-4 py-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <p className="text-xs text-stone-400">
            {reason.trim().length}/10 caractères minimum — ce motif sera visible par le professionnel.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setPanel('idle'); setError(null) }}
              className="flex-1 text-sm py-2.5 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={isPending || reason.trim().length < 10}
              onClick={panel === 'rejecting' ? handleReject : handleSuspend}
              className={`flex-1 inline-flex items-center justify-center gap-2 text-white font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 ${
                panel === 'rejecting'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-stone-700 hover:bg-stone-800'
              }`}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {panel === 'rejecting' ? 'Confirmer le rejet' : 'Confirmer la suspension'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
