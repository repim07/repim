'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createProAccount } from '@/actions/auth'
import {
  Building2, BadgeCheck, Home, Users, User as UserIcon, Briefcase,
  Search, Mail, Lock, Phone, ArrowRight, Eye, EyeOff,
  ChevronLeft, ChevronRight, CheckCircle, FileText, ShieldCheck,
  Zap, Star,
} from 'lucide-react'

// =============================================================================
// Avantages PRO
// =============================================================================
const AVANTAGES_PRO = [
  'Visibilite aupres de 750 000+ utilisateurs',
  'Publication illimitee d\'annonces',
  'Tableau de bord de gestion avance',
  'Badge partenaire verifie sur votre profil',
  'Acces aux statistiques et leads qualifies',
  '14 jours d\'essai gratuit sans engagement (PRO)',
]

// =============================================================================
// Types
// =============================================================================
type ProRole = 'agence' | 'promoteur' | 'proprietaire' | 'communaute' | 'agent'

type RoleConfig = {
  value:        ProRole
  label:        string
  tagline:      string
  icon:         React.ElementType
  needsCompany: boolean
  kycSummary:   string
  badgeFuture:  string
  isPro:        boolean
}

// Definit une entree dans la grille de selection (toutes egales)
type CardDef = {
  id:       string
  label:    string
  tagline:  string
  icon:     React.ElementType
  badge:    string
  badgeCls: string  // classes du badge (couleur)
  iconCls:  string  // classes du container icone
  href?:    string  // navigation directe (chercheur)
  role?:    RoleConfig // selection role pro
}

// =============================================================================
// Catalogue des roles PRO
// =============================================================================
const PRIMARY_ROLES: RoleConfig[] = [
  {
    value:        'agence',
    label:        'Agence Immobiliere',
    tagline:      'Gerez un portefeuille de biens pour vos clients',
    icon:         Building2,
    needsCompany: true,
    kycSummary:   'Agrement MCLU + CNI du dirigeant',
    badgeFuture:  'Agence agreee',
    isPro:        true,
  },
  {
    value:        'promoteur',
    label:        'Promoteur',
    tagline:      'Construisez et commercialisez vos programmes',
    icon:         BadgeCheck,
    needsCompany: true,
    kycSummary:   'Agrement MCLU + CNI du dirigeant',
    badgeFuture:  'Promoteur agree',
    isPro:        true,
  },
  {
    value:        'proprietaire',
    label:        'Proprietaire',
    tagline:      'Louez ou vendez votre bien directement',
    icon:         Home,
    needsCompany: false,
    kycSummary:   'CNI ou passeport (piece d\'identite)',
    badgeFuture:  'Proprietaire verifie',
    isPro:        false,
  },
  {
    value:        'communaute',
    label:        'Mandataire PRO',
    tagline:      'Representez une famille, un village ou un lotissement',
    icon:         Users,
    needsCompany: false,
    kycSummary:   'CNI + Attestation villageoise ou avis de lotissement',
    badgeFuture:  'Mandataire verifie',
    isPro:        true,
  },
]

const AGENT_ROLE: RoleConfig = {
  value:        'agent',
  label:        'Demarcheur Independant',
  tagline:      'Mettez en relation acheteurs et vendeurs en freelance',
  icon:         Briefcase,
  needsCompany: false,
  kycSummary:   'CNI + Mandat signe du proprietaire ou carte pro',
  badgeFuture:  'Mandataire verifie',
  isPro:        true,
}

