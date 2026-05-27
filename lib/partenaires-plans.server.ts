import 'server-only'
import { createClient } from '@/lib/supabase/server'
import {
  PLANS_DEFAUT,
  type PlanAbonnement,
  type PlanInfo,
} from '@/lib/partenaires-config'

/**
 * Récupère les plans d'abonnement depuis la base de données.
 * À n'utiliser que côté serveur (Server Components / Server Actions / route handlers).
 * Renvoie les valeurs par défaut en cas d'échec ou de table vide.
 */
export async function getPlansFromDb(): Promise<Record<PlanAbonnement, PlanInfo>> {
  try {
    // Cast en any : la table subscription_plans n'est pas encore dans les
    // types Supabase générés (régénérer types/database.ts résout le problème).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('code, label, prix, duree_jours, devise, actif')
      .order('ordre', { ascending: true })

    if (error || !data || data.length === 0) {
      return PLANS_DEFAUT
    }

    const result = { ...PLANS_DEFAUT }
    for (const row of data) {
      const code = row.code as PlanAbonnement
      result[code] = {
        label:      row.label,
        prix:       Number(row.prix),
        dureeJours: row.duree_jours,
        devise:     row.devise ?? 'XOF',
        actif:      row.actif,
      }
    }
    return result
  } catch {
    return PLANS_DEFAUT
  }
}
