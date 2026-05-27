export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Home, ChevronLeft } from 'lucide-react'
import { AnnonceForm } from './AnnonceForm'

export default async function NewAnnoncePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('profiles')
    .select('nom, role')
    .eq('id', user!.id)
    .single()

  const profile     = data as { nom: string; role: string } | null
  const canPublish  = ['agent', 'proprietaire', 'agence', 'promoteur', 'admin'].includes(profile?.role ?? '')

  return (
    <div className="min-h-screen bg-stone-50">

      <header className="bg-white border-b border-stone-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-stone-500 hover:text-orange-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Link href="/">
            <Image src="/logo-repim.png" alt="REPIM" width={100} height={32} className="h-8 w-auto object-contain" />
          </Link>
          <span className="text-stone-300">|</span>
          <span className="text-sm font-semibold text-stone-700">Publier un bien</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {!canPublish ? (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 mb-3">
              Compte professionnel requis
            </h1>
            <p className="text-stone-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              Seuls les agents, propriétaires et administrateurs peuvent publier des annonces.
              Votre rôle actuel est <strong>{profile?.role ?? 'chercheur'}</strong>.
            </p>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Retour au tableau de bord
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-stone-900">Publier un bien</h1>
              <p className="text-stone-500 text-sm mt-1">
                Remplissez les informations de votre bien immobilier
              </p>
            </div>
            <AnnonceForm userId={user!.id} />
          </div>
        )}
      </div>
    </div>
  )
}
