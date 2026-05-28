'use server'

// =============================================================================
// REPIM — Server Actions d'administration KYC
// =============================================================================
// Ces actions sont réservées aux administrateurs.
// Elles approuvent ou rejettent les dossiers de certification pro.
//
// IMPORTANT : on utilise createClient() (client normal avec cookies de session)
// et NON createAdminClient(), afin que auth.uid() soit défini dans le trigger
// enforce_status_transition(). Le trigger lit le rôle de l'appelant via
// auth.uid() pour autoriser les transitions admin (pending_review → verified /
// rejected / suspended).
// =============================================================================

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Type de retour commun ─────────────────────────────────────────────────────

type ActionResult = { success: true } | { success: false; error: string }

// ── Garde : seul un admin peut exécuter ces actions ──────────────────────────

async function assertAdmin(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié.')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role?: string } | null)?.role !== 'admin') {
    throw new Error('Accès refusé : rôle admin requis.')
  }

  return user.id
}

// =============================================================================
// 1. APPROUVER UN DOSSIER (pending_review → verified)
// =============================================================================

export async function approveKycDossier(proId: string): Promise<ActionResult> {
  try {
    await assertAdmin()

    // Client normal : auth.uid() = admin user → trigger autorise la transition
    const supabase = await createClient()

    const { error } = await supabase
      .from('pro_profiles')
      .update({ verification_status: 'verified' })
      .eq('id', proId)

    if (error) {
      console.error('[approveKycDossier]', error.message)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/admin/validations')
    revalidatePath('/dashboard/admin')

    return { success: true }

  } catch (err) {
    console.error('[approveKycDossier]', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur inattendue.',
    }
  }
}

// =============================================================================
// 2. REJETER UN DOSSIER (pending_review → rejected) avec motif obligatoire
// =============================================================================

export async function rejectKycDossier(
  proId:  string,
  reason: string,
): Promise<ActionResult> {
  try {
    await assertAdmin()

    if (!reason || reason.trim().length < 10) {
      return { success: false, error: 'Le motif de rejet doit contenir au moins 10 caractères.' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('pro_profiles')
      .update({
        verification_status: 'rejected',
        rejection_reason:    reason.trim(),
      })
      .eq('id', proId)

    if (error) {
      console.error('[rejectKycDossier]', error.message)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/admin/validations')
    revalidatePath('/dashboard/admin')

    return { success: true }

  } catch (err) {
    console.error('[rejectKycDossier]', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur inattendue.',
    }
  }
}

// =============================================================================
// 3. SUSPENDRE UN COMPTE (any → suspended)
// =============================================================================

export async function suspendKycDossier(proId: string, reason: string): Promise<ActionResult> {
  try {
    await assertAdmin()

    if (!reason || reason.trim().length < 10) {
      return { success: false, error: 'Le motif de suspension doit contenir au moins 10 caractères.' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('pro_profiles')
      .update({
        verification_status: 'suspended',
        rejection_reason:    reason.trim(),
      })
      .eq('id', proId)

    if (error) {
      console.error('[suspendKycDossier]', error.message)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/admin/validations')
    revalidatePath(`/dashboard/admin/validations/${proId}`)

    return { success: true }

  } catch (err) {
    console.error('[suspendKycDossier]', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur inattendue.',
    }
  }
}
