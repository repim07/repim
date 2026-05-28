'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createProAccount } from '@/actions/auth'
import {
  Building2, BadgeCheck, Home, Users, User as UserIcon,
  Search, Mail, Lock, Phone, ArrowRight, Eye, EyeOff,
  ChevronLeft, ChevronRight, CheckCircle, FileText, ShieldCheck,
  Zap, Star,
} from 'lucide-react'

// =============================================================================
// Avantages PRO — liste des 6 points mis en avant
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
// Catalogue des roles PRO
// =============================================================================

type ProRole = 'agence' | 'promoteur' | 'proprietaire' | 'communaute' | 'agent'

type RoleConfig = {
  value:        ProRole
  label:        string
  tagline:      string
  icon:         React.ElementType
  needsCompany: boolean
  kycSummary:   string   // Simplifie : sans RCCM ni DFE
  badgeFuture:  string
  isPro:        boolean  // affiche le badge "PRO" sur la carte
}

// 4 cartes principales
const PRIMARY_ROLES: RoleConfig[] = [
  {
    value:        'agence',
    label:        'PRO Agence',
    tagline:      'Vous gerez un portefeuille de biens pour des clients',
    icon:         Building2,
    needsCompany: true,
    kycSummary:   'Agrement MCLU + CNI du dirigeant',
    badgeFuture:  'Agence agreee',
    isPro:        true,
  },
  {
    value:        'promoteur',
    label:        'PRO Promoteur',
    tagline:      'Vous construisez et commercialisez vos programmes',
    icon:         BadgeCheck,
    needsCompany: true,
    kycSummary:   'Agrement MCLU + CNI du dirigeant',
    badgeFuture:  'Promoteur agree',
    isPro:        true,
  },
  {
    value:        'proprietaire',
    label:        'Proprietaire',
    tagline:      'Vous louez ou vendez directement votre bien',
    icon:         Home,
    needsCompany: false,
    kycSummary:   'CNI ou passeport (piece d\'identite)',
    badgeFuture:  'Proprietaire verifie',
    isPro:        false,
  },
  {
    value:        'communaute',
    label:        'Mandataire PRO',
    tagline:      'Vous representez une famille, un village, un lotissement',
    icon:         Users,
    needsCompany: false,
    kycSummary:   'CNI + Attestation villageoise ou avis de lotissement',
    badgeFuture:  'Mandataire verifie',
    isPro:        true,
  },
]

// Option secondaire
const AGENT_ROLE: RoleConfig = {
  value:        'agent',
  label:        'Mandataire PRO',
  tagline:      'Vous mettez en relation acheteurs et vendeurs en freelance',
  icon:         UserIcon,
  needsCompany: false,
  kycSummary:   'CNI + Mandat signe du proprietaire ou carte pro',
  badgeFuture:  'Mandataire verifie',
  isPro:        true,
}

// =============================================================================
// Composant principal — Wizard 2 etapes
// =============================================================================

export default function SignupPage() {
  const [step,       setStep]     = useState<'select' | 'form'>('select')
  const [selected,   setSelected] = useState<RoleConfig | null>(null)
  const [showPwd,    setShowPwd]  = useState(false)
  const [error,      setError]    = useState<string | null>(null)
  const [isPending,  start]       = useTransition()

  function chooseRole(role: RoleConfig) {
    setSelected(role)
    setError(null)
    setStep('form')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <main className="min-h-screen bg-stone-50 flex flex-col">

      {/* Header */}
      <header className="border-b border-stone-200/60 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Retour accueil REPIM">
            <Image src="/logo-repim.png" alt="REPIM" width={110} height={36}
              className="h-9 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-4">
            {/* Badge 14 jours */}
            <div className="hidden sm:flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200">
              <Zap className="w-3 h-3" />
              14 jours d&apos;essai gratuit
            </div>
            <Link href="/auth/login" className="text-sm text-stone-600 hover:text-orange-600 transition-colors">
              Deja inscrit ?{' '}
              <span className="font-semibold text-orange-600">Se connecter</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-5xl">

          {step === 'select' ? (
            // =================================================================
            // STEP 1 — Selection visuelle du role
            // =================================================================
            <div className="animate-fade-in-up">

              {/* CTA chercheur en haut */}
              <div className="mb-10 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-semibold mb-3">
                  Vous cherchez un bien a louer ou a acheter ?
                </p>
                <Link href="/auth/signup/chercheur"
                  className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-orange-600 underline underline-offset-4 decoration-stone-300 hover:decoration-orange-400 transition-colors">
                  <Search className="w-4 h-4" />
                  Creer un compte chercheur (gratuit, sans dossier)
                </Link>
              </div>

              {/* Titre */}
              <div className="text-center mb-10 max-w-2xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                  Vous etes professionnel
                  <span className="block text-orange-600">de l&apos;immobilier ?</span>
                </h1>
                <p className="mt-4 text-stone-500 text-base leading-relaxed">
                  Choisissez votre profil et publiez vos annonces <strong>des maintenant</strong>.
                  Acces immediat &mdash; 14 jours d&apos;essai gratuit &mdash; certification a votre rythme.
                </p>
              </div>

              {/* Banniere 14 jours essai */}
              <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-base">14 jours d&apos;essai gratuit sans engagement</p>
                    <p className="text-orange-100 text-sm">Publiez vos annonces immediatement &mdash; aucune carte bancaire requise</p>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-white text-orange-600 text-xs font-extrabold px-4 py-2 rounded-xl shadow-sm whitespace-nowrap">
                  Offre PRO
                </div>
              </div>

              {/* 4 cartes principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {PRIMARY_ROLES.map((role) => {
                  const Icon = role.icon
                  return (
                    <button key={role.value} type="button" onClick={() => chooseRole(role)}
                      className="group relative text-left bg-white border border-stone-200 rounded-2xl p-5 hover:border-orange-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-h-[260px] flex flex-col">

                      {/* Badge PRO */}
                      {role.isPro && (
                        <span className="absolute top-3 right-3 text-[9px] font-extrabold tracking-widest bg-orange-500 text-white px-1.5 py-0.5 rounded-md uppercase">
                          PRO
                        </span>
                      )}

                      <div className="w-12 h-12 rounded-xl bg-stone-100 group-hover:bg-orange-500 text-stone-600 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-stone-900 mb-1.5 leading-tight pr-6">
                        {role.label}
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed mb-4 flex-1">
                        {role.tagline}
                      </p>
                      <div className="pt-4 mt-auto border-t border-stone-100">
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mb-1">
                          Document requis
                        </p>
                        <p className="text-[11px] text-stone-600 leading-snug mb-3">
                          {role.kycSummary}
                        </p>
                        <div className="flex items-center text-sm font-semibold text-stone-700 group-hover:text-orange-600 transition-colors">
                          Continuer
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Option secondaire */}
              <div className="border-t border-stone-200/60 pt-8 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-semibold mb-3">
                  Vous travaillez en tant que demarcheur independant ?
                </p>
                <button type="button" onClick={() => chooseRole(AGENT_ROLE)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-orange-600 underline underline-offset-4 decoration-stone-300 hover:decoration-orange-400 transition-colors">
                  <UserIcon className="w-4 h-4" />
                  Inscrire mon profil Mandataire PRO
                </button>
              </div>

              {/* Reassurance */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-400">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  Inscription securisee
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Publication immediate en mode provisoire
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-green-500" />
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

                      {/* Note document requis (simplifie) */}
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
