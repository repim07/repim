export const dynamic = 'force-dynamic'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { PlusCircle, Home, MapPin, ChevronRight, ArrowLeft } from 'lucide-react'

const STATUT: Record<string, { label: string; cls: string }> = {
  actif:                 { label: 'Actif',        cls: 'bg-green-100 text-green-700'   },
  loue:                  { label: 'Loué',         cls: 'bg-blue-100 text-blue-700'     },
  vendu:                 { label: 'Vendu',        cls: 'bg-blue-100 text-blue-700'     },
  inactif:               { label: 'Inactif',      cls: 'bg-stone-100 text-stone-500'   },
  en_attente_validation: { label: 'En attente',   cls: 'bg-yellow-100 text-yellow-700' },
}

export default async function MesAnnoncesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('properties')
    .select('id, titre, prix, devise, statut, type, localisation, photos, created_at')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  type Prop = {
    id: string; titre: string; prix: number; devise: string;
    statut: string; type: string; localisation: Record<string, string>;
    photos: string[]; created_at: string
  }
  const list = (data ?? []) as Prop[]

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

      <div className="pt-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">Mes annonces</h1>
            <p className="text-stone-500 text-sm mt-1">
              {list.length} bien{list.length !== 1 ? 's' : ''} publié{list.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/annonces/new"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Publier un bien
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-14 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-orange-300" />
            </div>
            <h2 className="text-lg font-bold text-stone-800 mb-2">Aucune annonce publiée</h2>
            <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
              Publiez votre premier bien et touchez des milliers d&apos;acheteurs et locataires.
            </p>
            <Link
              href="/annonces/new"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Publier maintenant
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((prop) => {
              const loc = prop.localisation
              const s = STATUT[prop.statut] ?? { label: prop.statut, cls: 'bg-stone-100 text-stone-500' }
              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-4 group hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-stone-100 rounded-xl flex-shrink-0 overflow-hidden">
                    {prop.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prop.photos[0]} alt={prop.titre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-6 h-6 text-stone-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 truncate">{prop.titre}</p>
                    <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {loc?.commune ?? loc?.ville ?? '—'}
                    </div>
                    <p className="text-sm font-bold text-orange-600 mt-1">
                      {prop.prix.toLocaleString('fr-FR')} {prop.devise}
                      {prop.type === 'location' && (
                        <span className="text-stone-400 font-normal ml-1">/mois</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>
                      {s.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
