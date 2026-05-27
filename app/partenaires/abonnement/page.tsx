'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { initierPaiement } from '@/actions/partenaires'
import { PLANS, type PlanAbonnement } from '@/lib/partenaires-config'
import {
  CheckCircle, Shield, ArrowRight, Phone, ChevronLeft,
  Zap, Star, Crown, Rocket, Building2, Loader2,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Provider = 'wave' | 'orange_money' | 'mtn' | 'genuispay'

const PROVIDERS: { value: Provider; label: string; color: string; bg: string; logo: string }[] = [
  { value: 'wave',         label: 'Wave',         color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',   logo: '🌊' },
  { value: 'orange_money', label: 'Orange Money', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', logo: '🟠' },
  { value: 'mtn',          label: 'MTN MoMo',     color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', logo: '🟡' },
  { value: 'genuispay',    label: 'GeniusPay',    color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', logo: '💜' },
]

const PLAN_ICONS: Record<PlanAbonnement, React.ElementType> = {
  mensuel:     Zap,
  trimestriel: Star,
  semestriel:  Rocket,
  annuel:      Crown,
}

const PLAN_POPULAR: PlanAbonnement = 'trimestriel'

function formatPrix(prix: number) {
  return prix.toLocaleString('fr-FR') + ' XOF'
}

function prixParMois(plan: PlanAbonnement): string {
  const { prix, dureeJours } = PLANS[plan]
  const mois = dureeJours / 30
  return formatPrix(Math.round(prix / mois))
}

function remise(plan: PlanAbonnement): number | null {
  const base = PLANS.mensuel.prix
  const { prix, dureeJours } = PLANS[plan]
  const mois = dureeJours / 30
  if (mois <= 1) return null
  const sans = base * mois
  return Math.round(((sans - prix) / sans) * 100)
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant PlanCard
// ─────────────────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: PlanAbonnement
  selected: boolean
  onSelect: () => void
}) {
  const info     = PLANS[plan]
  const Icon     = PLAN_ICONS[plan]
  const popular  = plan === PLAN_POPULAR
  const discount = remise(plan)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full text-left rounded-2xl border-2 p-5 transition-all focus:outline-none ${
        selected
          ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100'
          : popular
          ? 'border-orange-200 bg-white hover:border-orange-400'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
          ★ Populaire
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            selected ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500'
          }`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className={`font-bold text-sm ${selected ? 'text-orange-600' : 'text-stone-800'}`}>
              {info.label}
            </p>
            <p className="text-xs text-stone-400">{info.dureeJours} jours</p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-lg font-extrabold leading-none ${selected ? 'text-orange-600' : 'text-stone-900'}`}>
            {formatPrix(info.prix)}
          </p>
          {info.dureeJours > 30 && (
            <p className="text-xs text-stone-400 mt-0.5">{prixParMois(plan)}/mois</p>
          )}
        </div>
      </div>

      {discount && (
        <div className="mt-3 inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Économisez {discount}%
        </div>
      )}

      {selected && (
        <div className="mt-3 flex items-center gap-1.5 text-orange-600 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          Plan sélectionné
        </div>
      )}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────

export default function AbonnementPage() {
  const [plan,     setPlan]     = useState<PlanAbonnement>('trimestriel')
  const [provider, setProvider] = useState<Provider | null>(null)
  const [phone,    setPhone]    = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)
  const [isPending, start]      = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!provider) { setError('Veuillez choisir un opérateur Mobile Money.'); return }
    if (!phone.trim()) { setError('Veuillez saisir votre numéro Mobile Money.'); return }
    setError(null)

    start(async () => {
      const res = await initierPaiement({ plan, provider, phone: phone.trim() })
      if ('error' in res) {
        setError(res.error)
      } else {
        // ── GeniusPay / Wave : redirection ou affichage du code USSD ──────────
        // Quand la vraie API sera intégrée :
        //   • Si res.paymentUrl  → window.location.href = res.paymentUrl
        //   • Si res.paymentCode → afficher le code USSD à composer sur le téléphone
        setSuccess(
          res.paymentCode
            ? `Composez le code ${res.paymentCode} sur votre téléphone pour finaliser le paiement.`
            : 'Paiement initié. Suivez les instructions sur votre téléphone.'
        )
      }
    })
  }

  const planInfo = PLANS[plan]

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-stone-50">

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-repim.png" alt="REPIM" width={110} height={36} className="h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            Paiement sécurisé
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb / étapes */}
        <div className="flex items-center gap-3 mb-10">
          <Link href="/partenaires/inscription" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-orange-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Étape 1 : Compte
          </Link>
          <div className="w-8 h-px bg-stone-200" />
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600">
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">2</span>
            Choisir un abonnement
          </span>
        </div>

        {/* Titre */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5" />
            Étape finale
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-3">
            Activez votre accès partenaire
          </h1>
          <p className="text-stone-500 text-sm max-w-xl mx-auto">
            Choisissez la formule qui correspond à votre activité. Paiement 100&nbsp;% Mobile Money — Wave, Orange Money, MTN ou GeniusPay.
          </p>
        </div>

        {success ? (
          /* ── État de succès ─────────────────────────────────────────────── */
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-green-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 mb-2">Paiement initié !</h2>
            <p className="text-stone-600 text-sm mb-6">{success}</p>
            <div className="bg-stone-50 rounded-xl p-4 text-left mb-6">
              <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-2">Récapitulatif</p>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Plan</span>
                <span className="font-semibold text-stone-800">{planInfo.label}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-stone-600">Montant</span>
                <span className="font-semibold text-orange-600">{formatPrix(planInfo.prix)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-stone-600">Opérateur</span>
                <span className="font-semibold text-stone-800">{PROVIDERS.find(p => p.value === provider)?.label}</span>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Accéder au tableau de bord
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-5 gap-8 items-start">

              {/* ── Colonne gauche : plans ── */}
              <div className="lg:col-span-3 space-y-4">
                <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-5">
                  1. Choisissez votre formule
                </h2>

                {(Object.keys(PLANS) as PlanAbonnement[]).map((p) => (
                  <PlanCard
                    key={p}
                    plan={p}
                    selected={plan === p}
                    onSelect={() => setPlan(p)}
                  />
                ))}

                {/* Garanties */}
                <div className="mt-6 rounded-2xl border border-stone-100 bg-white p-5">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Inclus dans tous les plans</p>
                  <ul className="space-y-2">
                    {[
                      'Annonces illimitées',
                      'Badge partenaire vérifié',
                      'Tableau de bord analytique',
                      'Accès aux leads qualifiés',
                      'Support dédié partenaires',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                        <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── Colonne droite : paiement ── */}
              <div className="lg:col-span-2 lg:sticky lg:top-24 space-y-5">

                {/* Récap plan sélectionné */}
                <div className="bg-orange-950 rounded-2xl p-5 text-white">
                  <p className="text-orange-300 text-xs font-bold uppercase tracking-widest mb-3">Votre sélection</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-extrabold">{planInfo.label}</span>
                    <span className="text-2xl font-extrabold text-orange-300">{formatPrix(planInfo.prix)}</span>
                  </div>
                  <p className="text-orange-400 text-xs mt-1">
                    {planInfo.dureeJours} jours d&apos;accès complet
                    {planInfo.dureeJours > 30 && ` · ${prixParMois(plan)}/mois`}
                  </p>
                  {remise(plan) && (
                    <div className="mt-3 bg-green-500/20 text-green-300 text-xs font-bold px-3 py-1.5 rounded-lg inline-block">
                      Vous économisez {remise(plan)}% vs mensuel
                    </div>
                  )}
                </div>

                {/* Choix opérateur */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4">
                    2. Opérateur Mobile Money
                  </h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PROVIDERS.map((prov) => (
                      <button
                        key={prov.value}
                        type="button"
                        onClick={() => { setProvider(prov.value); setError(null) }}
                        className={`flex items-center gap-2 border-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all focus:outline-none ${
                          provider === prov.value
                            ? `border-orange-500 ${prov.bg}`
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <span className="text-base leading-none">{prov.logo}</span>
                        <span className={provider === prov.value ? prov.color : 'text-stone-600'}>
                          {prov.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <label className="block text-sm font-bold text-stone-700 uppercase tracking-widest mb-3">
                    3. Numéro Mobile Money
                  </label>
                  <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError(null) }}
                      placeholder="+225 07 00 00 00 00"
                      className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                    />
                  </div>
                  <p className="text-xs text-stone-400 mt-2">
                    Le paiement sera initié sur ce numéro.
                  </p>
                </div>

                {/* Erreur */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5">⚠</span>
                    {error}
                  </div>
                )}

                {/* Bouton submit */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-sm text-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initiation du paiement…
                    </>
                  ) : (
                    <>
                      Payer {formatPrix(planInfo.prix)} via Mobile Money
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Note architecture GeniusPay */}
                {/*
                  ARCHITECTURE PAIEMENT (à implémenter) :
                  ─────────────────────────────────────────
                  1. Ce formulaire appelle initierPaiement() [actions/partenaires.ts]
                  2. initierPaiement() crée une session chez GeniusPay :
                     POST https://api.genuispay.com/v1/payments/initiate
                     → retourne { payment_id, payment_url || ussd_code }
                  3. On stocke payment_ref + statut 'en_attente' en base
                  4. L'utilisateur confirme sur son téléphone (USSD ou app)
                  5. GeniusPay appelle GET /api/webhooks/genuispay?ref=...
                  6. Le webhook passe statut_abonnement → 'actif'
                     et calcule date_fin_abo = NOW() + dureeJours
                  ─────────────────────────────────────────
                */}

                <p className="text-center text-xs text-stone-400">
                  Paiement 100&nbsp;% sécurisé · Remboursement possible sous 48h
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
