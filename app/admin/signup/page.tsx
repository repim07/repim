'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck, Mail, Lock, Eye, EyeOff, User,
  ArrowRight, ChevronLeft, Loader2, KeyRound, CheckCircle,
} from 'lucide-react'
import { adminSignupAction } from '@/actions/admin-signup'

export default function AdminSignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showCode,     setShowCode]     = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [success,      setSuccess]      = useState(false)
  const [isPending,    start]           = useTransition()
  const router                          = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      try {
        const result = await adminSignupAction(fd)
        if ('error' in result) {
          setError(result.error)
        } else {
          setSuccess(true)
          setTimeout(() => router.push('/admin/login'), 2000)
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
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-sm text-stone-300 hover:text-orange-400 mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-stone-200">

          {success ? (
            /* ── État succès ── */
            <div className="py-6 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-extrabold text-stone-900 mb-2">Compte créé !</h2>
              <p className="text-sm text-stone-500">
                Redirection vers la connexion…
              </p>
            </div>
          ) : (
            <>
              {/* ── En-tête ── */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-xl font-extrabold text-stone-900">
                  Créer un compte Admin
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Accès protégé par code secret
                </p>
              </div>

              {/* ── Erreur ── */}
              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* ── Formulaire ── */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Nom */}
                <div>
                  <label htmlFor="nom" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="nom" name="nom" type="text"
                      required minLength={2} autoComplete="name"
                      placeholder="Prénom Nom"
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="email" name="email" type="email"
                      required autoComplete="email"
                      placeholder="admin@repim.app"
                      className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Mot de passe <span className="text-stone-400 font-normal">(min. 8 caractères)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="password" name="password"
                      type={showPassword ? 'text' : 'password'}
                      required minLength={8} autoComplete="new-password"
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

                {/* Code secret admin */}
                <div className="pt-1">
                  <label htmlFor="code" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Code d&apos;accès administrateur
                    <span className="text-orange-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                    <input
                      id="code" name="code"
                      type={showCode ? 'text' : 'password'}
                      required autoComplete="off"
                      placeholder="Code confidentiel"
                      className="w-full pl-10 pr-10 py-3 border border-orange-200 bg-orange-50 rounded-xl text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      aria-label={showCode ? 'Masquer' : 'Afficher'}
                    >
                      {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-stone-400">
                    Défini dans les variables d&apos;environnement Vercel (<code className="text-orange-500">ADMIN_SIGNUP_CODE</code>)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm mt-1"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Créer le compte admin
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
