'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Property, PropertyStatus } from '@/types/database'

// =============================================================================
// Schéma de validation Zod (compatible v4)
// =============================================================================

const LocalisationSchema = z.object({
  ville:    z.string().min(2, 'La ville est obligatoire'),
  commune:  z.string().min(2, 'La commune est obligatoire'),
  quartier: z.string().min(2, 'Le quartier est obligatoire'),
  adresse:  z.string().optional(),
  lat:      z.number().nullable().optional(),
  lng:      z.number().nullable().optional(),
})

const PropertySchema = z.object({
  titre: z
    .string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(200, 'Titre trop long (200 caractères max)'),
  description: z.string().max(2000).optional(),
  prix: z
    .number()
    .positive('Le prix doit être positif'),
  devise: z.enum(['XOF', 'EUR', 'USD']).default('XOF'),
  localisation: LocalisationSchema,
  type: z.enum(['location', 'vente', 'colocation', 'residence_meublee', 'lotissement'], {
    error: 'Type de bien invalide',
  }),
  surface_m2:  z.number().positive().optional(),
  nb_pieces:   z.number().int().positive().max(50).optional(),
  standing:    z.enum(['social', 'normal', 'haut_standing']).optional(),
  // On accepte toute string (URL publique Supabase Storage) — pas de validation .url()
  // stricte car certains CDN Supabase peuvent ne pas passer la validation RFC.
  photos:      z.array(z.string().min(1)).max(12).default([]),
})

export type CreatePropertyInput = z.infer<typeof PropertySchema>

// =============================================================================
// Rôles autorisés à publier
// =============================================================================

// communaute peut publier des terrains/lotissements
const ALLOWED_ROLES = ['agent', 'proprietaire', 'agence', 'promoteur', 'communaute', 'admin'] as const

// =============================================================================
// Server Action : créer une annonce
// =============================================================================

export async function createProperty(
  input: CreatePropertyInput
): Promise<ActionResult<Property>> {
  try {
    const supabase = await createClient()

    // ── 1. Authentification ───────────────────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Vous devez être connecté pour publier une annonce.',
      }
    }

    // ── 2. Vérification du rôle ───────────────────────────────────────────────
    const profileResult = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileResult.data as { role: string } | null
    const profileError = profileResult.error

    if (profileError || !profile) {
      return { success: false, error: 'Profil utilisateur introuvable.' }
    }

    if (!ALLOWED_ROLES.includes(profile.role as typeof ALLOWED_ROLES[number])) {
      return {
        success: false,
        error: 'Seuls les propriétaires, agences et promoteurs peuvent publier des annonces.',
      }
    }

    // ── 3. Validation des données entrantes ───────────────────────────────────
    const parsed = PropertySchema.safeParse(input)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return {
        success: false,
        error: `Données invalides : ${firstError.path.join('.')} — ${firstError.message}`,
      }
    }

    // ── 4. Insertion en base ──────────────────────────────────────────────────
    const { data, error: insertError } = await supabase
      .from('properties')
      .insert({
        ...parsed.data,
        owner_id: user.id,
        statut:   'actif',
      })
      .select()
      .single()

    if (insertError) {
      console.error('[createProperty] Supabase insert error:', insertError.message)
      return {
        success: false,
        error: "Erreur lors de l'enregistrement. Veuillez réessayer.",
      }
    }

    // ── 5. Revalidation du cache Next.js ──────────────────────────────────────
    revalidatePath('/annonces')
    revalidatePath('/dashboard/annonces')

    return { success: true, data: data as unknown as Property }

  } catch (err) {
    console.error('[createProperty] Unexpected error:', err)
    return { success: false, error: 'Une erreur inattendue est survenue.' }
  }
}

// =============================================================================
// Server Action : changer le statut d'un bien (actif → loue / vendu…)
// =============================================================================

export async function updatePropertyStatus(
  propertyId: string,
  statut: Extract<PropertyStatus, 'actif' | 'loue' | 'vendu' | 'inactif'>
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Non authentifié.' }
    }

    // La politique RLS vérifie également owner_id = auth.uid()
    // On l'ajoute aussi côté code pour un double filet de sécurité.
    const { error } = await supabase
      .from('properties')
      .update({ statut })
      .eq('id', propertyId)
      .eq('owner_id', user.id)

    if (error) {
      console.error('[updatePropertyStatus] error:', error.message)
      return { success: false, error: 'Mise à jour impossible.' }
    }

    revalidatePath('/annonces')
    revalidatePath(`/annonces/${propertyId}`)
    revalidatePath('/dashboard/annonces')

    return { success: true, data: undefined }

  } catch (err) {
    console.error('[updatePropertyStatus] Unexpected error:', err)
    return { success: false, error: 'Erreur inattendue.' }
  }
}

// =============================================================================
// Server Action : supprimer une annonce
// =============================================================================

export async function deleteProperty(
  propertyId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Non authentifié.' }
    }

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('owner_id', user.id) // RLS + double sécurité code

    if (error) {
      console.error('[deleteProperty] error:', error.message)
      return { success: false, error: 'Suppression impossible.' }
    }

    revalidatePath('/annonces')
    revalidatePath('/dashboard/annonces')

    return { success: true, data: undefined }

  } catch (err) {
    console.error('[deleteProperty] Unexpected error:', err)
    return { success: false, error: 'Erreur inattendue.' }
  }
}