// =============================================================================
// Grille unifiee — 6 cartes de taille identique
// Ordre : Chercheur · Demarcheur · Agence · Promoteur · Proprietaire · Mandataire
// =============================================================================
const ALL_CARDS: CardDef[] = [
  {
    id:       'chercheur',
    label:    'Chercheur',
    tagline:  'Recherchez un bien a louer ou a acheter',
    icon:     Search,
    badge:    'PARTICULIER',
    badgeCls: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    iconCls:  'bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 group-hover:text-sky-300',
    href:     '/auth/signup/chercheur',
  },
  {
    id:       'agent',
    label:    'Demarcheur',
    tagline:  'Mettez en relation acheteurs et vendeurs',
    icon:     Briefcase,
    badge:    'SOLO',
    badgeCls: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
    iconCls:  'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300',
    role:     AGENT_ROLE,
  },
  {
    id:       'agence',
    label:    'Agence Immobiliere',
    tagline:  'Gerez un portefeuille pour vos clients',
    icon:     Building2,
    badge:    'PRO',
    badgeCls: 'bg-orange-500 text-white',
    iconCls:  'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 group-hover:text-orange-300',
    role:     PRIMARY_ROLES[0],
  },
  {
    id:       'promoteur',
    label:    'Promoteur',
    tagline:  'Construisez et commercialisez vos programmes',
    icon:     BadgeCheck,
    badge:    'PRO',
    badgeCls: 'bg-orange-500 text-white',
    iconCls:  'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 group-hover:text-orange-300',
    role:     PRIMARY_ROLES[1],
  },
  {
    id:       'proprietaire',
    label:    'Proprietaire',
    tagline:  'Louez ou vendez votre bien directement',
    icon:     Home,
    badge:    'INDEP',
    badgeCls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    iconCls:  'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300',
    role:     PRIMARY_ROLES[2],
  },
  {
    id:       'mandataire',
    label:    'Mandataire PRO',
    tagline:  'Representez une famille ou un lotissement',
    icon:     Users,
    badge:    'PRO',
    badgeCls: 'bg-orange-500 text-white',
    iconCls:  'bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300',
    role:     PRIMARY_ROLES[3],
  },
]

