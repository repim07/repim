'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, ArrowRight, Star, Shield, BarChart3 } from 'lucide-react'

// =============================================================================
// Contenu de la page succes (utilise useSearchParams → Suspense obligatoire)
// =============================================================================

function PaiementSuccesContent() {
  const searchParams = useSearchParams()
  const ref          = searchParams.get('ref') ?? ''

  const [dots, setDots] = useState('.')

  // Animation d'attente simple pendant la verification webhook
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <Image src="/logo-repim.png" alt="REPIM" width={100} height={32} className="h-8 w-auto object-contain" />
          </Link>
        </div>
      </header>

      {/* Contenu central */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">

          {/* Icone succes */}
          <div className="relative inline-flex mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <span className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-3xl font-extrabold text-stone-900 mb-3">
            Paiement confirme !
          </h1>
          <p className="text-stone-500 text-base mb-2">
            Votre abonnement REPIM Pro est maintenant actif.
          </p>
          {ref && (
            <p className="text-xs text-stone-400 font-mono bg-stone-50 inline-block px-3 py-1 rounded-full border border-stone-200 mb-6">
              Ref : {ref}
            </p>
          )}

          {/* Avantages débloqués */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8 text-left">
            <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4 text-center">
              Ce que vous avez debloque
            </h2>
            <div className="space-y-3">
              {[
                'Publication illimitee d\'annonces immobilieres',
                'Badge partenaire verifie visible sur votre profil',
                'Acces aux leads qualifies et statistiques avancees',
                'Visibilite aupres de 750 000+ utilisateurs REPIM',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-stone-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Indicateur de sync */}
          <div className="flex items-center justify-center gap-2 text-xs text-stone-400 mb-8">
            <BarChart3 className="w-3.5 h-3.5 text-orange-400" />
            Synchronisation de votre compte en cours{dots}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-8 py-4 rounded-xl transition-colors shadow-md text-sm"
            >
              Acceder a mon espace Pro
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/annonces/new"
              className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 font-semibold px-6 py-4 rounded-xl border border-stone-200 transition-colors text-sm"
            >
              Publier ma premiere annonce
            </Link>
          </div>

          {/* Securite */}
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-stone-400">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            Paiement securise par GeniusPay &middot; Donnees chiffrees SSL
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Export avec Suspense
// =============================================================================

export default function PaiementSuccesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <PaiementSuccesContent />
    </Suspense>
  )
}
