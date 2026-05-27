'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Pause, RotateCcw, Unlock, Lock, MoreVertical } from 'lucide-react'
import {
  activerAbonnementUtilisateur,
  suspendreAbonnementUtilisateur,
  debloquerManuellementUtilisateur,
  retirerDeblocageUtilisateur,
  reinitialiserEssaiUtilisateur,
  type UtilisateurAdminRow,
} from '@/actions/admin'

export function UtilisateurActions({ utilisateur }: { utilisateur: UtilisateurAdminRow }) {
  const [open, setOpen]   = useState(false)
  const [isPending, start] = useTransition()
  const [error, setError]  = useState<string | null>(null)

  function run(fn: () => Promise<void>, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setError(null)
    start(async () => {
      try {
        await fn()
        setOpen(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue')
      }
    })
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-60 bg-white border border-stone-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {error && (
              <div className="px-3 py-2 text-xs text-red-700 bg-red-50 border-b border-red-100">
                {error}
              </div>
            )}

            <button
              disabled={isPending}
              onClick={() => run(
                () => activerAbonnementUtilisateur(utilisateur.id, utilisateur.subscription_plan ?? 'mensuel'),
                `Activer l’abonnement de ${utilisateur.nom || utilisateur.email} ?`
              )}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-stone-700 hover:bg-green-50 hover:text-green-700 disabled:opacity-40 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Activer l’abonnement
            </button>

            <button
              disabled={isPending || utilisateur.subscription_status === 'suspended'}
              onClick={() => run(
                () => suspendreAbonnementUtilisateur(utilisateur.id),
                `Suspendre l’accès de ${utilisateur.nom || utilisateur.email} ?`
              )}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-stone-700 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40 transition-colors"
            >
              <Pause className="w-4 h-4" />
              Suspendre
            </button>

            <button
              disabled={isPending}
              onClick={() => run(
                () => reinitialiserEssaiUtilisateur(utilisateur.id, 21),
                `Réinitialiser un essai de 21 jours pour ${utilisateur.nom || utilisateur.email} ?`
              )}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-stone-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Relancer un essai 21j
            </button>

            <div className="border-t border-stone-100" />

            {utilisateur.debloque_par_admin ? (
              <button
                disabled={isPending}
                onClick={() => run(() => retirerDeblocageUtilisateur(utilisateur.id))}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Retirer le déblocage
              </button>
            ) : (
              <>
                <button
                  disabled={isPending}
                  onClick={() => run(() => debloquerManuellementUtilisateur(utilisateur.id, { dureeJours: 7 }))}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-stone-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <Unlock className="w-4 h-4" />
                  Débloquer 7 jours
                </button>
                <button
                  disabled={isPending}
                  onClick={() => run(() => debloquerManuellementUtilisateur(utilisateur.id))}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-stone-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <Unlock className="w-4 h-4" />
                  Débloquer (illimité)
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