// =============================================================================
// Composant principal — Wizard 2 etapes
// =============================================================================
export default function SignupPage() {
  const router = useRouter()

  const [step,      setStep]     = useState<'select' | 'form'>('select')
  const [selected,  setSelected] = useState<RoleConfig | null>(null)
  const [showPwd,   setShowPwd]  = useState(false)
  const [error,     setError]    = useState<string | null>(null)
  const [isPending, start]       = useTransition()

  const isDark = step === 'select'

  // Clic sur une carte de la grille
  function handleCardClick(card: CardDef) {
    if (card.href) {
      router.push(card.href)
      return
    }
    if (card.role) {
      setSelected(card.role)
      setError(null)
      setStep('form')
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function backToSelection() {
    setStep('select')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return
    setError(null)

    const fd = new FormData(e.currentTarget)
    fd.set('role', selected.value)

    start(async () => {
      try {
        const res = await createProAccount(fd)
        if (res?.error) setError(res.error)
      } catch (err: unknown) {
        if (err instanceof Error && (err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err
        setError('Une erreur inattendue s\'est produite.')
      }
    })
  }

  // ===========================================================================

  return (
    <main
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? 'bg-[#080e1a]' : 'bg-stone-50'
      }`}
    >

      {/* ── Header (adaptatif dark/light) ───────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${
          isDark
            ? 'bg-slate-900/95 border-slate-800/60 backdrop-blur-md'
            : 'bg-white border-stone-200/60'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Retour accueil REPIM">
            <Image
              src="/logo-repim.png" alt="REPIM"
              width={110} height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            {/* Badge essai */}
            <div
              className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                isDark
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  : 'bg-orange-50 text-orange-600 border-orange-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              14 jours d&apos;essai gratuit
            </div>
            <Link
              href="/auth/login"
              className={`text-sm transition-colors ${
                isDark ? 'text-slate-400 hover:text-sky-400' : 'text-stone-600 hover:text-orange-600'
              }`}
            >
              Deja inscrit ?{' '}
              <span className={`font-semibold ${isDark ? 'text-sky-400' : 'text-orange-600'}`}>
                Se connecter
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-5xl">

          {step === 'select' ? (
            // =================================================================
            // STEP 1 — Grille de selection (theme bleu marine)
            // =================================================================
            <div className="animate-fade-in-up">

              {/* Titre + eyebrow */}
              <div className="text-center mb-10 max-w-2xl mx-auto">

                {/* Eyebrow pill */}
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-extrabold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
                  <Zap className="w-3 h-3" />
                  14 jours gratuits &mdash; aucune carte bancaire
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Quel est votre
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400">
                    profil REPIM ?
                  </span>
                </h1>
                <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                  Choisissez votre statut, publiez vos annonces et certifiez votre compte a votre rythme.
                </p>
              </div>

              {/* ── Grille : 6 cartes identiques (2 cols mobile, 3 cols sm+) ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
                {ALL_CARDS.map((card) => {
                  const Icon = card.icon
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleCardClick(card)}
                      className={`
                        group relative flex flex-col items-center text-center
                        bg-slate-800/50 border border-slate-700/50
                        rounded-2xl p-4 sm:p-5
                        h-52 sm:h-56
                        cursor-pointer
                        hover:bg-slate-800/80
                        hover:border-sky-500/40
                        hover:shadow-[0_0_40px_-8px_rgba(56,189,248,0.3)]
                        active:scale-[0.97]
                        transition-all duration-300
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50
                        focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                      `}
                    >
                      {/* Badge top-right */}
                      <span
                        className={`
                          absolute top-3 right-3
                          text-[8px] sm:text-[9px] font-extrabold tracking-widest
                          px-1.5 py-0.5 rounded-md uppercase
                          ${card.badgeCls}
                        `}
                      >
                        {card.badge}
                      </span>

                      {/* Icone */}
                      <div
                        className={`
                          w-12 h-12 sm:w-14 sm:h-14 rounded-2xl
                          flex items-center justify-center
                          mb-3 sm:mb-4 flex-shrink-0
                          transition-all duration-300
                          ${card.iconCls}
                        `}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>

                      {/* Label */}
                      <h3 className="text-xs sm:text-sm font-extrabold text-white leading-snug mb-1.5 px-1">
                        {card.label}
                      </h3>

                      {/* Tagline — 1 ligne max */}
                      <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug line-clamp-2 group-hover:text-slate-300 transition-colors px-1">
                        {card.tagline}
                      </p>

                      {/* CTA */}
                      <div className="mt-auto pt-2 flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold text-slate-600 group-hover:text-sky-400 transition-colors">
                        Choisir ce profil
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Reassurance */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Inscription securisee
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Publication immediate en mode provisoire
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  Certification sous 48h (1 seul document)
                </span>
              </div>
            </div>

          ) : (
            // =================================================================
            // STEP 2 — Formulaire avec panneau avantages a gauche
            // =================================================================
            <div className="animate-fade-in-up">

              <button type="button" onClick={backToSelection}
                className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-600 mb-8 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Changer de profil
              </button>

              <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

                {/* ── Colonne gauche : avantages (sticky desktop) ─────────── */}
                <div className="lg:col-span-2 lg:sticky lg:top-24">

                  {/* Badge role selectionne */}
                  {selected && (
                    <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-[0.15em]">
                      <selected.icon className="w-3.5 h-3.5" />
                      {selected.label}
                    </div>
                  )}

                  {/* Titre section */}
                  <h2 className="text-xl font-extrabold text-stone-900 mb-2">
                    Rejoignez le reseau{' '}
                    <span className="text-orange-500">REPIM Pro</span>
                  </h2>
                  <p className="text-stone-500 text-sm leading-relaxed mb-5">
                    Developpez votre activite immobiliere et touchez des milliers de clients qualifies.
                  </p>

                  {/* Liste des 6 avantages */}
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-4">
                    <h3 className="text-xs font-bold text-stone-600 uppercase tracking-widest mb-3">
                      Ce que vous obtenez
                    </h3>
                    <ul className="space-y-2.5">
                      {AVANTAGES_PRO.map((avantage) => (
                        <li key={avantage} className="flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-stone-600 leading-snug">{avantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Banniere 14 jours essai */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm">14 jours d&apos;essai gratuit</p>
                        <p className="text-orange-100 text-xs mt-0.5 leading-relaxed">
                          Sans engagement, sans carte bancaire. Publiez des maintenant.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Colonne droite : formulaire ────────────────────────── */}
                <div className="lg:col-span-3">

                  <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8">

                    <div className="mb-6">
                      <h2 className="text-lg font-extrabold text-stone-900">
                        Creer votre compte
                      </h2>
                      <p className="text-stone-400 text-xs mt-1">
                        Quelques informations, puis acces immediat a votre espace.
                      </p>
                    </div>

                    {error && (
                      <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">&#9888;</span>
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                      {/* CONDITIONNEL : Raison sociale (agence/promoteur) */}
                      {selected?.needsCompany && (
                        <div>
                          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                            Raison sociale <span className="text-orange-500">*</span>
                          </label>
                          <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                            <Building2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
                            <input name="raison_sociale" type="text" required minLength={2} maxLength={200}
                              placeholder={selected.value === 'agence' ? 'ex : Cabinet Kouassi Immobilier' : 'ex : Societe Promotion Abidjan SA'}
                              className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                          </div>
                        </div>
                      )}

                      {/* Prenom + Nom */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                            Prenom <span className="text-orange-500">*</span>
                          </label>
                          <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                            <UserIcon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                            <input name="prenom" type="text" required minLength={2} maxLength={100}
                              autoComplete="given-name" placeholder="Jean"
                              className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                            Nom <span className="text-orange-500">*</span>
                          </label>
                          <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                            <UserIcon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                            <input name="nom" type="text" required minLength={2} maxLength={100}
                              autoComplete="family-name" placeholder="Konan"
                              className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                          Email professionnel <span className="text-orange-500">*</span>
                        </label>
                        <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                          <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                          <input name="email" type="email" required autoComplete="email"
                            placeholder={selected?.needsCompany ? 'contact@votre-structure.ci' : 'votre@email.com'}
                            className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                        </div>
                      </div>

                      {/* Telephone */}
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                          Telephone <span className="text-orange-500">*</span>
                        </label>
                        <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                          <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
                          <input name="telephone" type="tel" required autoComplete="tel"
                            placeholder="+225 07 00 00 00 00"
                            className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                        </div>
                      </div>

                      {/* Mot de passe */}
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                          Mot de passe <span className="text-orange-500">*</span>{' '}
                          <span className="text-stone-400 font-normal text-xs">(min. 8 caracteres)</span>
                        </label>
                        <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                          <Lock className="w-4 h-4 text-stone-400 flex-shrink-0" />
                          <input name="password" type={showPwd ? 'text' : 'password'}
                            required minLength={8} autoComplete="new-password"
                            placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                            className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                          <button type="button" onClick={() => setShowPwd(!showPwd)}
                            className="text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0"
                            aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Note document requis */}
                      {selected && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-blue-800 mb-0.5">
                                Certification requise apres inscription
                              </p>
                              <p className="text-xs text-blue-600 leading-relaxed">
                                {selected.kycSummary}. Vos annonces sont publiees en mode provisoire
                                pendant l&apos;examen de votre dossier (~48h).
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bouton VALIDER MON INSCRIPTION */}
                      <button type="submit" disabled={isPending}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-xl transition-colors shadow-md text-sm tracking-wide mt-2">
                        {isPending ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Creation du compte...
                          </>
                        ) : (
                          <>
                            VALIDER MON INSCRIPTION
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-stone-400">
                        En creant un compte, vous acceptez nos{' '}
                        <Link href="/conditions-generales" className="text-orange-500 hover:underline">
                          conditions generales
                        </Link>{' '}
                        et notre{' '}
                        <Link href="/politique-de-confidentialite" className="text-orange-500 hover:underline">
                          politique de confidentialite
                        </Link>.
                      </p>
                    </form>
                  </div>

                  {/* Note verrouillage de role */}
                  {selected && (
                    <p className="mt-5 text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                      Votre profil &laquo;{selected.label}&raquo; est definitif et ne peut pas etre modifie apres creation
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
