'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck, Mail, Lock, Eye, EyeOff,
  ArrowRight, ChevronLeft, Loader2,
} from 'lucide-react'
import { adminLoginAction } from '@/actions/admin-auth'

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [isPending, start]              = useTransition()
  const router                          = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    start(async () => {
      try {
        const result = await adminLoginAction(fd)
        if ('error' in result) {
          setError(result.error)
        } else {
          // router.push garantit la propagation correcte des cookies de session
          router.push('/dashboard/admin')
        }
      } catch {
        setError('Une erreur inattendue s\'est produite.')
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-300 hover:text-orange-400 mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour au site
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-stone-200">
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-stone-900">
              Console Administrateur
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Accès réservé aux administrateurs REPIM
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Email administrateur
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@repim.app"
                  className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-stone-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-stone-200 rounded-xl text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm mt-2"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Accéder à la console
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col gap-2 text-center">
            <Link
              href="/admin/signup"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 border-2 border-stone-200 hover:border-orange-400 hover:text-orange-600 text-stone-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Créer un compte administrateur
            </Link>
            <p className="text-xs text-stone-400">
              Vous êtes utilisateur ?{' '}
              <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 font-semibold">
                Connexion standard
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
