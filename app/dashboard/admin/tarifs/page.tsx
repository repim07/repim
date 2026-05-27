import { listerPlans, mettreAJourPlan } from '@/actions/admin'
import { PlanForm } from './plan-form-client'

export default async function AdminTarifsPage() {
  const plans = await listerPlans()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Tarifs des abonnements</h2>
        <p className="text-sm text-stone-500 mt-1">
          Modifier les prix, durées et disponibilité des plans. Les changements
          sont appliqués immédiatement sur la page d&apos;abonnement.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <PlanForm key={plan.code} plan={plan} action={mettreAJourPlan} />
        ))}
      </div>
    </div>
  )
}
