'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signupAction } from '@/actions/auth'
import {
  User, Mail, Lock, ArrowRight, Eye, EyeOff,
  ChevronLeft, CheckCircle, Search, Home, Building2, BarChart3,
} from 'lucide-react'

type Role = 'chercheur' | 'proprietaire' | 'agence' | 'promoteur'

const ROLES: {
  value: Role
  label: string
  desc: string
  icon: React.ElementType
  pro?: boolean
}[] = [
  { value: 'chercheur',    label: 'Chercheur',    desc: 'Je cherche un bien',      icon: Search    },
  { value: 'proprietaire', label: 'Propriétaire', desc: 'Je loue ou vends un bien', icon: Home      },
  { value: 'agence',       label: 'Agence',       desc: 'Agence immobilière',       icon: Building2, pro: true },
  { value: 'promoteur',    label: 'Promoteur',    desc: 'Promotion immobilière',    icon: BarChart3, pro: true },
]

export default function SignupPage() {
  const [role,      setRole]    = useState<Role>('chercheur')
  const [error,     setError]   = useState<string | null>(null)
  const [showPwd,   setShowPwd] = useState(false)
  const [isPending, start]      = useTransition()
  const router                  = useRouter()

  const isPro = role === 'agence' || role === 'promoteur'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    // Les pros ont un onboarding dédié sur /partenaires/inscription
    if (isPro) {
      router.push(`/partenaires/inscription?categorie=${role}`)
      return
    }

    const fd = new FormData(e.currentTarget)
    start(async () => {
      try {
        const res = await signupAction(fd)
        if (res?.error) setError(res.error)
      } catch {
        setError('Une erreur inattendue s\'est produite.')
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-stone-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-500 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>

        <div className="text-center mb-6">
          <Image src="/logo-repim.png" alt="REPIM" width={110} height={36} className="h-9 w-auto mx-auto object-contain" />
          <h1 className="mt-5 text-2xl font-extrabold text-stone-900">Créer votre compte</h1>
          <p className="mt-1 text-sm text-stone-500">Rejoignez des milliers d&apos;utilisateurs REPIM</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-5">
          {['Annonces vérifiées', 'Gratuit', 'Sécurisé'].map((item) => (
            <span key={item} className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-100">
              <CheckCircle className="w-3 h-3" />
              {item}
            </span>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-5">

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Sélection du profil — 2×2 grille mobile */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Je suis… <span className="text-orange-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(({ value, label, desc, icon: Icon, pro }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex flex-col items-center gap-1.5 border-2 rounded-xl px-2 py-3 text-center transition-all focus:outline-none relative ${
                      role === value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {pro && (
                      <span className="absolute -top-2 right-2 text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
                        PRO
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      role === value ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-xs font-bold leading-tight ${role === value ? 'text-orange-600' : 'text-stone-700'}`}>
                      {label}
                    </p>
                    <p className="text-[10px] text-stone-400 leading-tight">{desc}</p>
                  </button>
                ))}
              </div>
              <input type="hidden" name="role" value={role} />
            </div>

            {/* Message pour les pros */}
            {isPro ? (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <Building2 className="w-7 h-7 text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-800 mb-1">
                  Inscription professionnelle
                </p>
                <p className="text-xs text-stone-500 mb-3">
                  Les {role === 'agence' ? 'agences' : 'promoteurs'} bénéficient d&apos;un espace dédié avec 21 jours d&apos;essai gratuit.
                </p>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Créer mon compte {role === 'agence' ? 'Agence' : 'Promoteur'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Nom complet</label>
                  <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <User className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <input
                      name="nom" type="text" required minLength={2} autoComplete="name"
                      placeholder="Jean Konan"
                      className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Adresse email</label>
                  <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <input
                      name="email" type="email" required autoComplete="email"
                      placeholder="votre@email.com"
                      className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Mot de passe <span className="text-stone-400 font-normal">(min. 6 caractères)</span>
                  </label>
                  <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <Lock className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <input
                      name="password" type={showPwd ? 'text' : 'password'} required minLength={6}
                      autoComplete="new-password" placeholder="••••••••"
                      className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
                    />
                    <button
                      type="button" onClick={() => setShowPwd(!showPwd)}
                      className="text-stone-400 hover:text-stone-600 transition-colors"
                      aria-label={showPwd ? 'Cacher' : 'Afficher'}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Création du compte…
                    </span>
                  ) : (
                    <>Créer mon compte <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </>
            )}
          </form>

          <p className="mt-4 text-center text-xs text-stone-400">
            En créant un compte, vous acceptez nos{' '}
            <a href="/conditions-generales" className="text-orange-400 hover:underline">conditions d&apos;utilisation</a>
          </p>

          <p className="mt-3 text-center text-sm text-stone-500">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
