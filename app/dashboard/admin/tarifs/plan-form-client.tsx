'use client'

import { useState, useTransition } from 'react'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'
import type { PlanRow } from '@/actions/admin'

interface Props {
  plan: PlanRow
  action: (formData: FormData) => Promise<void>
}

export function PlanForm({ plan, action }: Props) {
  const [isPending, start] = useTransition()
  const [saved, setSaved]  = useState(false)
  const [error, setError]  = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('code', plan.code)
    setError(null)
    setSaved(false)
    start(async () => {
      try {
        await action(fd)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-500">
            Plan {plan.code}
          </span>
          <h3 className="text-lg font-bold text-stone-900">{plan.label}</h3>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="actif"
            defaultChecked={plan.actif}
            className="w-4 h-4 accent-orange-500"
          />
          <span className="text-xs font-medium text-stone-600">Actif</span>
        </label>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            Libellé affiché
          </label>
          <input
            type="text"
            name="label"
            defaultValue={plan.label}
            required
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Prix ({plan.devise})
            </label>
            <input
              type="number"
              name="prix"
              defaultValue={plan.prix}
              min={0}
              step={500}
              required
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Durée (jours)
            </label>
            <input
              type="number"
              name="duree_jours"
              defaultValue={plan.duree_jours}
              min={1}
              required
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-stone-400">
          Modifié le {new Date(plan.updated_at).toLocaleDateString('fr-FR')}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Enregistré' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
