'use client'

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { loginAction } from '@/actions/auth'
import { Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/dashboard'

  const [error,    setError]   = useState<string | null>(null)
  const [showPwd,  setShowPwd] = useState(false)
  const [isPending, start]     = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('redirect', redirectTo)
    start(async () => {
      const res = await loginAction(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <>
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Adresse email</label>
          <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
            <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <input name="email" type="email" required autoComplete="email" placeholder="votre@email.com"
              className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Mot de passe</label>
          <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
            <Lock className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <input name="password" type={showPwd ? 'text' : 'password'} required
              autoComplete="current-password" placeholder="••••••••"
              className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent" />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="text-stone-400 hover:text-stone-600 transition-colors"
              aria-label={showPwd ? 'Cacher' : 'Afficher'}>
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Connexion…
            </span>
          ) : (
            <>Se connecter <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Pas encore de compte ?{' '}
        <Link href="/auth/signup" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
          Créer un compte
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-500 mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>

        <div className="text-center mb-8">
          <Image src="/logo-repim.png" alt="REPIM" width={120} height={40} className="h-10 w-auto mx-auto object-contain" />
          <h1 className="mt-6 text-2xl font-extrabold text-stone-900">Bon retour !</h1>
          <p className="mt-1 text-sm text-stone-500">Connectez-vous à votre compte REPIM</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
          <Suspense fallback={<div className="h-40 flex items-center justify-center text-stone-400 text-sm">Chargement…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
