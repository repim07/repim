'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function adminSignupAction(
  formData: FormData
): Promise<{ error: string } | { ok: true }> {
  try {
    const nom      = (formData.get('nom')      as string ?? '').trim()
    const email    = (formData.get('email')    as string ?? '').trim()
    const password = (formData.get('password') as string ?? '')
    const code     = (formData.get('code')     as string ?? '').trim()

    if (!nom || nom.length < 2) return { error: 'Le nom doit contenir au moins 2 caractères.' }
    if (!email)                  return { error: 'Email requis.' }
    if (password.length < 8)     return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
    if (!code)                   return { error: 'Le code d\'accès administrateur est requis.' }

    // Vérification du code secret
    const adminCode = process.env.ADMIN_SIGNUP_CODE
    if (!adminCode) {
      return { error: 'Configuration manquante : ADMIN_SIGNUP_CODE non défini dans les variables d\'environnement.' }
    }
    if (code !== adminCode) {
      return { error: 'Code d\'accès incorrect.' }
    }

    const admin = createAdminClient()

    // Création du compte auth (email_confirm: true = pas de mail de vérification)
    const { data, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nom, role: 'admin' },
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        return { error: 'Cette adresse email est déjà utilisée.' }
      }
      return { error: authError.message }
    }

    if (!data.user) {
      return { error: 'La création du compte a échoué.' }
    }

    const userId = data.user.id

    // Laisser le trigger handle_new_user s'exécuter
    await new Promise((r) => setTimeout(r, 800))

    // UPSERT : crée le profil s'il n'existe pas, le met à jour sinon.
    // Nécessaire car admin.auth.admin.createUser peut contourner le trigger.
    const { error: upsertError } = await admin
      .from('profiles')
      .upsert(
        { id: userId, email, nom, role: 'admin' },
        { onConflict: 'id' }
      )

    if (upsertError) {
      console.error('[adminSignupAction] profile upsert error:', upsertError.message)
      // Non bloquant si le profil a déjà été créé par le trigger
    }

    return { ok: true }
  } catch (err) {
    console.error('[adminSignupAction]', err)
    return { error: 'Une erreur inattendue s\'est produite.' }
  }
}
