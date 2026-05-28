'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createProAccount } from '@/actions/auth'
import {
  Building2, BadgeCheck, Home, Users, User as UserIcon,
  Search, Mail, Lock, Phone, ArrowRight, Eye, EyeOff,
  ChevronLeft, ChevronRight, CheckCircle, FileText, ShieldCheck,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Catalogue des rôles pros
// ─────────────────────────────────────────────────────────────────────────────
// Aligné sur les valeurs de `profiles.role` en DB et sur la fonction
// `required_doc_types_for_role()` de supabase/pro_signup.sql.

type ProRole = 'agence' | 'promoteur' | 'proprietaire' | 'communaute' | 'agent'

type RoleConfig = {
  value:        ProRole
  label:        string
  tagline:      string             // Phrase d'accroche sur la carte
  icon:         React.ElementType
  needsCompany: boolean            // Affiche le champ "Raison sociale" dans le form
  kycSummary:   string             // Récap des documents qui seront demandés ensuite
  badgeFuture:  string             // Badge qui apparaîtra une fois certifié
}

// 4 cartes principales (ordre d'affichage importe pour l'UX)
const PRIMARY_ROLES: RoleConfig[] = [
  {
    value:        'agence',
    label:        'Agence immobilière',
    tagline:      'Vous gérez un portefeuille de biens pour des clients',
    icon:         Building2,
    needsCompany: true,
    kycSummary:   'Agrément MCLU · RCCM · DFE · CNI du dirigeant',
    badgeFuture:  'Agence agréée',
  },
  {
    value:        'promoteur',
    label:        'Promoteur immobilier',
    tagline:      'Vous construisez et commercialisez vos programmes',
    icon:         BadgeCheck,
    needsCompany: true,
    kycSummary:   'Agrément MCLU · RCCM · DFE · CNI du dirigeant',
    badgeFuture:  'Promoteur agréé',
  },
  {
    value:        'proprietaire',
    label:        'Propriétaire particulier',
    tagline:      'Vous louez ou vendez directement votre bien',
    icon:         Home,
    needsCompany: false,
    kycSummary:   'Une pièce d’identité (CNI ou passeport)',
    badgeFuture:  'Propriétaire vérifié',
  },
  {
    value:        'communaute',
    label:        'Communauté / Mandataire',
    tagline:      'Vous représentez une famille, un village, un lotissement',
    icon:         Users,
    needsCompany: false,
    kycSummary:   'CNI · Attestation villageoise ou avis de lotissement',
    badgeFuture:  'Mandataire vérifié',
  },
]

// Option secondaire (lien discret en bas)
const AGENT_ROLE: RoleConfig = {
  value:        'agent',
  label:        'Démarcheur indépendant',
  tagline:      'Vous mettez en relation acheteurs et vendeurs en freelance',
  icon:         UserIcon,
  needsCompany: false,
  kycSummary:   'CNI · Mandat signé du propriétaire ou carte professionnelle',
  badgeFuture:  'Démarcheur vérifié',
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal — Wizard 2 étapes
// ─────────────────────────────────────────────────────────────────────────────

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
    // Scroll en haut pour mobile (sinon on reste au milieu de la page)
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
        // Si succès, createProAccount() fait un redirect('/dashboard') côté serveur
      } catch (err: unknown) {
        if (err instanceof Error && (err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err
        setError('Une erreur inattendue s’est produite.')
      }
    })
  }

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col">

      {/* ── Header simple et discret ──────────────────────────────────────── */}
      <header className="border-b border-stone-200/60 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Retour à l’accueil REPIM">
            <Image
              src="/logo-repim.png"
              alt="REPIM"
              width={110} height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-stone-600 hover:text-orange-600 transition-colors"
          >
            Déjà inscrit ?{' '}
            <span className="font-semibold text-orange-600">Se connecter</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-4xl">

          {step === 'select' ? (
            // ═══════════════════════════════════════════════════════════════
            // STEP 1 — Sélection visuelle du profil
            // ═══════════════════════════════════════════════════════════════
            <div className="animate-fade-in-up">

              {/* CTA secondaire en haut : compte chercheur */}
              <div className="mb-12 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-semibold mb-3">
                  Vous cherchez un bien à louer ou à acheter ?
                </p>
                <Link
                  href="/auth/signup/chercheur"
                  className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-orange-600 underline underline-offset-4 decoration-stone-300 hover:decoration-orange-400 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Créer un compte chercheur (gratuit, sans dossier à fournir)
                </Link>
              </div>

              {/* Titre éditorial */}
              <div className="text-center mb-12 max-w-2xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                  Vous êtes professionnel
                  <span className="block text-orange-600">de l’immobilier ?</span>
                </h1>
                <p className="mt-5 text-stone-500 text-base leading-relaxed">
                  Choisissez votre profil pour démarrer. Vous accéderez immédiatement
                  à votre espace en mode brouillon, et compléterez votre dossier
                  de certification à votre rythme.
                </p>
              </div>

              {/* ── 4 cartes principales ─────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {PRIMARY_ROLES.map((role) => {
                  const Icon = role.icon
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => chooseRole(role)}
                      className="group relative text-left bg-white border border-stone-200 rounded-2xl p-5 hover:border-orange-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-h-[280px] flex flex-col"
                    >
                      <div className="w-12 h-12 rounded-xl bg-stone-100 group-hover:bg-orange-500 text-stone-600 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>

                      <h3 className="text-base font-bold text-stone-900 mb-1.5 leading-tight">
                        {role.label}
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed mb-4 flex-1">
                        {role.tagline}
                      </p>

                      <div className="pt-4 mt-auto border-t border-stone-100">
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mb-1">
                          Pièces requises
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

              {/* Option secondaire : démarcheur */}
              <div className="border-t border-stone-200/60 pt-8 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-semibold mb-3">
                  Vous travaillez en tant que démarcheur indépendant ?
                </p>
                <button
                  type="button"
                  onClick={() => chooseRole(AGENT_ROLE)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-orange-600 underline underline-offset-4 decoration-stone-300 hover:decoration-orange-400 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Inscrire mon profil démarcheur
                </button>
              </div>

              {/* Réassurance bas de page */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-400">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  Inscription sécurisée
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Accès immédiat en mode brouillon
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-green-500" />
                  Validation des pièces sous 48h
                </span>
              </div>
            </div>

          ) : (
            // ═══════════════════════════════════════════════════════════════
            // STEP 2 — Formulaire dynamique (champs conditionnels par rôle)
            // ═══════════════════════════════════════════════════════════════
            <div className="animate-fade-in-up">

              <button
                type="button"
                onClick={backToSelection}
                className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-600 mb-8 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Changer de profil
              </button>

              <div className="max-w-xl mx-auto">

                {/* Badge profil sélectionné */}
                {selected && (
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-[0.15em]">
                      <selected.icon className="w-3.5 h-3.5" />
                      {selected.label}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                      Créez votre compte
                    </h2>
                    <p className="mt-2 text-stone-500 text-sm leading-relaxed max-w-md mx-auto">
                      Quelques informations de base, et vous accédez à votre espace.
                      Les pièces justificatives viendront ensuite.
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8">

                  {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ── CHAMP CONDITIONNEL : Raison sociale (agence/promoteur) ── */}
                    {selected?.needsCompany && (
                      <div className="animate-fade-in-up">
                        <label htmlFor="raison_sociale" className="block text-sm font-semibold text-stone-700 mb-1.5">
                          Raison sociale <span className="text-orange-500">*</span>
                        </label>
                        <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                          <Building2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
                          <input
                            id="raison_sociale"
                            name="raison_sociale"
                            type="text"
                            required
                            minLength={2}
                            maxLength={200}
                            placeholder={
                              selected.value === 'agence'
                                ? 'ex : Cabinet Kouassi Immobilier'
                                : 'ex : Société Promotion Abidjan SA'
                            }
                            className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {/* Prénom + Nom en ligne sur desktop, empilés sur mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="prenom" className="block text-sm font-semibold text-stone-700 mb-1.5">
                          Prénom <span className="text-orange-500">*</span>
                        </label>
                        <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                          <UserIcon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                          <input
                            id="prenom" name="prenom" type="text"
                            required minLength={2} maxLength={100}
                            autoComplete="given-name"
                            placeholder="Jean"
                            className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="nom" className="block text-sm font-semibold text-stone-700 mb-1.5">
                          Nom <span className="text-orange-500">*</span>
                        </label>
                        <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                          <UserIcon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                          <input
                            id="nom" name="nom" type="text"
                            required minLength={2} maxLength={100}
                            autoComplete="family-name"
                            placeholder="Konan"
                            className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email pro */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-1.5">
                        Email professionnel <span className="text-orange-500">*</span>
                      </label>
                      <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                        <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                        <input
                          id="email" name="email" type="email"
                          required autoComplete="email"
                          placeholder={
                            selected?.needsCompany
                              ? 'contact@votre-structure.ci'
                              : 'votre@email.com'
                          }
                          className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label htmlFor="telephone" className="block text-sm font-semibold text-stone-700 mb-1.5">
                        Téléphone <span className="text-orange-500">*</span>
                      </label>
                      <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                        <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
                        <input
                          id="telephone" name="telephone" type="tel"
                          required autoComplete="tel"
                          placeholder="+225 07 00 00 00 00"
                          className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Mot de passe */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-1.5">
                        Mot de passe <span className="text-orange-500">*</span>{' '}
                        <span className="text-stone-400 font-normal text-xs">(min. 8 caractères)</span>
                      </label>
                      <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                        <Lock className="w-4 h-4 text-stone-400 flex-shrink-0" />
                        <input
                          id="password" name="password"
                          type={showPwd ? 'text' : 'password'}
                          required minLength={8} autoComplete="new-password"
                          placeholder="••••••••••"
                          className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          className="text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0"
                          aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Récap des docs qui seront demandés (réassurance) */}
                    {selected && (
                      <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-stone-700 mb-1">
                              Prochaine étape : votre dossier de certification
                            </p>
                            <p className="text-xs text-stone-500 leading-relaxed">
                              {selected.kycSummary}. Vos annonces resteront en brouillon
                              jusqu’à la validation du dossier par notre équipe (~48h).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-sm mt-1"
                    >
                      {isPending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Création du compte…
                        </>
                      ) : (
                        <>
                          Créer mon compte et accéder à mon espace
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-stone-400">
                      En créant un compte, vous acceptez nos{' '}
                      <Link href="/conditions-generales" className="text-orange-500 hover:underline">
                        conditions générales
                      </Link>{' '}
                      et notre{' '}
                      <Link href="/politique-de-confidentialite" className="text-orange-500 hover:underline">
                        politique de confidentialité
                      </Link>.
                    </p>
                  </form>
                </div>

                {/* Note importante : verrouillage du rôle */}
                {selected && (
                  <p className="mt-6 text-center text-xs text-stone-400 inline-flex items-center justify-center gap-1.5 w-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                    Votre profil « {selected.label} » est figé et ne pourra plus être modifié après la création
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
