'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { XCircle, ArrowLeft, RefreshCw, Shield, Phone } from 'lucide-react'

// =============================================================================
// Contenu de la page annulation
// =============================================================================

function PaiementAnnuleContent() {
  const searchParams = useSearchParams()
  const ref          = searchParams.get('ref') ?? ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-orange-50 flex flex-col">

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
        <div className="max-w-md w-full text-center">

          {/* Icone annulation */}
          <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-extrabold text-stone-900 mb-3">
            Paiement annule
          </h1>
          <p className="text-stone-500 text-sm mb-2 leading-relaxed">
            Votre paiement a ete annule. Votre compte partenaire a ete cree
            mais reste en attente d&apos;activation.
          </p>
          {ref && (
            <p className="text-xs text-stone-400 font-mono bg-stone-50 inline-block px-3 py-1 rounded-full border border-stone-200 mb-6">
              Ref : {ref}
            </p>
          )}

          {/* Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-amber-800 font-semibold mb-1">Votre compte est en securite</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Aucun montant n&apos;a ete debite. Vous pouvez reessayer le paiement depuis votre tableau de bord
              ou contacter notre support.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-4 rounded-xl transition-colors shadow-md text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reessayer depuis le tableau de bord
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-600 font-semibold px-6 py-3.5 rounded-xl border border-stone-200 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour a l&apos;accueil
            </Link>
          </div>

          {/* Support */}
          <div className="mt-10 bg-stone-50 rounded-xl p-4 border border-stone-100">
            <p className="text-xs font-bold text-stone-600 mb-2">Besoin d&apos;aide ?</p>
            <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
              <Phone className="w-3.5 h-3.5" />
              (+225) 01 01 042 776 &middot; repim.ci1986@gmail.com
            </div>
          </div>

          {/* Securite */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            Aucune donnee bancaire n&apos;est conservee par REPIM
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Export avec Suspense
// =============================================================================

export default function PaiementAnnulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <PaiementAnnuleContent />
    </Suspense>
  )
}
