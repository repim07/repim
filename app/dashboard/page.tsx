// =============================================================================
// REPIM — Page principale du dashboard
// Adaptée selon le rôle de l'utilisateur et son statut de vérification KYC.
//
// Comportements clés :
// - chercheur         → vue recherche (pas de publication)
// - admin             → raccourcis vers la console admin
// - pro non vérifié   → tuiles de publication VERROUILLÉES + CTA KYC
// - pro vérifié       → accès complet à la publication
// =============================================================================

export const dynamic = 'force-dynamic'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logoutAction } from '@/actions/auth'
import Link from 'next/link'
import Image from 'next/image'
import type { ElementType } from 'react'
import {
  Home, PlusCircle, CalendarDays, User,
  LogOut, Bell, Settings, ChevronRight,
  Building, CheckCircle, Clock, Search,
  ShieldCheck, Lock, FileText,
} from 'lucide-react'

// ─── Rôles professionnels ─────────────────────────────────────────────────────
// Ces rôles ont un tunnel KYC et un statut de vérification.

const PRO_ROLES = new Set(['agence', 'promoteur', 'proprietaire', 'communaute', 'agent'])

// ─── Configuration d'affichage par rôle ──────────────────────────────────────

interface RoleConfig {
  label:  string   // affiché dans le badge sous le nom
  badge:  string   // classes Tailwind du badge
  avatar: string   // couleur de fond de l'initiale
}

const ROLE_CONFIG: Record<string, RoleConfig> = {
  chercheur:    { label: 'Chercheur',            badge: 'bg-blue-100    text-blue-700',   avatar: 'bg-blue-100    text-blue-700'   },
  proprietaire: { label: 'Propriétaire',         badge: 'bg-orange-100  text-orange-700', avatar: 'bg-orange-100  text-orange-700' },
  agence:       { label: 'Agence immobilière',   badge: 'bg-green-100   text-green-700',  avatar: 'bg-green-100   text-green-700'  },
  promoteur:    { label: 'Promoteur immobilier', badge: 'bg-violet-100  text-violet-700', avatar: 'bg-violet-100  text-violet-700' },
  communaute:   { label: 'Communauté villageoise', badge: 'bg-teal-100  text-teal-700',   avatar: 'bg-teal-100    text-teal-700'   },
  agent:        { label: 'Démarcheur / Agent',   badge: 'bg-pink-100    text-pink-700',   avatar: 'bg-pink-100    text-pink-700'   },
  admin:        { label: 'Administrateur',       badge: 'bg-stone-900   text-white',      avatar: 'bg-stone-900   text-white'      },
}

const DEFAULT_CONFIG: RoleConfig = {
  label: 'Utilisateur', badge: 'bg-stone-100 text-stone-600', avatar: 'bg-stone-100 text-stone-600',
}

// ─── Cartes d'action par rôle ─────────────────────────────────────────────────
// isVerified=false → les cartes de publication seront affichées verrouillées

interface ActionCard {
  icon:    ElementType
  label:   string
  href:    string
  color:   string
  locked?: boolean   // si true → affichage grisé + cadenas
}

function getActionCards(role: string, isVerified: boolean): ActionCard[] {

  // ── ADMIN ──
  if (role === 'admin') {
    return [
      { icon: ShieldCheck,  label: 'Console admin',          href: '/dashboard/admin',                color: 'amber'  },
      { icon: User,         label: 'Utilisateurs',           href: '/dashboard/admin/utilisateurs',   color: 'blue'   },
      { icon: CalendarDays, label: 'Mes visites',            href: '/dashboard/visites',              color: 'purple' },
      { icon: User,         label: 'Mon profil',             href: '/dashboard/profil',               color: 'stone'  },
    ]
  }

  // ── CHERCHEUR ──
  if (role === 'chercheur') {
    return [
      { icon: Search,       label: 'Voir les annonces',     href: '/annonces',            color: 'orange' },
      { icon: CalendarDays, label: 'Mes visites',           href: '/dashboard/visites',   color: 'blue'   },
      { icon: User,         label: 'Mon profil',            href: '/dashboard/profil',    color: 'purple' },
    ]
  }

  // ── PRO (agence, promoteur, proprietaire, communaute, agent) ──
  // Si non vérifié : les cartes publication sont verrouillées
  const canPublish = isVerified

  return [
    {
      icon:   Home,
      label:  'Mes annonces',
      href:   '/dashboard/annonces',
      color:  canPublish ? 'orange' : 'stone',
      locked: !canPublish,
    },
    {
      icon:   PlusCircle,
      label:  'Publier un bien',
      href:   canPublish ? '/annonces/new' : '/dashboard/kyc',
      color:  canPublish ? 'green' : 'stone',
      locked: !canPublish,
    },
    {
      icon:   CalendarDays,
      label:  'Mes visites',
      href:   '/dashboard/visites',
      color:  'blue',
    },
    {
      icon:   User,
      label:  'Mon profil',
      href:   '/dashboard/profil',
      color:  'purple',
    },
  ]
}

