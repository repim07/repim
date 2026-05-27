'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { PlanAbonnement } from '@/lib/partenaires-config'

// Cast helper pour contourner les types Supabase générés qui ne connaissent
// pas encore les nouvelles colonnes (trial_end_date, subscription_*, etc.)
// ni la table subscription_plans. Régénérer types/database.ts résout le pb.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adminAny(): any {
  return createAdminClient()
}

// ─────────────────────────────────────────────────────────────────────────────
// Garde : seul un admin peut exécuter ces actions
// ─────────────────────────────────────────────────────────────────────────────

async function assertAdmin(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // service_role pour contourner RLS
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Accès refusé : admin requis')
  return user.id
}

// ─────────────────────────────────────────────────────────────────────────────
// Liste des utilisateurs avec leur état d'abonnement
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'suspended'

export interface UtilisateurAdminRow {
  id: string
  nom: string
  email: string
  role: string
  created_at: string
  trial_end_date: string | null
  subscription_status: SubscriptionStatus
  subscription_plan: PlanAbonnement | null
  subscription_end_date: string | null
  debloque_par_admin: boolean
  debloque_jusquau: string | null
  // Statut effectif calculé côté serveur (essai expiré, abonnement actif, etc.)
  etat_effectif:
    | 'admin'
    | 'chercheur_libre'
    | 'essai_en_cours'
    | 'essai_expire'
    | 'abonnement_actif'
    | 'abonnement_expire'
    | 'suspendu'
    | 'debloque_admin'
}

function calculerEtatEffectif(p: {
  role: string
  subscription_status: SubscriptionStatus
  trial_end_date: string | null
  subscription_end_date: string | null
  debloque_par_admin: boolean
  debloque_jusquau: string | null
}): UtilisateurAdminRow['etat_effectif'] {
  if (p.role === 'admin') return 'admin'
  if (p.role === 'chercheur') return 'chercheur_libre'
  if (p.subscription_status === 'suspended') return 'suspendu'

  const now = Date.now()
  const deblocageActif =
    p.debloque_par_admin &&
    (!p.debloque_jusquau || new Date(p.debloque_jusquau).getTime() > now)
  if (deblocageActif) return 'debloque_admin'

  if (
    p.subscription_status === 'active' &&
    p.subscription_end_date &&
    new Date(p.subscription_end_date).getTime() > now
  ) {
    return 'abonnement_actif'
  }

  if (
    p.subscription_status === 'trial' &&
    p.trial_end_date &&
    new Date(p.trial_end_date).getTime() > now
  ) {
    return 'essai_en_cours'
  }

  if (p.subscription_status === 'trial') return 'essai_expire'
  return 'abonnement_expire'
}

