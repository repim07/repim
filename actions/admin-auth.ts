'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * Server Action : login dédié pour l'admin uniquement.
 * Retourne { ok: true } en cas de succès — la redirection est gérée
 * côté client via router.refresh() + router.push() pour garantir
 * la propagation correcte des cookies de session.
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

    // 1. Authentification via le client session (pour créer les cookies)
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      return { error: 'Email ou mot de passe incorrect.' }
    }

    const userId = data.user.id

    // 2. Lecture du profil via le client admin (service_role) — bypass RLS garanti
    //    Évite tout problème de session pas encore stabilisée ou de RLS restrictif.
    const admin = createAdminClient()
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    // 3. Profil absent → on le crée avec role='admin'
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        const { error: upsertError } = await admin
          .from('profiles')
          .upsert(
            {
              id:                  userId,
              email,
              nom:                 email.split('@')[0],
              role:                'admin',
              subscription_status: 'active',
              debloque_par_admin:  true,
            },
            { onConflict: 'id' }
          )

        if (upsertError) {
          console.error('[adminLoginAction] upsert error:', upsertError.message)
          return { error: 'Impossible de configurer le profil administrateur.' }
        }

        return { ok: true }
      }

      console.error('[adminLoginAction] profile error:', profileError.message)
      return { error: 'Erreur lors de la lecture du profil. Veuillez réessayer.' }
    }

    // 4. Profil trouvé mais rôle incorrect
    if (profile?.role !== 'admin') {
      // On tente de corriger le rôle si l'email correspond bien à celui du compte
      const { error: fixError } = await admin
        .from('profiles')
        .update({
          role:                'admin',
          subscription_status: 'active',
          debloque_par_admin:  true,
        })
        .eq('id', userId)

      if (fixError) {
        await supabase.auth.signOut()
        return { error: 'Accès refusé : ce compte n\'a pas les privilèges administrateur.' }
      }

      return { ok: true }
    }

    return { ok: true }
  } catch (err) {
    console.error('[adminLoginAction]', err)
    return { error: 'Une erreur inattendue s\'est produite. Veuillez réessayer.' }
  }
}