// ── Couleurs des cartes d'action ──────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100',
  green:  'bg-green-50  text-green-600  hover:bg-green-100  border-green-100',
  blue:   'bg-blue-50   text-blue-600   hover:bg-blue-100   border-blue-100',
  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100',
  amber:  'bg-amber-50  text-amber-600  hover:bg-amber-100  border-amber-100',
  stone:  'bg-stone-100 text-stone-400  border-stone-200',   // style "verrouillé"
}

// ─── Libellés du statut KYC ───────────────────────────────────────────────────

const KYC_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft:          { label: 'Dossier incomplet',         cls: 'text-amber-600 bg-amber-50' },
  pending_review: { label: 'En cours de vérification',  cls: 'text-blue-600  bg-blue-50'  },
  verified:       { label: 'Certifié ✓',                cls: 'text-green-600 bg-green-50' },
  rejected:       { label: 'Dossier rejeté',            cls: 'text-red-600   bg-red-50'   },
  suspended:      { label: 'Compte suspendu',           cls: 'text-white     bg-red-700'  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {

  // ─── 1. Récupération de l'utilisateur connecté ────────────────────────────
  const supabase    = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ─── 2. Lecture du profil (admin client = bypass RLS) ─────────────────────
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
  const isPro       = PRO_ROLES.has(role)

  // ─── 3. Si c'est un pro, lire son statut de vérification KYC ──────────────
  let verificationStatus: string | null = null
  let rejectionReason:    string | null = null

  if (isPro) {
    const { data: proRow } = await adminClient
      .from('pro_profiles')
      .select('verification_status, rejection_reason')
      .eq('id', user!.id)
      .single()

    verificationStatus =
      (proRow as { verification_status?: string; rejection_reason?: string | null } | null)
        ?.verification_status ?? 'draft'
    rejectionReason =
      (proRow as { verification_status?: string; rejection_reason?: string | null } | null)
        ?.rejection_reason ?? null
  }

  // ─── 4. Dérivation des états clés ─────────────────────────────────────────
  const isVerified  = verificationStatus === 'verified'
  // Tout PRO peut publier dès la création du compte.
  // Les annonces sont en statut "en_attente_validation" (provisoire) jusqu'à la certification KYC.
  const canPublish  = isPro
  const actionCards = getActionCards(role, true)  // true = toutes les tuiles déverrouillées
  const kycStatus   = verificationStatus ? KYC_STATUS_LABELS[verificationStatus] : null

  // ─── 5. Rendu ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Barre de navigation haute ────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logo-repim.png"
              alt="REPIM"
              width={100}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Icônes droite */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/notifications"
              className="p-2 text-stone-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>

            {/* Initiale de l'utilisateur */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${config.avatar}`}
              aria-hidden="true"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* ── Contenu principal ─────────────────────────────────────────────── */}
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── En-tête : nom + badge de rôle + déconnexion ─────────────────── */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">
              Bonjour, {displayName}
            </h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {/* Badge de rôle */}
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.badge}`}>
                {config.label}
              </span>

              {/* Badge de statut KYC (pros uniquement) */}
              {isPro && kycStatus && (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${kycStatus.cls}`}>
                  {kycStatus.label}
                </span>
              )}
            </div>
          </div>

          {/* Bouton déconnexion */}
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

        {/* ── Cartes d'action ──────────────────────────────────────────────── */}
        {/* Adaptées au rôle. Pour les pros non vérifiés, les cartes de       */}
        {/* publication sont grisées et affichent un cadenas.                 */}
        <div className={`grid gap-4 mb-8 ${
          actionCards.length === 4
            ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-3'
        }`}>
          {actionCards.map((item) => {
            const Icon = item.icon
            return item.locked ? (
              /* Carte verrouillée — pas cliquable */
              <div
                key={item.label}
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-not-allowed opacity-60 ${COLOR_MAP['stone']}`}
                title="Disponible après validation de votre dossier KYC"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 relative">
                  <Icon className="w-5 h-5" />
                  {/* Petit cadenas en surimpression */}
                  <Lock className="w-3 h-3 absolute -top-1 -right-1 text-stone-500" />
                </div>
                <span className="text-sm font-semibold flex-1 leading-tight">{item.label}</span>
                <Lock className="w-4 h-4 opacity-40 flex-shrink-0" />
              </div>
            ) : (
              /* Carte normale — cliquable */
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

        {/* ── Encart KYC pour les pros non vérifiés ────────────────────────── */}
        {/* Affiché uniquement si le pro n'est pas encore "verified"           */}
        {isPro && !isVerified && (
          <div className="mb-8 rounded-2xl border border-dashed border-orange-300 bg-orange-50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-stone-900 text-base mb-1">
                  Complétez votre certification REPIM
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed mb-3">
                  {verificationStatus === 'pending_review'
                    ? 'Votre dossier est déposé et en cours d\'examen. Merci de patienter.'
                    : verificationStatus === 'rejected'
                    ? 'Votre dossier a été refusé. Corrigez vos documents et renvoyez.'
                    : 'Déposez vos documents pour être certifié et commencer à publier des annonces visibles par tous.'}
                </p>

                {/* Raison du rejet (si applicable) */}
                {verificationStatus === 'rejected' && rejectionReason && (
                  <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <span className="font-semibold">Motif du rejet : </span>
                    {rejectionReason}
                  </div>
                )}

                {/* CTA vers le tunnel KYC */}
                {verificationStatus !== 'pending_review' && (
                  <Link
                    href="/dashboard/kyc"
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {verificationStatus === 'rejected'
                      ? 'Corriger mon dossier'
                      : 'Déposer mes documents'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Grille inférieure : statut du compte + CTA ───────────────────── */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Statut du compte ─────────────────────────────────────────────── */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4">
              Statut de votre compte
            </h2>
            <div className="space-y-3">

              {/* Étape 1 : Email vérifié */}
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
                <span className="text-sm text-stone-700 font-medium">Email vérifié</span>
              </div>

              {/* Étape 2 : Profil créé */}
              <div className="flex items-center gap-3">
                <CheckCircle className={`w-5 h-5 flex-shrink-0 ${profile ? 'text-green-500' : 'text-stone-300'}`} />
                <span className={`text-sm ${profile ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
                  Profil créé
                </span>
              </div>

              {/* Étape 3 : Certification KYC (pros uniquement) */}
              {isPro && (
                <div className="flex items-center gap-3">
                  {isVerified ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 flex-shrink-0 text-stone-300" />
                  )}
                  <span className={`text-sm ${isVerified ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
                    Certification KYC validée
                  </span>
                  {!isVerified && kycStatus && (
                    <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${kycStatus.cls}`}>
                      {kycStatus.label}
                    </span>
                  )}
                </div>
              )}

              {/* Étape finale : première action */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 text-stone-300" />
                <span className="text-sm text-stone-400">
                  {canPublish
                    ? 'Première annonce publiée'
                    : role === 'chercheur'
                    ? 'Première visite demandée'
                    : 'Première annonce publiée (après certification)'}
                </span>
                <span className="ml-auto text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                  En attente
                </span>
              </div>

            </div>
          </div>

          {/* CTA contextuel (droite) ────────────────────────────────────────── */}
          {canPublish ? (
            /* Pro vérifié → CTA publication */
            <div className="bg-orange-500 rounded-2xl p-6 text-white flex flex-col justify-between">
              <div>
                <Building className="w-8 h-8 text-orange-200 mb-3" />
                <h3 className="font-bold text-lg leading-snug mb-2">
                  Publiez votre premier bien
                </h3>
                <p className="text-orange-100 text-sm leading-relaxed">
                  Votre annonce sera visible par des milliers d&apos;acheteurs et locataires en Côte d&apos;Ivoire.
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

          ) : isPro ? (
            /* Pro NON vérifié → peut publier en provisoire + CTA KYC */
            <div className="bg-orange-500 rounded-2xl p-6 text-white flex flex-col justify-between">
              <div>
                <Building className="w-8 h-8 text-orange-200 mb-3" />
                <h3 className="font-bold text-lg leading-snug mb-2">
                  Publiez des maintenant
                </h3>
                <p className="text-orange-100 text-sm leading-relaxed mb-3">
                  Vos annonces sont visibles en mode <span className="font-bold">provisoire</span> jusqu&apos;a la validation de votre dossier KYC.
                </p>
                {verificationStatus !== 'pending_review' && (
                  <Link
                    href="/dashboard/kyc"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-200 hover:text-white transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Completer mon dossier KYC pour debloquer
                  </Link>
                )}
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
            /* Chercheur → CTA annonces */
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
                <Search className="w-4 h-4" />
                Voir les annonces
              </Link>
            </div>
          )}

        </div>

        {/* ── Paramètres du compte ─────────────────────────────────────────── */}
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
            <Link
              href="/dashboard/profil"
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Modifier
            </Link>
          </div>
        </div>

        {/* ── Lien admin (si l'utilisateur a le rôle admin) ────────────────── */}
        {role === 'admin' && (
          <div className="mt-4 text-center">
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-orange-500"
            >
              <ShieldCheck className="w-4 h-4" />
              Accéder à la console administrateur
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
