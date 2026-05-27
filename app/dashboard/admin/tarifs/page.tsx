export const dynamic = 'force-dynamic'

import { listerPlans, mettreAJourPlan, type PlanRow } from '@/actions/admin'
import { PlanForm } from './plan-form-client'
import { AlertTriangle } from 'lucide-react'

export default async function AdminTarifsPage() {
  let plans: PlanRow[] = []
  let tableManquante = false
  try {
    plans = await listerPlans()
  } catch {
    tableManquante = true
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Tarifs des abonnements</h2>
        <p className="text-sm text-stone-500 mt-1">
          Modifier les prix, durées et disponibilité des plans. Les changements
          sont appliqués immédiatement sur la page d&apos;abonnement.
        </p>
      </div>

      {tableManquante ? (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Table manquante</p>
            <p className="text-sm text-amber-700 mt-1">
              Exécutez le fichier <code className="bg-amber-100 px-1 rounded">supabase/abonnements_admin.sql</code> dans
              le SQL Editor de Supabase pour créer la table <code className="bg-amber-100 px-1 rounded">subscription_plans</code>.
            </p>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-6 text-center text-stone-500">
          Aucun plan trouvé. Exécutez <code>supabase/abonnements_admin.sql</code> dans Supabase.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <PlanForm key={plan.code} plan={plan} action={mettreAJourPlan} />
          ))}
        </div>
      )}
    </div>
  )
}
