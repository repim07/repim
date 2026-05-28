'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signupAction } from '@/actions/auth'
import {
  User, Mail, Lock, ArrowRight, Eye, EyeOff,
  ChevronLeft, CheckCircle, Search,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Inscription "chercheur" (parcours simple sans KYC)
// Tunnel séparé de l'inscription pro (signup/page.tsx) qui exige un dossier.
// ─────────────────────────────────────────────────────────────────────────────

export default function SignupChercheurPage() {
  const [error,     setError]   = useState<string | null>(null)
  const [showPwd,   setShowPwd] = useState(false)
  const [isPending, start]      = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd = new FormData(e.currentTarget)
    fd.set('role', 'chercheur')

    start(async () => {
      try {
        const res = await signupAction(fd)
        if (res?.error) setError(res.error)
      } catch (err: unknown) {
        if (err instanceof Error && (err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err
        setError('Une erreur inattendue s’est produite.')
      }
    })
  }

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col">

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
        <div className="w-full max-w-md">

          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-600 mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Vous êtes professionnel ?
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-[0.15em]">
              <Search className="w-3.5 h-3.5" />
              Compte chercheur
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Trouvez votre prochain bien
            </h1>
            <p className="mt-2 text-stone-500 text-sm leading-relaxed">
              Créez votre compte pour sauvegarder vos recherches,
              contacter les annonceurs et planifier vos visites.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8">

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label htmlFor="nom" className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Nom complet <span className="text-orange-500">*</span>
                </label>
                <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                  <User className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <input
                    id="nom" name="nom" type="text"
                    required minLength={2} autoComplete="name"
                    placeholder="Jean Konan"
                    className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Adresse email <span className="text-orange-500">*</span>
                </label>
                <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                  <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <input
                    id="email" name="email" type="email"
                    required autoComplete="email"
                    placeholder="votre@email.com"
                    className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Mot de passe <span className="text-orange-500">*</span>{' '}
                  <span className="text-stone-400 font-normal text-xs">(min. 6 caractères)</span>
                </label>
                <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                  <Lock className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <input
                    id="password" name="password"
                    type={showPwd ? 'text' : 'password'}
                    required minLength={6} autoComplete="new-password"
                    placeholder="••••••••"
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
                    Créer mon compte
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-stone-400">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/conditions-generales" className="text-orange-500 hover:underline">
                  conditions générales
                </Link>.
              </p>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-stone-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              Gratuit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              Annonces vérifiées
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              Sans engagement
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
