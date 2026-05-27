'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Appointment } from '@/types/database'

const AppointmentSchema = z.object({
  property_id: z.string().uuid('ID de bien invalide'),
  date_visite: z
    .string()
    .datetime({ message: 'Date invalide' })
    .refine((d) => new Date(d) > new Date(), {
      message: 'La date de visite doit être dans le futur',
    }),
  message: z.string().max(500).optional(),
})

export type CreateAppointmentInput = z.infer<typeof AppointmentSchema>

// =============================================================================
// Server Action : demander une visite
// =============================================================================

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<ActionResult<Appointment>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Vous devez être connecté pour planifier une visite.' }
    }

    const parsed = AppointmentSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    // Vérifier que le bien existe et est actif
    const propResult = await supabase
      .from('properties')
      .select('id, statut, owner_id')
      .eq('id', parsed.data.property_id)
      .eq('statut', 'actif')
      .single()
    const property = propResult.data as { id: string; statut: string; owner_id: string } | null
    const propError = propResult.error

    if (propError || !property) {
      return { success: false, error: 'Ce bien est indisponible ou introuvable.' }
    }

    // Un propriétaire ne peut pas prendre RDV sur son propre bien
    if (property.owner_id === user.id) {
      return { success: false, error: 'Vous ne pouvez pas prendre RDV sur votre propre bien.' }
    }

    const { data, error: insertError } = await supabase
      .from('appointments')
      .insert({
        property_id: parsed.data.property_id,
        user_id:     user.id,
        date_visite: parsed.data.date_visite,
        message:     parsed.data.message ?? null,
        statut:      'en_attente',
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: false, error: 'Vous avez déjà un RDV prévu à cette date pour ce bien.' }
      }
      console.error('[createAppointment] error:', insertError.message)
      return { success: false, error: "Impossible de créer le rendez-vous." }
    }

    revalidatePath('/dashboard/mes-visites')

    return { success: true, data: data as unknown as Appointment }

  } catch (err) {
    console.error('[createAppointment] Unexpected error:', err)
    return { success: false, error: 'Erreur inattendue.' }
  }
}

// =============================================================================
// Server Action : confirmer ou annuler un RDV (propriétaire)
// =============================================================================

export async function updateAppointmentStatus(
  appointmentId: string,
  statut: 'confirme' | 'annule'
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
      .from('appointments')
      .update({ statut })
      .eq('id', appointmentId)

    if (error) {
      return { success: false, error: 'Mise à jour impossible.' }
    }

    revalidatePath('/dashboard/visites')

    return { success: true, data: undefined }

  } catch (err) {
    console.error('[updateAppointmentStatus]', err)
    return { success: false, error: 'Erreur inattendue.' }
  }
}
