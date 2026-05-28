'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { PLANS, type PlanAbonnement } from '@/lib/partenaires-config'
import {
  JOURS_ESSAI_GRATUIT,
  CATEGORIE_VERS_ROLE,
  type CategoriePartenaire,
  type Partenaire,
} from '@/types/partenaires'

// ─────────────────────────────────────────────────────────────────────────────
// Validation Zod
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES_VALIDES = [
  'agence', 'promoteur', 'notaire', 'cabinet_juridique',
  'assurance', 'huissier', 'architecte', 'conseiller', 'geometre', 'autre',
] as const

const InscriptionSchema = z.object({
  nom_structure: z.string().min(2, 'Le nom de la structure est requis (min. 2 caractères)').max(200),
  categorie: z.enum(CATEGORIES_VALIDES, {
    error: 'Veuillez sélectionner une catégorie valide',
  }),
  email: z.string().email('Adresse email invalide').trim(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Server Action : inscription partenaire
// ─────────────────────────────────────────────────────────────────────────────

export async function inscrirePartenaire(
  formData: FormData
): Promise<{ error: string } | never> {
  try {
    // 1. Validation des entrées
    const raw = {
      nom_structure: formData.get('nom_structure'),
      categorie:     formData.get('categorie'),
      email:         formData.get('email'),
      password:      formData.get('password'),
    }

    const parsed = InscriptionSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { nom_structure, categorie, email, password } = parsed.data
    const roleProfile = CATEGORIE_VERS_ROLE[categorie] ?? 'agent'

    // 2. Création du compte Supabase Auth
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom:  nom_structure,
          role: roleProfile,
        },
      },
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        return { error: 'Cette adresse email est déjà utilisée.' }
      }
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: 'La création du compte a échoué. Veuillez réessayer.' }
    }

    const userId = authData.user.id

    // 3. Mise à jour du profil via admin client (contourne le RLS + change le rôle)
    await new Promise((r) => setTimeout(r, 500))

    const admin = createAdminClient()

    const { error: profileError } = await admin
      .from('profiles')
      .update({ nom: nom_structure, role: roleProfile })
      .eq('id', userId)

    if (profileError) {
      console.error('[inscrirePartenaire] profile update error:', profileError.message)
    }

    // 4. Insertion dans la table partenaires avec période d'essai gratuit
    const dateDebut = new Date()
    const dateFin   = new Date(dateDebut.getTime() + JOURS_ESSAI_GRATUIT * 24 * 60 * 60 * 1000)

    const { error: partenaireError } = await admin
      .from('partenaires')
      .insert({
        user_id:           userId,
        nom_structure,
        categorie,
        statut_abonnement: 'essai',
        date_debut_abo:    dateDebut.toISOString(),
        date_fin_abo:      dateFin.toISOString(),
      })

    if (partenaireError) {
      console.error('[inscrirePartenaire] partenaire insert error:', partenaireError.message)
      return { error: 'Compte créé, mais erreur lors de l\'enregistrement du profil partenaire.' }
    }

    redirect('/dashboard')
  } catch (err: unknown) {
    if (err instanceof Error && (err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('[inscrirePartenaire]', err)
    return { error: 'Une erreur inattendue s\'est produite. Veuillez réessayer.' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Server Action : initier un paiement Mobile Money
// ─────────────────────────────────────────────────────────────────────────────

export async function initierPaiement(input: {
  plan:     PlanAbonnement
  provider: 'genuispay' | 'wave' | 'orange_money' | 'mtn'
  phone:    string
}): Promise<{ error: string } | { paymentUrl?: string; paymentCode?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Vous devez être connecté.' }
    }

    const { plan, provider, phone } = input
    const planInfo = PLANS[plan]

    if (!planInfo) {
      return { error: 'Plan invalide.' }
    }

    const admin = createAdminClient()
    const { error: updateError } = await admin
      .from('partenaires')
      .update({
        statut_abonnement: 'en_attente',
        plan_actif:        plan,
        payment_provider:  provider,
        payment_phone:     phone,
      })
      .eq('user_id', user.id)

    if (updateError) {
      return { error: 'Erreur lors de l\'initiation du paiement.' }
    }

    return { paymentCode: '#DEMO-CODE' }
  } catch (err) {
    console.error('[initierPaiement]', err)
    return { error: 'Une erreur inattendue s\'est produite.' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Récupérer le profil partenaire de l'utilisateur connecté
// ─────────────────────────────────────────────────────────────────────────────

export async function getMonProfil(): Promise<Partenaire | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('partenaires')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return data as Partenaire | null
  } catch {
    return null
  }
}
