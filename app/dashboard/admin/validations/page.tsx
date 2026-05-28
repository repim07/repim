// =============================================================================
// REPIM — Back-office admin : file d'attente des dossiers KYC
// =============================================================================
// Affiche tous les dossiers en statut 'pending_review' via la vue SQL
// admin_pending_validations, classés du plus ancien au plus récent.
// =============================================================================

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Clock, CheckCircle2, FileText, ChevronRight,
  AlertTriangle, Users, InboxIcon,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingRow {
  id:              string
  categorie:       string
  nom:             string
  prenom:          string
  email_pro:       string
  telephone_pro:   string
  raison_sociale:  string | null
  submitted_at:    string | null
  nb_documents:    number
  nb_verifies:     number
  nb_rejetes:      number
  dossier_complet: boolean
}

// ─── Labels catégories ────────────────────────────────────────────────────────

const CAT_LABELS: Record<string, { label: string; cls: string }> = {
  agence:       { label: 'Agence',       cls: 'bg-green-100  text-green-700'  },
  promoteur:    { label: 'Promoteur',    cls: 'bg-violet-100 text-violet-700' },
  proprietaire: { label: 'Propriétaire', cls: 'bg-orange-100 text-orange-700' },
  communaute:   { label: 'Communauté',   cls: 'bg-teal-100   text-teal-700'   },
  agent:        { label: 'Agent',        cls: 'bg-pink-100   text-pink-700'   },
}

// ─── Calcul du délai d'attente ────────────────────────────────────────────────

function formatDelay(submittedAt: string | null): string {
  if (!submittedAt) return '—'
  const ms   = Date.now() - new Date(submittedAt).getTime()
  const h    = Math.floor(ms / 3_600_000)
  const d    = Math.floor(h / 24)
  if (d > 0)  return `${d}j ${h % 24}h`
  if (h > 0)  return `${h}h`
  return '< 1h'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ValidationsPage() {

  // La vue admin_pending_validations est accessible via le client admin
  // (bypass RLS). Elle retourne uniquement les dossiers pending_review.
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('admin_pending_validations')
    .select('*')

  if (error) {
    console.error('[ValidationsPage]', error.message)
  }

  const dossiers: PendingRow[] = (data ?? []) as PendingRow[]

  // Tri : dossiers complets d'abord (prêts à valider), puis par ancienneté
  const sorted = [...dossiers].sort((a, b) => {
    if (a.dossier_complet !== b.dossier_complet) return a.dossier_complet ? -1 : 1
    return new Date(a.submitted_at ?? 0).getTime() - new Date(b.submitted_at ?? 0).getTime()
  })

  return (
    <div>
      {/* ── En-tête ────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            Certifications à valider
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {dossiers.length === 0
              ? 'Aucun dossier en attente.'
              : `${dossiers.length} dossier${dossiers.length > 1 ? 's' : ''} en attente d'examen.`}
          </p>
        </div>

        {/* Compteurs rapides */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-stone-100 rounded-xl px-4 py-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-stone-700">
              {dossiers.filter(d => d.dossier_complet).length} complets
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-stone-100 rounded-xl px-4 py-2 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-stone-700">
              {dossiers.filter(d => !d.dossier_complet).length} incomplets
            </span>
          </div>
        </div>
      </div>

      {/* ── Liste vide ─────────────────────────────────────────────────── */}
      {sorted.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <InboxIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-stone-600">Aucun dossier en attente</p>
          <p className="text-sm mt-1">La file est vide — revenez plus tard.</p>
        </div>
      )}

      {/* ── Tableau des dossiers ───────────────────────────────────────── */}
      {sorted.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-widest px-6 py-3">Acteur</th>
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Catégorie</th>
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-widest px-4 py-3 hidden md:table-cell">Contact</th>
                <th className="text-center text-xs font-semibold text-stone-500 uppercase tracking-widest px-4 py-3">Docs</th>
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-widest px-4 py-3 hidden lg:table-cell">Attente</th>
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-widest px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {sorted.map((d) => {
                const cat     = CAT_LABELS[d.categorie] ?? { label: d.categorie, cls: 'bg-stone-100 text-stone-600' }
                const nomAffiche = d.raison_sociale ?? `${d.prenom} ${d.nom}`

                return (
                  <tr key={d.id} className="hover:bg-orange-50/30 transition-colors group">

                    {/* Nom */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-800 truncate max-w-[180px]">{nomAffiche}</p>
                      <p className="text-xs text-stone-400">{d.prenom} {d.nom}</p>
                    </td>

                    {/* Catégorie */}
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.cls}`}>
                        {cat.label}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-stone-600 truncate max-w-[160px]">{d.email_pro}</p>
                      <p className="text-xs text-stone-400">{d.telephone_pro}</p>
                    </td>

                    {/* Documents */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <FileText className="w-4 h-4 text-stone-400" />
                        <span className="font-semibold text-stone-700">{d.nb_documents}</span>
                      </div>
                    </td>

                    {/* Délai */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-stone-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDelay(d.submitted_at)}</span>
                      </div>
                    </td>

                    {/* Dossier complet */}
                    <td className="px-4 py-4">
                      {d.dossier_complet ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Complet
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Incomplet
                        </span>
                      )}
                    </td>

                    {/* Lien vers le détail */}
                    <td className="px-4 py-4">
                      <Link
                        href={`/dashboard/admin/validations/${d.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-700 border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-lg transition-colors group-hover:bg-orange-50"
                      >
                        Examiner
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