export async function listerUtilisateurs(filtre?: 'tous' | 'essai' | 'abonnes' | 'expires'): Promise<UtilisateurAdminRow[]> {
  await assertAdmin()
  const admin = adminAny()

  const { data, error } = await admin
    .from('profiles')
    .select(`
      id, nom, email, role, created_at,
      trial_end_date, subscription_status, subscription_plan,
      subscription_end_date, debloque_par_admin, debloque_jusquau
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as unknown as Array<{
    id: string
    nom: string
    email: string
    role: string
    created_at: string
    trial_end_date: string | null
    subscription_status: SubscriptionStatus | null
    subscription_plan: PlanAbonnement | null
    subscription_end_date: string | null
    debloque_par_admin: boolean | null
    debloque_jusquau: string | null
  }>

  const all: UtilisateurAdminRow[] = rows.map((p) => {
    const enriched = {
      id: p.id,
      nom: p.nom ?? '',
      email: p.email ?? '',
      role: p.role ?? 'chercheur',
      created_at: p.created_at,
      trial_end_date: p.trial_end_date,
      subscription_status: (p.subscription_status ?? 'trial') as SubscriptionStatus,
      subscription_plan: p.subscription_plan,
      subscription_end_date: p.subscription_end_date,
      debloque_par_admin: Boolean(p.debloque_par_admin),
      debloque_jusquau: p.debloque_jusquau,
    }
    return {
      ...enriched,
      etat_effectif: calculerEtatEffectif(enriched),
    }
  })

  // Filtres
  if (filtre === 'essai')    return all.filter((u) => u.etat_effectif === 'essai_en_cours')
  if (filtre === 'abonnes')  return all.filter((u) => u.etat_effectif === 'abonnement_actif' || u.etat_effectif === 'debloque_admin')
  if (filtre === 'expires')  return all.filter((u) => u.etat_effectif === 'essai_expire' || u.etat_effectif === 'abonnement_expire' || u.etat_effectif === 'suspendu')
  return all
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions sur un utilisateur (au niveau profiles)
// ─────────────────────────────────────────────────────────────────────────────

export async function activerAbonnementUtilisateur(profileId: string, plan?: PlanAbonnement) {
  await assertAdmin()
  const admin = adminAny()

  let endDate: string | null = null
  if (plan) {
    const { data: planRow } = await admin
      .from('subscription_plans')
      .select('duree_jours')
      .eq('code', plan)
      .single()
    const jours = planRow?.duree_jours ?? 30
    endDate = new Date(Date.now() + jours * 86_400_000).toISOString()
  }

  const update: Record<string, unknown> = {
    subscription_status: 'active',
  }
  if (plan)     update.subscription_plan      = plan
  if (endDate)  update.subscription_end_date  = endDate

  const { error } = await admin
    .from('profiles')
    .update(update)
    .eq('id', profileId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/utilisateurs')
}

export async function suspendreAbonnementUtilisateur(profileId: string) {
  await assertAdmin()
  const admin = adminAny()

  const { error } = await admin
    .from('profiles')
    .update({ subscription_status: 'suspended' })
    .eq('id', profileId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/utilisateurs')
}

export async function debloquerManuellementUtilisateur(
  profileId: string,
  options: { dureeJours?: number } = {}
) {
  await assertAdmin()
  const admin = adminAny()

  const jusquau = options.dureeJours
    ? new Date(Date.now() + options.dureeJours * 86_400_000).toISOString()
    : null  // NULL = déblocage illimité

  const { error } = await admin
    .from('profiles')
    .update({
      debloque_par_admin: true,
      debloque_jusquau:   jusquau,
    })
    .eq('id', profileId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/utilisateurs')
}

export async function retirerDeblocageUtilisateur(profileId: string) {
  await assertAdmin()
  const admin = adminAny()

  const { error } = await admin
    .from('profiles')
    .update({
      debloque_par_admin: false,
      debloque_jusquau:   null,
    })
    .eq('id', profileId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/utilisateurs')
}

export async function reinitialiserEssaiUtilisateur(profileId: string, jours = 21) {
  await assertAdmin()
  const admin = adminAny()

  const trialEnd = new Date(Date.now() + jours * 86_400_000).toISOString()
  const { error } = await admin
    .from('profiles')
    .update({
      subscription_status: 'trial',
      trial_end_date:      trialEnd,
    })
    .eq('id', profileId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/admin/utilisateurs')
}

// ─────────────────────────────────────────────────────────────────────────────
// Tarifs des plans d'abonnement
// ─────────────────────────────────────────────────────────────────────────────

const PlanUpdateSchema = z.object({
  code:        z.enum(['mensuel', 'trimestriel', 'semestriel', 'annuel']),
  label:       z.string().min(1).max(50),
  prix:        z.number().nonnegative(),
  duree_jours: z.number().int().positive(),
  actif:       z.boolean(),
})

export interface PlanRow {
  code: PlanAbonnement
  label: string
  prix: number
  duree_jours: number
  devise: string
  actif: boolean
  ordre: number
  updated_at: string
}

export async function listerPlans(): Promise<PlanRow[]> {
  await assertAdmin()
  const admin = adminAny()

  const { data, error } = await admin
    .from('subscription_plans')
    .select('*')
    .order('ordre', { ascending: true })

  // Table pas encore créée → retourner tableau vide au lieu de crasher
  if (error) {
    console.warn('[listerPlans]', error.message)
    return []
  }
  return (data ?? []) as PlanRow[]
}

export async function mettreAJourPlan(formData: FormData) {
  await assertAdmin()

  const parsed = PlanUpdateSchema.safeParse({
    code:        formData.get('code'),
    label:       formData.get('label'),
    prix:        Number(formData.get('prix')),
    duree_jours: Number(formData.get('duree_jours')),
    actif:       formData.get('actif') === 'on' || formData.get('actif') === 'true',
  })

  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const admin = adminAny()
  const { error } = await admin
    .from('subscription_plans')
    .update({
      label:       parsed.data.label,
      prix:        parsed.data.prix,
      duree_jours: parsed.data.duree_jours,
      actif:       parsed.data.actif,
    })
    .eq('code', parsed.data.code)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/tarifs')
  revalidatePath('/partenaires/abonnement')
}
