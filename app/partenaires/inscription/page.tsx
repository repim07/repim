'use client'

// =============================================================================
// REPIM — Inscription Partenaires & Prestataires immobiliers
// Wizard 3 etapes :
//   1. Informations de base (nom, email, tel, ville)
//   2. Specialisation (categorie + logo/photo de profil)
//   3. Choix du plan + tunnel de paiement (simule)
// =============================================================================

import { useState, useRef, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { creerComptePartenaire } from '@/actions/partenaires'
import type { CategoriePartenaire } from '@/types/partenaires'
import {
  Building2, Mail, Lock, Phone, MapPin, ArrowRight, ArrowLeft,
  Eye, EyeOff, CheckCircle, Shield, Briefcase, Scale, FileText,
  BarChart3, Home, Wrench, BadgeCheck, ChevronLeft, Star, Zap,
  Upload, X, CreditCard, Smartphone, Wallet,
} from 'lucide-react'

// =============================================================================
// DONNEES STATIQUES
// =============================================================================

// Categories de prestataires immobiliers
const CATEGORIES: {
  value: CategoriePartenaire
  label: string
  icon:  React.ElementType
  desc:  string
}[] = [
  { value: 'notaire',          label: 'Notaire',                     icon: Scale,      desc: 'Offices notariaux, actes authentiques' },
  { value: 'architecte',       label: 'Architecte & Decorateur',     icon: Wrench,     desc: 'Architectes, architectes d\'interieur, decorateurs' },
  { value: 'huissier',         label: 'Huissier de justice',         icon: Scale,      desc: 'Constats, significations, recouvrements' },
  { value: 'cabinet_juridique',label: 'Cabinet juridique',           icon: FileText,   desc: 'Avocats, juristes specialises en immobilier' },
  { value: 'assurance',        label: 'Assurance',                   icon: Shield,     desc: 'Assurances habitation, garantie locative' },
  { value: 'conseiller',       label: 'Conseiller immobilier',       icon: BadgeCheck, desc: 'Experts, consultants, evaluateurs agrees' },
  { value: 'geometre',         label: 'Geometre-Expert',             icon: BarChart3,  desc: 'Bornage, topographie, plans fonciers' },
  { value: 'agence',           label: 'Agence immobiliere',          icon: Home,       desc: 'Agences agreees, mandataires' },
  { value: 'promoteur',        label: 'Promoteur immobilier',        icon: Building2,  desc: 'Promotion, construction, lotissement' },
  { value: 'autre',            label: 'Autre professionnel',         icon: Briefcase,  desc: 'Autre metier lie a l\'immobilier' },
]

// Avantages du reseau REPIM Pro
const AVANTAGES = [
  'Visibilite aupres de 750 000+ utilisateurs',
  'Publication illimitee d\'annonces',
  'Tableau de bord de gestion avance',
  'Badge partenaire verifie sur votre profil',
  'Acces aux statistiques et leads qualifies',
  '21 jours d\'essai gratuit sans engagement',
]

// Plans d\'abonnement
const PLANS = [
  { id: 'mensuel',     label: 'Mensuel',     price: '20 000',  devise: 'XOF/mois',   euro: '~30 EUR',   popular: false },
  { id: 'trimestriel', label: 'Trimestriel', price: '56 500',  devise: 'XOF/trim.',  euro: '~86 EUR',   popular: false },
  { id: 'semestriel',  label: 'Semestriel',  price: '115 000', devise: 'XOF/6 mois', euro: '~175 EUR',  popular: true  },
  { id: 'annuel',      label: 'Annuel',      price: '200 000', devise: 'XOF/an',     euro: '~305 EUR',  popular: false },
]

// Moyens de paiement (geres par GeniusPay automatiquement)
const PAIEMENTS = [
  { id: 'geniuspay',  label: 'GeniusPay',   icon: CreditCard,  desc: 'Visa, Mastercard, Mobile Money' },
  { id: 'orange',     label: 'Orange Money', icon: Smartphone,  desc: 'Paiement mobile Orange CI' },
  { id: 'wave',       label: 'Wave',         icon: Wallet,      desc: 'Paiement mobile Wave' },
  { id: 'mtn',        label: 'MTN MoMo',     icon: Smartphone,  desc: 'Mobile Money MTN' },
]

// =============================================================================
// STEPPER INDICATEUR (pastilles + barre de progression)
// =============================================================================

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Informations' },
    { n: 2, label: 'Specialisation' },
    { n: 3, label: 'Abonnement' },
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, idx) => {
        const done    = step.n < current
        const active  = step.n === current
        const pct     = ((current - 1) / (steps.length - 1)) * 100

        return (
          <div key={step.n} className="flex items-center">
            {/* Pastille */}
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                done
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : active
                  ? 'bg-white border-orange-500 text-orange-500 shadow-md'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}>
                {done
                  ? <CheckCircle className="w-4 h-4" />
                  : <span className="text-xs">{step.n}</span>
                }
              </div>
              <span className={`mt-1.5 text-[10px] font-semibold whitespace-nowrap ${
                active ? 'text-orange-600' : done ? 'text-orange-400' : 'text-stone-400'
              }`}>
                {step.label}
              </span>
            </div>

            {/* Connecteur */}
            {idx < steps.length - 1 && (
              <div className="mx-2 mb-5 relative w-16 sm:w-24 h-0.5 bg-stone-200 overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-orange-500 transition-all duration-500"
                  style={{ width: step.n < current ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// =============================================================================
// FORMULAIRE PRINCIPAL (client)
// =============================================================================

function InscriptionWizard() {
  const searchParams   = useSearchParams()
  const catParam       = searchParams.get('categorie') as CategoriePartenaire | null
  const catInitiale    = CATEGORIES.find((c) => c.value === catParam)?.value ?? ''

  // ── Etat global du wizard ──
  const [step,          setStep]          = useState<1 | 2 | 3>(1)
  const [error,         setError]         = useState<string | null>(null)
  const [isPending,     start]            = useTransition()

  // ── Donnees step 1 ──
  const [nom,           setNom]           = useState('')
  const [email,         setEmail]         = useState('')
  const [telephone,     setTelephone]     = useState('')
  const [ville,         setVille]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPwd,       setShowPwd]       = useState(false)

  // ── Donnees step 2 ──
  const [categorie,     setCategorie]     = useState<CategoriePartenaire | ''>(catInitiale)
  const [autreActivite, setAutreActivite] = useState('')
  const [logo,          setLogo]         = useState<File | null>(null)
  const [logoPreview,   setLogoPreview]  = useState<string | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  // ── Donnees step 3 ──
  const [planChoisi,    setPlanChoisi]    = useState<string>('semestriel')
  const [paiement,      setPaiement]     = useState<string>('geniuspay')
  const [submitted,     setSubmitted]    = useState(false)

  // ── Navigation entre etapes ──
  function nextStep() {
    setError(null)
    setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prevStep() {
    setError(null)
    setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3)
  }

  // ── Validation step 1 ──
  function validateStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!nom.trim() || nom.length < 2) { setError('Le nom de la structure est requis (min. 2 caracteres).'); return }
    if (!email.trim()) { setError('L\'email professionnel est requis.'); return }
    if (!telephone.trim()) { setError('Le numero de telephone est requis.'); return }
    if (!password || password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caracteres.'); return }
    nextStep()
  }

  // ── Validation step 2 ──
  function validateStep2(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!categorie) { setError('Veuillez selectionner une categorie.'); return }
    if (categorie === 'autre' && !autreActivite.trim()) { setError('Veuillez preciser votre activite.'); return }
    nextStep()
  }

  // ── Gestion du logo ──
  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Le logo ne doit pas depasser 5 Mo.'); return }
    setLogo(file)
    setLogoPreview(URL.createObjectURL(file))
    setError(null)
  }

  function removeLogo() {
    setLogo(null)
    setLogoPreview(null)
    if (logoRef.current) logoRef.current.value = ''
  }

  // ── Soumission finale (step 3) ──
  // Flux : creerComptePartenaire() → /api/payments/genius-pay → redirect paymentUrl
  function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd = new FormData()
    fd.set('nom_structure', nom)
    fd.set('email',         email)
    fd.set('password',      password)
    fd.set('categorie',     categorie)
    if (logo) fd.set('logo', logo)

    start(async () => {
      try {
        // Etape 1 : creation du compte (server action, sans redirect)
        const compteRes = await creerComptePartenaire(fd)
        if ('error' in compteRes) {
          setError(compteRes.error)
          return
        }

        // Etape 2 : initiation du paiement GeniusPay
        const gpRes = await fetch('/api/payments/genius-pay', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            plan:  planChoisi,
            phone: telephone,
          }),
        })

        const gpData = await gpRes.json() as { paymentUrl?: string; error?: string }

        if (!gpRes.ok || !gpData.paymentUrl) {
          // Le compte est cree mais le paiement a echoue — rediriger vers le dashboard
          // pour que l'utilisateur puisse reessayer depuis son espace.
          const msg = gpData.error ?? 'Erreur passerelle de paiement.'
          console.error('[wizard] GeniusPay error:', msg)
          // On redirige quand meme vers le dashboard (essai gratuit actif)
          window.location.href = '/dashboard?paiement=echec'
          return
        }

        // Etape 3 : redirection vers la page de paiement GeniusPay
        window.location.href = gpData.paymentUrl
      } catch (err: unknown) {
        console.error('[wizard] submit error:', err)
        setError('Une erreur inattendue s\'est produite. Veuillez reessayer.')
      }
    })
  }

  // Pas d'ecran de succes ici — la redirection va vers /paiement/succes via GeniusPay

  // ==========================================================================
  // RENDU PRINCIPAL
  // ==========================================================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-stone-50">

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-repim.png" alt="REPIM" width={100} height={32} className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200">
              <Zap className="w-3 h-3" />
              21 jours gratuits
            </div>
            <Link href="/auth/login" className="text-xs text-stone-500 hover:text-orange-500 transition-colors">
              Deja partenaire ? <span className="font-semibold text-orange-500">Se connecter</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-500 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Retour a l&apos;accueil
        </Link>

        {/* Layout 2 colonnes desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 lg:gap-12 lg:items-start gap-6">

          {/* ── Colonne gauche : avantages (sticky) ─────────────────────── */}
          <aside className="lg:col-span-2 lg:sticky lg:top-24">

            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5" />
              Espace Partenaires
            </div>

            <h1 className="text-2xl font-extrabold text-stone-900 leading-tight mb-3">
              Rejoignez le reseau{' '}
              <span className="text-orange-500">REPIM Pro</span>
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed mb-5">
              Developpez votre activite immobiliere en Cote d&apos;Ivoire et en Afrique.
              Acces a des milliers de clients qualifies.
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

            {/* Banniere 21 jours */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-md mb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-sm">21 jours d&apos;essai gratuit</p>
                  <p className="text-orange-100 text-xs mt-0.5 leading-relaxed">
                    Sans engagement, sans carte bancaire. Publiez vos coordonnees des maintenant.
                  </p>
                </div>
              </div>
            </div>

            {/* Categories acceptees */}
            <div className="hidden lg:block bg-orange-950 rounded-2xl p-5">
              <p className="text-orange-300 text-xs font-bold uppercase tracking-widest mb-3">
                Prestataires acceptes
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
          </aside>

          {/* ── Colonne droite : wizard ─────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5 sm:p-7">

              {/* Indicateur d'etapes */}
              <StepIndicator current={step} />

              {/* Messages d'erreur */}
              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">&#9888;</span>
                  <span>{error}</span>
                </div>
              )}

              {/* ── STEP 1 : Informations de base ────────────────────── */}
              {step === 1 && (
                <form onSubmit={validateStep1} className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-extrabold text-stone-900">Vos informations</h2>
                    <p className="text-stone-400 text-xs mt-1">Etape 1 sur 3 &mdash; Informations de base</p>
                  </div>

                  {/* Nom / Raison sociale */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Nom / Raison sociale <span className="text-orange-500">*</span>
                    </label>
                    <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      <Building2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      <input type="text" required minLength={2} maxLength={200}
                        value={nom} onChange={(e) => setNom(e.target.value)}
                        placeholder="ex : Cabinet Kouassi & Associes"
                        className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Email professionnel <span className="text-orange-500">*</span>
                    </label>
                    <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      <input type="email" required
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@votre-cabinet.ci"
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
                      <input type="tel" required
                        value={telephone} onChange={(e) => setTelephone(e.target.value)}
                        placeholder="+225 07 00 00 00 00"
                        className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                    </div>
                  </div>

                  {/* Ville / Zone d'activite */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Ville / Zone d&apos;activite <span className="text-orange-500">*</span>
                    </label>
                    <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      <input type="text" required
                        value={ville} onChange={(e) => setVille(e.target.value)}
                        placeholder="ex : Abidjan, Cocody"
                        className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Mot de passe <span className="text-orange-500">*</span>
                      <span className="text-stone-400 font-normal text-xs ml-1">(min. 8 caracteres)</span>
                    </label>
                    <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      <Lock className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      <input type={showPwd ? 'text' : 'password'} required minLength={8}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                        className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="text-stone-400 hover:text-stone-600 flex-shrink-0">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-4 rounded-xl transition-colors shadow-md text-sm tracking-wide mt-2">
                    Etape suivante : Specialisation
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ── STEP 2 : Specialisation ──────────────────────────── */}
              {step === 2 && (
                <form onSubmit={validateStep2} className="space-y-5">
                  <div className="mb-6">
                    <h2 className="text-lg font-extrabold text-stone-900">Votre specialisation</h2>
                    <p className="text-stone-400 text-xs mt-1">Etape 2 sur 3 &mdash; Choisissez votre categorie</p>
                  </div>

                  {/* Grille de categories */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-3">
                      Categorie de prestataire <span className="text-orange-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CATEGORIES.map((cat) => {
                        const Icon     = cat.icon
                        const selected = categorie === cat.value
                        return (
                          <button key={cat.value} type="button"
                            onClick={() => { setCategorie(cat.value); setError(null) }}
                            className={`group relative text-left p-3 rounded-xl border-2 transition-all duration-150 ${
                              selected
                                ? 'border-orange-500 bg-orange-50 shadow-sm'
                                : 'border-stone-100 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                            }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                              selected ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500 group-hover:bg-orange-100 group-hover:text-orange-500'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <p className={`text-xs font-bold leading-tight mb-0.5 ${selected ? 'text-orange-700' : 'text-stone-800'}`}>
                              {cat.label}
                            </p>
                            <p className="text-[10px] text-stone-400 leading-tight hidden sm:block">{cat.desc}</p>
                            {selected && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="w-4 h-4 text-orange-500" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Champ libre si "autre" */}
                  {categorie === 'autre' && (
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                        Precisez votre activite <span className="text-orange-500">*</span>
                      </label>
                      <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                        <Briefcase className="w-4 h-4 text-stone-400 flex-shrink-0" />
                        <input type="text" required
                          value={autreActivite} onChange={(e) => setAutreActivite(e.target.value)}
                          placeholder="ex : Diagnostiqueur immobilier, Home stager..."
                          className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
                      </div>
                    </div>
                  )}

                  {/* Upload logo / photo de profil */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                      Logo ou photo de profil
                      <span className="text-stone-400 font-normal ml-1">(optionnel, max 5 Mo)</span>
                    </label>

                    {logoPreview ? (
                      <div className="relative flex items-center gap-4 p-4 border border-green-200 bg-green-50 rounded-xl">
                        <img src={logoPreview} alt="Preview"
                          className="w-16 h-16 rounded-xl object-cover border border-green-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-green-800 truncate">{logo?.name}</p>
                          <p className="text-xs text-green-600">{logo ? (logo.size / 1024).toFixed(0) + ' Ko' : ''}</p>
                        </div>
                        <button type="button" onClick={removeLogo}
                          className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-500 flex-shrink-0 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => logoRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl py-8 transition-all">
                        <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                          <Upload className="w-5 h-5 text-stone-400" />
                        </div>
                        <p className="text-sm font-medium text-stone-500">Cliquez pour choisir un fichier</p>
                        <p className="text-xs text-stone-400">PNG, JPG, SVG &mdash; Max 5 Mo</p>
                      </button>
                    )}
                    <input ref={logoRef} type="file" accept="image/*" className="hidden"
                      onChange={handleLogoChange} />
                  </div>

                  {/* Navigation step 2 */}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={prevStep}
                      className="flex items-center gap-2 px-5 py-3 border border-stone-200 text-stone-600 font-semibold rounded-xl hover:border-stone-300 transition-colors text-sm">
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button type="submit"
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl transition-colors shadow-md text-sm tracking-wide">
                      Etape suivante : Abonnement
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 3 : Tunnel de paiement (simule) ─────────────── */}
              {step === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-5">
                  <div className="mb-4">
                    <h2 className="text-lg font-extrabold text-stone-900">Votre abonnement</h2>
                    <p className="text-stone-400 text-xs mt-1">Etape 3 sur 3 &mdash; Choisissez votre plan</p>
                  </div>

                  {/* Banniere 21 jours */}
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-800 font-semibold">
                      21 jours d&apos;essai gratuit &mdash; aucun paiement immediate requis
                    </p>
                  </div>

                  {/* Plans */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-3">
                      Choisissez un plan <span className="text-stone-400 font-normal">(applique apres l&apos;essai)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {PLANS.map((plan) => {
                        const selected = planChoisi === plan.id
                        return (
                          <button key={plan.id} type="button"
                            onClick={() => setPlanChoisi(plan.id)}
                            className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                              selected
                                ? 'border-orange-500 bg-orange-50 shadow-sm'
                                : 'border-stone-100 bg-white hover:border-orange-200'
                            }`}>
                            {plan.popular && (
                              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap uppercase tracking-widest">
                                Populaire
                              </span>
                            )}
                            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${selected ? 'text-orange-600' : 'text-stone-400'}`}>
                              {plan.label}
                            </p>
                            <p className={`text-xl font-extrabold mb-0.5 ${selected ? 'text-stone-900' : 'text-stone-700'}`}>
                              {plan.price}
                            </p>
                            <p className="text-xs text-stone-400">{plan.devise}</p>
                            <p className="text-xs text-stone-400">{plan.euro}</p>
                            {selected && (
                              <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-orange-500" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Moyen de paiement */}
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-3">
                      Moyen de paiement
                      <span className="text-stone-400 font-normal ml-1">(vous serez redirige vers la page de paiement)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {PAIEMENTS.map((pm) => {
                        const Icon     = pm.icon
                        const selected = paiement === pm.id
                        return (
                          <button key={pm.id} type="button"
                            onClick={() => setPaiement(pm.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                              selected
                                ? 'border-orange-500 bg-orange-50 shadow-sm'
                                : 'border-stone-100 bg-white hover:border-orange-200'
                            }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              selected ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 text-left">
                              <p className={`text-xs font-bold ${selected ? 'text-orange-700' : 'text-stone-800'}`}>
                                {pm.label}
                              </p>
                              <p className="text-[10px] text-stone-400 truncate">{pm.desc}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Recapitulatif */}
                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 text-sm space-y-1.5">
                    <p className="font-bold text-stone-800 text-xs uppercase tracking-widest mb-2">Recapitulatif</p>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Structure</span>
                      <span className="font-semibold text-stone-800 truncate max-w-[180px]">{nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Email</span>
                      <span className="font-semibold text-stone-800 truncate max-w-[180px]">{email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Categorie</span>
                      <span className="font-semibold text-stone-800">
                        {CATEGORIES.find((c) => c.value === categorie)?.label ?? '—'}
                        {categorie === 'autre' && autreActivite ? ` (${autreActivite})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Plan choisi</span>
                      <span className="font-semibold text-orange-600">
                        {PLANS.find((p) => p.id === planChoisi)?.price} {PLANS.find((p) => p.id === planChoisi)?.devise}
                      </span>
                    </div>
                    <div className="border-t border-stone-200 pt-2 mt-2 flex justify-between text-green-700 font-bold">
                      <span>Aujourd&apos;hui</span>
                      <span>GRATUIT (21 jours d&apos;essai)</span>
                    </div>
                  </div>

                  {/* Navigation step 3 */}
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={prevStep}
                      className="flex items-center gap-2 px-5 py-3 border border-stone-200 text-stone-600 font-semibold rounded-xl hover:border-stone-300 transition-colors text-sm">
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button type="submit" disabled={isPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-xl transition-colors shadow-md text-sm tracking-wide">
                      {isPending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Creation du compte...
                        </>
                      ) : (
                        <>
                          VALIDER ET PAYER
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-xs text-stone-400">
                    En vous inscrivant, vous acceptez les{' '}
                    <a href="/conditions-generales" className="text-orange-400 hover:underline">CGU de REPIM</a>
                    {' '}et la{' '}
                    <a href="/politique-de-confidentialite" className="text-orange-400 hover:underline">politique de confidentialite</a>.
                  </p>
                </form>
              )}

              {/* Lien connexion bas du formulaire */}
              <div className="mt-5 pt-5 border-t border-stone-100 text-center">
                <p className="text-sm text-stone-500">
                  Deja un compte partenaire ?{' '}
                  <Link href="/auth/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-400">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              Connexion securisee SSL &middot; Donnees chiffrees &middot; Conforme RGPD
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// =============================================================================
// Export — Suspense obligatoire avec useSearchParams en Next.js 16
// =============================================================================

export default function InscriptionPartenairePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <InscriptionWizard />
    </Suspense>
  )
}
