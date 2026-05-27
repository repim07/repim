export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, MapPin, ArrowLeft, Clock, CheckCircle, XCircle, Star } from 'lucide-react'

const STATUT: Record<string, { label: string; icon: React.ElementType; cls: string; dot: string }> = {
  en_attente: { label: 'En attente',  icon: Clock,         cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  confirme:   { label: 'Confirmée',   icon: CheckCircle,   cls: 'bg-green-100 text-green-700',   dot: 'bg-green-400'  },
  annule:     { label: 'Annulée',     icon: XCircle,       cls: 'bg-red-100 text-red-600',       dot: 'bg-red-400'    },
  effectue:   { label: 'Effectuée',   icon: Star,          cls: 'bg-stone-100 text-stone-500',   dot: 'bg-stone-300'  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function MesVisitesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('appointments')
    .select('id, date_visite, statut, message, properties(id, titre, localisation)')
    .eq('user_id', user!.id)
    .order('date_visite', { ascending: false })

  type Visit = {
    id: string
    date_visite: string
    statut: string
    message: string | null
    properties: { id: string; titre: string; localisation: Record<string, string> } | null
  }
  const visits = (data ?? []) as unknown as Visit[]

  const upcoming = visits.filter((v) => v.statut === 'en_attente' || v.statut === 'confirme')
  const past     = visits.filter((v) => v.statut === 'annule'     || v.statut === 'effectue')

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

      <div className="pt-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-stone-900">Mes visites</h1>
          <p className="text-stone-500 text-sm mt-1">
            {visits.length} visite{visits.length !== 1 ? 's' : ''} au total
          </p>
        </div>

        {visits.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-14 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-orange-300" />
            </div>
            <h2 className="text-lg font-bold text-stone-800 mb-2">Aucune visite planifiée</h2>
            <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
              Parcourez les annonces et demandez une visite pour un bien qui vous intéresse.
            </p>
            <Link
              href="/annonces"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Voir les annonces
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-stone-600 uppercase tracking-widest mb-3">
                  À venir ({upcoming.length})
                </h2>
                <div className="space-y-3">
                  {upcoming.map((v) => <VisiteCard key={v.id} visit={v} />)}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3">
                  Passées ({past.length})
                </h2>
                <div className="space-y-3 opacity-70">
                  {past.map((v) => <VisiteCard key={v.id} visit={v} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function VisiteCard({ visit }: {
  visit: {
    id: string; date_visite: string; statut: string; message: string | null;
    properties: { id: string; titre: string; localisation: Record<string, string> } | null
  }
}) {
  const s   = STATUT[visit.statut] ?? STATUT.en_attente
  const Icon = s.icon
  const loc  = visit.properties?.localisation

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-800 truncate">
            {visit.properties?.titre ?? 'Bien supprimé'}
          </p>
          {loc && (
            <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
              <MapPin className="w-3 h-3" />
              {loc.commune ?? loc.ville ?? '—'}
            </div>
          )}
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${s.cls}`}>
          <Icon className="w-3 h-3" />
          {s.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-stone-600">
        <CalendarDays className="w-4 h-4 text-orange-400 flex-shrink-0" />
        {formatDate(visit.date_visite)}
      </div>

      {visit.message && (
        <p className="mt-2 text-xs text-stone-400 italic bg-stone-50 rounded-xl px-3 py-2">
          &ldquo;{visit.message}&rdquo;
        </p>
      )}
    </div>
  )
}
