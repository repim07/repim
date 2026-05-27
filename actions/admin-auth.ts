'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * Server Action : login dédié pour l'admin uniquement.
 * Retourne { ok: true } en cas de succès — la redirection est gérée
 * côté client via router.push() pour garantir la propagation des cookies.
 */
export async function adminLoginAction(
  formData: FormData
): Promise<{ error: string } | { ok: true }> {
  try {
    const email    = (formData.get('email')    as string ?? '').trim()
    const password = (formData.get('password') as string ?? '')

    if (!email || !password) {
      return { error: 'Email et mot de passe requis.' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      return { error: 'Email ou mot de passe incorrect.' }
    }

    const userId = data.user.id

    // Lecture du profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    // Si le profil est absent (PGRST116), on tente de le créer via admin client
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profil non créé par le trigger — on le crée maintenant
        const admin = createAdminClient()
        await admin
          .from('profiles')
          .upsert(
            { id: userId, email, nom: email.split('@')[0], role: 'admin' },
            { onConflict: 'id' }
          )

        // Nouvelle tentative de lecture
        const { data: profileRetry } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()

        if (profileRetry?.role !== 'admin') {
          await supabase.auth.signOut()
          return { error: 'Compte non configuré comme administrateur. Contactez le support.' }
        }

        return { ok: true }
      }

      await supabase.auth.signOut()
      return { error: 'Erreur lors de la vérification du compte. Veuillez réessayer.' }
    }

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      return { error: 'Accès refusé : ce compte n\'a pas les privilèges administrateur.' }
    }

    return { ok: true }
  } catch (err) {
    console.error('[adminLoginAction]', err)
    return { error: 'Une erreur inattendue s\'est produite. Veuillez réessayer.' }
  }
}
