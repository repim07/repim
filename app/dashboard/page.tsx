export const dynamic = 'force-dynamic'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logoutAction } from '@/actions/auth'
import Link from 'next/link'
import Image from 'next/image'
import {
  Home, PlusCircle, CalendarDays, User,
  LogOut, Bell, Settings, ChevronRight,
  Building, CheckCircle, Clock, Search,
  ShieldCheck,
} from 'lucide-react'

// ─── Configuration par rôle ───────────────────────────────────────────────────

type RoleKey = 'chercheur' | 'proprietaire' | 'agence' | 'promoteur' | 'admin' | string

interface RoleConfig {
  label:  string
  badge:  string   // classes Tailwind du badge
  avatar: string   // couleur de fond de l'avatar
}

const ROLE_CONFIG: Record<string, RoleConfig> = {
  chercheur:    { label: 'Chercheur',            badge: 'bg-blue-100 text-blue-700',    avatar: 'bg-blue-100 text-blue-700'   },
  proprietaire: { label: 'Propriétaire',         badge: 'bg-orange-100 text-orange-700', avatar: 'bg-orange-100 text-orange-700'},
  agence:       { label: 'Agence immobilière',   badge: 'bg-green-100 text-green-700',  avatar: 'bg-green-100 text-green-700' },
  promoteur:    { label: 'Promoteur immobilier', badge: 'bg-violet-100 text-violet-700', avatar: 'bg-violet-100 text-violet-700'},
  admin:        { label: 'Administrateur',       badge: 'bg-stone-900 text-white',      avatar: 'bg-stone-900 text-white'     },
}

const DEFAULT_CONFIG: RoleConfig = {
  label: 'Utilisateur', badge: 'bg-stone-100 text-stone-600', avatar: 'bg-stone-100 text-stone-600',
}

// ─── Cartes d'action selon le rôle ───────────────────────────────────────────

function getActionCards(role: RoleKey) {
  const canPublish = ['proprietaire', 'agence', 'promoteur', 'agent', 'admin'].includes(role)

  if (role === 'admin') {
    return [
      { icon: ShieldCheck, label: 'Console admin',   href: '/dashboard/admin',    color: 'amber'  },
      { icon: User,        label: 'Utilisateurs',    href: '/dashboard/admin/utilisateurs', color: 'blue' },
      { icon: CalendarDays,label: 'Mes visites',     href: '/dashboard/visites',  color: 'purple' },
      { icon: User,        label: 'Mon profil',      href: '/dashboard/profil',   color: 'stone'  },
    ]
  }

  if (canPublish) {
    return [
      { icon: Home,        label: 'Mes annonces',    href: '/dashboard/annonces', color: 'orange' },
      { icon: PlusCircle,  label: 'Publier un bien', href: '/annonces/new',       color: 'green'  },
      { icon: CalendarDays,label: 'Mes visites',     href: '/dashboard/visites',  color: 'blue'   },
      { icon: User,        label: 'Mon profil',      href: '/dashboard/profil',   color: 'purple' },
    ]
  }

  // Chercheur
  return [
    { icon: Search,      label: 'Voir les annonces', href: '/annonces',           color: 'orange' },
    { icon: CalendarDays,label: 'Mes visites',        href: '/dashboard/visites', color: 'blue'   },
    { icon: User,        label: 'Mon profil',         href: '/dashboard/profil',  color: 'purple' },
  ]
}

const COLOR_MAP: Record<string, string> = {
  orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100',
  green:  'bg-green-50  text-green-600  hover:bg-green-100  border-green-100',
  blue:   'bg-blue-50   text-blue-600   hover:bg-blue-100   border-blue-100',
  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100',
  amber:  'bg-amber-50  text-amber-600  hover:bg-amber-100  border-amber-100',
  stone:  'bg-stone-50  text-stone-600  hover:bg-stone-100  border-stone-100',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Service_role pour garantir la lecture du profil quelle que soit la RLS
  const adminClient = createAdminClient()
  const { data: profileData } = await adminClient
    .from('profiles')
    .select('nom, role, email')
    .eq('id', user!.id)
    .single()

  const profile     = profileData as { nom: string; role: string; email: string } | null
  const role        = profile?.role ?? 'chercheur'
  const displayName = profile?.nom ?? user?.email?.split('@')[0] ?? 'Utilisateur'
  const config      = ROLE_CONFIG[role] ?? DEFAULT_CONFIG
  const canPublish  = ['proprietaire', 'agence', 'promoteur', 'agent', 'admin'].includes(role)
  const actionCards = getActionCards(role)

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-repim.png" alt="REPIM" width={100} height={32} className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/notifications"
              className="p-2 text-stone-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${config.avatar}`}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">
              Bonjour, {displayName}
            </h1>
            <p className="mt-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.badge}`}>
                {config.label}
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

        {/* Cartes d'action — adaptées au rôle */}
        <div className={`grid gap-4 mb-8 ${
          actionCards.length === 4
            ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-3'
        }`}>
          {actionCards.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors group ${COLOR_MAP[item.color]}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold flex-1 leading-tight">{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            )
          })}
        </div>

        {/* Infos & CTA */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Statut du compte */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4">
              Statut de votre compte
            </h2>
            <div className="space-y-3">
              {[
                {
                  icon: CheckCircle,
                  label: 'Email vérifié',
                  done:  true,
                },
                {
                  icon: CheckCircle,
                  label: 'Profil créé',
                  done:  !!profile,
                },
                {
                  icon: Clock,
                  label: canPublish ? 'Première annonce publiée' : 'Première visite demandée',
                  done:  false,
                },
              ].map(({ icon: Icon, label, done }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${done ? 'text-green-500' : 'text-stone-300'}`} />
                  <span className={`text-sm ${done ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
                    {label}
                  </span>
                  {!done && (
                    <span className="ml-auto text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      En attente
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA selon rôle */}
          {canPublish ? (
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
          ) : (
            <div className="bg-orange-500 rounded-2xl p-6 text-white flex flex-col justify-between">
              <div>
                <Home className="w-8 h-8 text-orange-200 mb-3" />
                <h3 className="font-bold text-lg leading-snug mb-2">
                  Trouvez votre logement
                </h3>
                <p className="text-orange-100 text-sm leading-relaxed">
                  Parcourez des annonces vérifiées à Abidjan et en Afrique de l&apos;Ouest.
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

        {/* Paramètres */}
        <div className="mt-6 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">Paramètres du compte</p>
                <p className="text-xs text-stone-400">{profile?.email ?? user?.email}</p>
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
