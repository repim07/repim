'use server'

import { createClient } from '@/lib/supabase/server'

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

    // Vérifier le rôle. Un accès non-admin est immédiatement déconnecté.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      return { error: 'Erreur lors de la vérification du compte.' }
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
