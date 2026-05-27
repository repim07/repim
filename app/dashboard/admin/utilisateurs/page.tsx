import { listerUtilisateurs, type UtilisateurAdminRow } from '@/actions/admin'
import { UtilisateurActions } from './actions-client'
import Link from 'next/link'

const ETAT_STYLES: Record<UtilisateurAdminRow['etat_effectif'], string> = {
  admin:              'bg-stone-900 text-white border-stone-900',
  chercheur_libre:    'bg-stone-100 text-stone-600 border-stone-200',
  essai_en_cours:     'bg-blue-100 text-blue-700 border-blue-200',
  essai_expire:       'bg-red-100 text-red-700 border-red-200',
  abonnement_actif:   'bg-green-100 text-green-700 border-green-200',
  abonnement_expire:  'bg-red-100 text-red-700 border-red-200',
  suspendu:           'bg-amber-100 text-amber-700 border-amber-200',
  debloque_admin:     'bg-purple-100 text-purple-700 border-purple-200',
}

const ETAT_LABELS: Record<UtilisateurAdminRow['etat_effectif'], string> = {
  admin:              'Admin',
  chercheur_libre:    'Chercheur',
  essai_en_cours:     'Essai en cours',
  essai_expire:       'Essai expiré',
  abonnement_actif:   'Abonné',
  abonnement_expire:  'Expiré',
  suspendu:           'Suspendu',
  debloque_admin:     'Débloqué',
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function joursRestants(date: string | null): string {
  if (!date) return '—'
  const ms = new Date(date).getTime() - Date.now()
  const j  = Math.ceil(ms / 86_400_000)
  if (j < 0) return `Expiré (${-j}j)`
  if (j === 0) return 'Aujourd’hui'
  return `${j}j restants`
}

export default async function AdminUtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>
}) {
  const params = await searchParams
  const filtre = (params.filtre as 'tous' | 'essai' | 'abonnes' | 'expires') || 'tous'
  const utilisateurs = await listerUtilisateurs(filtre)

  const filtres = [
    { id: 'tous',     label: 'Tous' },
    { id: 'essai',    label: 'Essai 21j' },
    { id: 'abonnes',  label: 'Abonnés' },
    { id: 'expires',  label: 'Expirés / suspendus' },
  ] as const

  return (
    <div>
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Utilisateurs</h2>
          <p className="text-sm text-stone-500 mt-1">
            {utilisateurs.length} utilisateur{utilisateurs.length > 1 ? 's' : ''} —
            essai 21j gratuit pour tous sauf chercheurs et admin
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filtres.map((f) => (
          <Link
            key={f.id}
            href={`/dashboard/admin/utilisateurs${f.id === 'tous' ? '' : `?filtre=${f.id}`}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtre === f.id
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Utilisateur</th>
                <th className="px-4 py-3 text-left font-semibold">Rôle</th>
                <th className="px-4 py-3 text-left font-semibold">État</th>
                <th className="px-4 py-3 text-left font-semibold">Plan</th>
                <th className="px-4 py-3 text-left font-semibold">Échéance</th>
                <th className="px-4 py-3 text-left font-semibold">Inscrit le</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {utilisateurs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-stone-400">
                    Aucun utilisateur dans cette catégorie.
                  </td>
                </tr>
              )}
              {utilisateurs.map((u) => {
                const echeance =
                  u.subscription_status === 'active' ? u.subscription_end_date : u.trial_end_date
                const isAdmin     = u.role === 'admin'
                const isChercheur = u.role === 'chercheur'
                return (
                  <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">{u.nom || '—'}</div>
                      <div className="text-xs text-stone-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-600 capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-semibold ${ETAT_STYLES[u.etat_effectif]}`}>
                        {ETAT_LABELS[u.etat_effectif]}
                      </span>
                      {u.debloque_par_admin && u.etat_effectif !== 'debloque_admin' && (
                        <span className="ml-1 inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-600 text-[10px] font-semibold">
                          Bypass admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600 capitalize">
                      {u.subscription_plan ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin || isChercheur ? (
                        <span className="text-stone-400 text-xs">N/A</span>
                      ) : (
                        <>
                          <div className="text-stone-900">{formatDate(echeance)}</div>
                          <div className="text-xs text-stone-500">{joursRestants(echeance)}</div>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {!isAdmin && <UtilisateurActions utilisateur={u} />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
