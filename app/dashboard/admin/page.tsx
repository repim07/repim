export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { listerUtilisateurs, listerPlans } from '@/actions/admin'
import { Users, BadgePercent, AlertTriangle, CheckCircle2, Clock, ShieldOff } from 'lucide-react'

export default async function AdminHomePage() {
  let utilisateurs: Awaited<ReturnType<typeof listerUtilisateurs>> = []
  let plans: Awaited<ReturnType<typeof listerPlans>> = []

  try {
    ;[utilisateurs, plans] = await Promise.all([
      listerUtilisateurs('tous'),
      listerPlans(),
    ])
  } catch (err) {
    console.error('[AdminHomePage]', err)
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-red-700">Erreur de chargement des données</p>
        <p className="text-xs text-red-500 mt-1">
          Vérifiez que les tables <code>subscription_plans</code> et <code>profiles</code> sont correctement configurées.
        </p>
        <Link
          href="/dashboard/admin"
          className="mt-4 inline-block text-xs text-red-600 underline hover:text-red-800"
        >
          Réessayer
        </Link>
      </div>
    )
  }

  const stats = {
    total:     utilisateurs.length,
    essai:     utilisateurs.filter((u) => u.etat_effectif === 'essai_en_cours').length,
    actifs:    utilisateurs.filter((u) => u.etat_effectif === 'abonnement_actif').length,
    expires:   utilisateurs.filter((u) => u.etat_effectif === 'essai_expire' || u.etat_effectif === 'abonnement_expire').length,
    suspendus: utilisateurs.filter((u) => u.etat_effectif === 'suspendu').length,
    debloques: utilisateurs.filter((u) => u.etat_effectif === 'debloque_admin').length,
  }

  const cards = [
    { label: 'Utilisateurs total',   value: stats.total,     icon: Users,         color: 'orange', href: '/dashboard/admin/utilisateurs' },
    { label: 'En essai 21 jours',    value: stats.essai,     icon: Clock,         color: 'blue',   href: '/dashboard/admin/utilisateurs?filtre=essai' },
    { label: 'Abonnés actifs',       value: stats.actifs,    icon: CheckCircle2,  color: 'green',  href: '/dashboard/admin/utilisateurs?filtre=abonnes' },
    { label: 'Expirés (à relancer)', value: stats.expires,   icon: AlertTriangle, color: 'red',    href: '/dashboard/admin/utilisateurs?filtre=expires' },
    { label: 'Suspendus',            value: stats.suspendus, icon: ShieldOff,     color: 'amber',  href: '/dashboard/admin/utilisateurs?filtre=expires' },
    { label: 'Débloqués (bypass)',   value: stats.debloques, icon: BadgePercent,  color: 'purple', href: '/dashboard/admin/utilisateurs' },
  ] as const

  const colorMap: Record<string, string> = {
    orange: 'bg-orange-100 text-orange-700',
    green:  'bg-green-100 text-green-700',
    blue:   'bg-blue-100 text-blue-700',
    red:    'bg-red-100 text-red-700',
    amber:  'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-stone-900">Vue d&apos;ensemble</h2>
        <p className="text-xs text-stone-500 mt-1">
          21 jours d&apos;accès gratuit pour tout nouvel utilisateur (sauf chercheurs et admin).
        </p>
      </div>

      {/* Stats cards — 2 colonnes mobile, 3 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-stone-200 hover:border-orange-300 hover:shadow-md rounded-2xl p-4 flex items-center gap-3 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-stone-500 font-medium leading-tight">{label}</p>
              <p className="text-2xl font-extrabold text-stone-900">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/admin/utilisateurs"
          className="bg-white border border-stone-200 hover:border-orange-300 hover:shadow-md rounded-2xl p-5 transition-all"
        >
          <Users className="w-7 h-7 text-orange-500 mb-2" />
          <h3 className="text-base font-bold text-stone-900 mb-1">Gérer les utilisateurs</h3>
          <p className="text-xs text-stone-500">
            Activer, suspendre ou débloquer un abonnement. Relancer un essai gratuit.
          </p>
        </Link>

        <Link
          href="/dashboard/admin/tarifs"
          className="bg-white border border-stone-200 hover:border-orange-300 hover:shadow-md rounded-2xl p-5 transition-all"
        >
          <BadgePercent className="w-7 h-7 text-orange-500 mb-2" />
          <h3 className="text-base font-bold text-stone-900 mb-1">Modifier les tarifs</h3>
          <p className="text-xs text-stone-500 mb-3">
            Éditer les prix et durées des plans mensuel, trimestriel, semestriel, annuel.
          </p>
          {plans.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {plans.map((p) => (
                <span key={p.code} className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded">
                  {p.label} : {p.prix.toLocaleString('fr-FR')} {p.devise}
                </span>
              ))}
            </div>
          )}
        </Link>
      </div>
    </div>
  )
}
