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

    // Validation basique
    if (!nom || nom.length < 2)      return { error: 'Le nom doit contenir au moins 2 caractères.' }
    if (!email)                       return { error: 'Email requis.' }
    if (password.length < 8)          return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
    if (!code)                        return { error: 'Le code d\'accès administrateur est requis.' }

    // Vérification du code secret (défini dans les variables d'environnement Vercel)
    const adminCode = process.env.ADMIN_SIGNUP_CODE
    if (!adminCode) {
      return { error: 'Configuration manquante : ADMIN_SIGNUP_CODE non défini dans les variables d\'environnement.' }
    }
    if (code !== adminCode) {
      return { error: 'Code d\'accès incorrect.' }
    }

    // Création du compte via le client admin (service_role)
    const admin = createAdminClient()

    const { data, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // pas besoin de vérifier l'email pour un admin
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

    // Mise à jour du profil — le trigger handle_new_user crée le profil,
    // mais avec role='chercheur' par défaut. On force 'admin' ici.
    await new Promise((r) => setTimeout(r, 500))

    const { error: profileError } = await admin
      .from('profiles')
      .update({ nom, role: 'admin' })
      .eq('id', data.user.id)

    if (profileError) {
      console.error('[adminSignupAction] profile update error:', profileError.message)
    }

    return { ok: true }
  } catch (err) {
    console.error('[adminSignupAction]', err)
    return { error: 'Une erreur inattendue s\'est produite.' }
  }
}
