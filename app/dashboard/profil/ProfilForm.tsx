'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/actions/profile'
import { User, Phone, CheckCircle, Loader2 } from 'lucide-react'

export function ProfilForm({
  nom,
  telephone,
  email,
  role,
}: {
  nom: string
  telephone: string | null
  email: string
  role: string
}) {
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, start]    = useTransition()

  const ROLE_CONFIG: Record<string, { label: string; cls: string }> = {
    chercheur:    { label: 'Chercheur',            cls: 'bg-blue-100 text-blue-700'    },
    proprietaire: { label: 'Propriétaire',         cls: 'bg-orange-100 text-orange-700'},
    agence:       { label: 'Agence immobilière',   cls: 'bg-green-100 text-green-700'  },
    promoteur:    { label: 'Promoteur immobilier', cls: 'bg-violet-100 text-violet-700'},
    agent:        { label: 'Agent immobilier',     cls: 'bg-orange-100 text-orange-700'},
    admin:        { label: 'Administrateur',       cls: 'bg-stone-900 text-white'      },
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await updateProfile(fd)
      if ('error' in res) setError(res.error)
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Nom */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Nom complet <span className="text-orange-500">*</span>
        </label>
        <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <User className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <input
            name="nom"
            type="text"
            defaultValue={nom}
            required
            minLength={2}
            maxLength={100}
            placeholder="Votre nom complet"
            className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          Téléphone
          <span className="text-stone-400 font-normal ml-1">(optionnel)</span>
        </label>
        <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <input
            name="telephone"
            type="tel"
            defaultValue={telephone ?? ''}
            maxLength={25}
            placeholder="+225 07 00 00 00 00"
            className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Champs en lecture seule */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
            Email <span className="text-stone-400 font-normal">(non modifiable)</span>
          </label>
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
            <span className="flex-1 text-sm text-stone-500 truncate">{email}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
            Rôle <span className="text-stone-400 font-normal">(non modifiable)</span>
          </label>
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${(ROLE_CONFIG[role] ?? { cls: 'bg-stone-100 text-stone-600' }).cls}`}>
              {(ROLE_CONFIG[role] ?? { label: role }).label}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">⚠</span>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Profil mis à jour avec succès.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enregistrement…
          </>
        ) : (
          'Enregistrer les modifications'
        )}
      </button>
    </form>
  )
}
