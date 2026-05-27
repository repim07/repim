'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { inscrirePartenaire } from '@/actions/partenaires'
import type { CategoriePartenaire } from '@/types/partenaires'
import {
  Building2, Mail, Lock, ArrowRight, Eye, EyeOff,
  ChevronLeft, ChevronDown, CheckCircle, Shield,
  Briefcase, Scale, FileText, BarChart3, Home,
  Wrench, BadgeCheck,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: {
  value: CategoriePartenaire
  label: string
  icon: React.ElementType
  description: string
}[] = [
  { value: 'agence',           label: 'Agence immobilière',      icon: Home,      description: 'Agences certifiées, mandataires' },
  { value: 'promoteur',        label: 'Promoteur immobilier',    icon: BarChart3, description: 'Promotion, construction, lotissement' },
  { value: 'notaire',          label: 'Notaire',                 icon: Scale,     description: 'Offices notariaux officiels' },
  { value: 'cabinet_juridique',label: 'Cabinet juridique',       icon: FileText,  description: 'Avocats, juristes spécialisés' },
  { value: 'assurance',        label: 'Assurance',               icon: Shield,    description: 'Assurances habitation & garantie' },
  { value: 'huissier',         label: 'Huissier de justice',     icon: Scale,     description: 'Constats, significations, recouvrements' },
  { value: 'architecte',       label: 'Architecte & Déco',       icon: Wrench,    description: 'Architectes, décorateurs d\'intérieur' },
  { value: 'conseiller',       label: 'Conseiller immobilier',   icon: BadgeCheck,description: 'Experts, consultants, évaluateurs' },
  { value: 'autre',            label: 'Autre professionnel',     icon: Briefcase, description: 'Autres métiers de l\'immobilier' },
]

const AVANTAGES = [
  'Visibilité auprès de 750 000+ utilisateurs',
  'Publication illimitée d\'annonces',
  'Tableau de bord de gestion avancé',
  'Badge partenaire vérifié sur votre profil',
  'Accès aux statistiques et leads qualifiés',
  '21 jours d\'essai gratuit sans engagement',
]

// ─────────────────────────────────────────────────────────────────────────────
// Composant CategorySelect
// ─────────────────────────────────────────────────────────────────────────────

function CategorySelect({
  value,
  onChange,
}: {
  value: CategoriePartenaire | ''
  onChange: (v: CategoriePartenaire) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = CATEGORIES.find((c) => c.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-3 border rounded-xl px-4 py-3 text-sm transition-all focus:outline-none ${
          value
            ? 'border-orange-400 ring-2 ring-orange-100 text-stone-800'
            : 'border-stone-200 text-stone-400 hover:border-stone-300'
        }`}
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <selected.icon className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-stone-700 font-medium">{selected.label}</span>
            </>
          ) : (
            <>
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              <span>Sélectionner une catégorie</span>
            </>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180 text-orange-500' : 'text-stone-400'}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl z-20 overflow-hidden max-h-72 overflow-y-auto">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => { onChange(cat.value); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors ${
                  value === cat.value ? 'bg-orange-50' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  value === cat.value ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${value === cat.value ? 'text-orange-600' : 'text-stone-800'}`}>
                    {cat.label}
                  </p>
                  <p className="text-xs text-stone-400 truncate">{cat.description}</p>
                </div>
                {value === cat.value && (
                  <CheckCircle className="w-4 h-4 text-orange-500 ml-auto flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Formulaire principal (client, lit les searchParams)
// ─────────────────────────────────────────────────────────────────────────────

function InscriptionFormContent() {
  const searchParams = useSearchParams()
  const categorieParam = searchParams.get('categorie') as CategoriePartenaire | null
  const categorieValide = CATEGORIES.find((c) => c.value === categorieParam)?.value ?? ''

  const [categorie, setCategorie] = useState<CategoriePartenaire | ''>(categorieValide)
  const [showPwd,   setShowPwd]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [isPending, start]        = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!categorie) { setError('Veuillez sélectionner une catégorie.'); return }
    setError(null)

    const fd = new FormData(e.currentTarget)
    fd.set('categorie', categorie)

    start(async () => {
      try {
        const res = await inscrirePartenaire(fd)
        if (res?.error) setError(res.error)
      } catch {
        setError('Une erreur inattendue s\'est produite.')
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-stone-50">

      {/* Header sticky */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-repim.png" alt="REPIM" width={100} height={32} className="h-8 w-auto object-contain" />
          </Link>
          <Link href="/auth/login" className="text-xs text-stone-500 hover:text-orange-500 transition-colors">
            Déjà partenaire ? <span className="font-semibold text-orange-500">Se connecter</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-500 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>

        {/* Layout : colonne unique mobile, 2 colonnes desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 lg:gap-12 lg:items-start gap-6">

          {/* ── Colonne gauche : avantages ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">

            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5" />
              Espace Partenaires
            </div>

            <h1 className="text-2xl font-extrabold text-stone-900 leading-tight mb-3">
              Rejoignez le réseau{' '}
              <span className="text-orange-500">REPIM Pro</span>
            </h1>

            <p className="text-stone-500 text-sm leading-relaxed mb-5">
              Développez votre activité immobilière en Côte d&apos;Ivoire et en Afrique.
              Accédez à des milliers de clients qualifiés.
            </p>

            {/* Avantages */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-4">
              <h2 className="text-xs font-bold text-stone-700 uppercase tracking-widest mb-3">
                Ce que vous obtenez
              </h2>
              <ul className="space-y-2.5">
                {AVANTAGES.map((a) => (
                  <li key={a} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-stone-600">{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Catégories acceptées — masqué sur mobile pour gagner de l'espace */}
            <div className="hidden lg:block bg-orange-950 rounded-2xl p-5">
              <p className="text-orange-300 text-xs font-bold uppercase tracking-widest mb-3">
                Partenaires acceptés
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <div key={cat.value} className="flex items-center gap-2 text-xs text-orange-200">
                      <Icon className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      {cat.label}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Colonne droite : formulaire ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5 sm:p-7">

              <div className="mb-6">
                <h2 className="text-lg font-extrabold text-stone-900">
                  Créer votre compte professionnel
                </h2>
                <p className="text-stone-400 text-xs mt-1">
                  21 jours d&apos;essai gratuit · Sans engagement
                </p>
                <div className="mt-3 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-orange-500 rounded-full" />
                </div>
              </div>

              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Nom de la structure */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Nom de la structure <span className="text-orange-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <Building2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <input
                      name="nom_structure" type="text" required minLength={2} maxLength={200}
                      placeholder="ex : Cabinet Kouassi & Associés"
                      className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Catégorie <span className="text-orange-500">*</span>
                  </label>
                  <CategorySelect
                    value={categorie}
                    onChange={(v) => { setCategorie(v); setError(null) }}
                  />
                </div>

                {/* Séparateur */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-stone-400 font-medium">Informations de connexion</span>
                  </div>
                </div>

                {/* Email professionnel */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Email professionnel <span className="text-orange-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <input
                      name="email" type="email" required autoComplete="email"
                      placeholder="contact@votre-structure.ci"
                      className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Mot de passe <span className="text-orange-500">*</span>{' '}
                    <span className="text-stone-400 font-normal">(min. 8 caractères)</span>
                  </label>
                  <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <Lock className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <input
                      name="password" type={showPwd ? 'text' : 'password'}
                      required minLength={8} autoComplete="new-password"
                      placeholder="••••••••••"
                      className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                    />
                    <button
                      type="button" onClick={() => setShowPwd(!showPwd)}
                      className="text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0"
                      aria-label={showPwd ? 'Masquer' : 'Afficher'}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-sm mt-1"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2.5">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Création en cours…
                    </span>
                  ) : (
                    <>
                      Créer mon compte et choisir un abonnement
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-stone-400">
                  En créant un compte, vous acceptez les{' '}
                  <a href="#" className="text-orange-400 hover:underline">CGU de REPIM</a>
                  {' '}et la{' '}
                  <a href="#" className="text-orange-400 hover:underline">politique de confidentialité</a>.
                </p>
              </form>

              <div className="mt-5 pt-5 border-t border-stone-100 text-center">
                <p className="text-sm text-stone-500">
                  Déjà un compte partenaire ?{' '}
                  <Link href="/auth/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-400">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              Connexion sécurisée SSL · Données chiffrées · Conforme RGPD
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Export — Suspense obligatoire avec useSearchParams en Next.js 16
// ─────────────────────────────────────────────────────────────────────────────

export default function InscriptionPartenairePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <InscriptionFormContent />
    </Suspense>
  )
}
