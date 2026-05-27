export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, UserCircle } from 'lucide-react'
import { ProfilForm } from './ProfilForm'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('profiles')
    .select('nom, telephone, role, email')
    .eq('id', user!.id)
    .single()

  const profile = data as { nom: string; telephone: string | null; role: string; email: string } | null

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-repim.png" alt="REPIM" width={100} height={32} className="h-8 w-auto object-contain" />
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>
      </header>

      <div className="pt-16 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-extrabold text-orange-700">
              {(profile?.nom ?? user?.email ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">Mon profil</h1>
            <p className="text-stone-400 text-sm mt-0.5 flex items-center gap-1.5">
              <UserCircle className="w-3.5 h-3.5" />
              {user?.email}
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-6">
            Informations personnelles
          </h2>
          <ProfilForm
            nom={profile?.nom ?? ''}
            telephone={profile?.telephone ?? null}
            email={user?.email ?? ''}
            role={profile?.role ?? 'chercheur'}
          />
        </div>
      </div>
    </div>
  )
}
