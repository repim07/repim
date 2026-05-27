export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/actions/auth'
import Link from 'next/link'
import Image from 'next/image'
import {
  Home, PlusCircle, CalendarDays, User,
  LogOut, Bell, Settings, ChevronRight,
  Building, CheckCircle, Clock
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profileResult = await supabase
    .from('profiles')
    .select('nom, role, email')
    .eq('id', user!.id)
    .single()

  const profile = profileResult.data as { nom: string; role: string; email: string } | null
  const displayName = profile?.nom ?? user?.email?.split('@')[0] ?? 'Utilisateur'
  const role = profile?.role ?? 'chercheur'

  const roleLabel: Record<string, string> = {
    chercheur:    'Chercheur',
    agent:        'Agent immobilier',
    proprietaire: 'Propriétaire',
    agence:       'Agence immobilière',
    promoteur:    'Promoteur immobilier',
    admin:        'Administrateur',
  }

  const canPublish = ['agent', 'proprietaire', 'agence', 'promoteur', 'admin'].includes(role)

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-repim.png" alt="REPIM" width={100} height={32} className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/notifications" className="p-2 text-stone-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Bienvenue */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900">
                Bonjour, {displayName} 👋
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {roleLabel[role] ?? role}
                </span>
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-red-500 border border-stone-200 hover:border-red-200 px-4 py-2 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </form>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Home,        label: 'Mes annonces',   href: '/dashboard/annonces',  color: 'orange' },
            { icon: PlusCircle,  label: 'Publier un bien', href: '/annonces/new',         color: 'green'  },
            { icon: CalendarDays,label: 'Mes visites',     href: '/dashboard/visites',    color: 'blue'   },
            { icon: User,        label: 'Mon profil',      href: '/dashboard/profil',     color: 'purple' },
          ].map((item) => {
            const Icon = item.icon
            const colors: Record<string, string> = {
              orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100',
              green:  'bg-green-50  text-green-600  hover:bg-green-100  border-green-100',
              blue:   'bg-blue-50   text-blue-600   hover:bg-blue-100   border-blue-100',
              purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100',
            }
            return (
              <Link
                key={item.label} href={item.href}
                className={`flex items-center gap-3 p-4 rounded-2xl border ${colors[item.color]} transition-colors group`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold flex-1">{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            )
          })}
        </div>

        {/* Stats & Info */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Statut */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4">
              Statut de votre compte
            </h2>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, label: 'Email vérifié',       done: true  },
                { icon: CheckCircle, label: 'Profil créé',         done: !!profile },
                { icon: Clock,       label: 'Première annonce',    done: false },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${item.done ? 'text-green-500' : 'text-stone-300'}`} />
                    <span className={`text-sm ${item.done ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
                      {item.label}
                    </span>
                    {!item.done && (
                      <span className="ml-auto text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                        En attente
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTA Publier */}
          {canPublish && (
            <div className="bg-orange-500 rounded-2xl p-6 text-white flex flex-col justify-between">
              <div>
                <Building className="w-8 h-8 text-orange-200 mb-3" />
                <h3 className="font-bold text-lg leading-snug mb-2">
                  Publiez votre premier bien
                </h3>
                <p className="text-orange-100 text-sm leading-relaxed">
                  Votre annonce sera visible par des milliers d&apos;acheteurs et locataires.
                </p>
              </div>
              <Link
                href="/annonces/new"
                className="mt-5 inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold text-sm py-2.5 px-4 rounded-xl hover:bg-orange-50 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Publier maintenant
              </Link>
            </div>
          )}

          {!canPublish && (
            <div className="bg-orange-500 rounded-2xl p-6 text-white flex flex-col justify-between">
              <div>
                <Home className="w-8 h-8 text-orange-200 mb-3" />
                <h3 className="font-bold text-lg leading-snug mb-2">
                  Trouvez votre logement
                </h3>
                <p className="text-orange-100 text-sm leading-relaxed">
                  Parcourez des milliers d&apos;annonces vérifiées à Abidjan et en Afrique.
                </p>
              </div>
              <Link
                href="/annonces"
                className="mt-5 inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold text-sm py-2.5 px-4 rounded-xl hover:bg-orange-50 transition-colors"
              >
                Voir les annonces
              </Link>
            </div>
          )}
        </div>

        {/* Paramètres profil */}
        <div className="mt-6 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">Paramètres du compte</p>
                <p className="text-xs text-stone-400">{user?.email}</p>
              </div>
            </div>
            <Link href="/dashboard/profil" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              Modifier
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
