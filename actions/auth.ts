'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(
  formData: FormData
): Promise<{ error: string } | never> {
  try {
    const email      = (formData.get('email')    as string ?? '').trim()
    const password   =  formData.get('password') as string ?? ''
    const redirectTo = (formData.get('redirect') as string) || '/dashboard'

    if (!email || !password) {
      return { error: 'Email et mot de passe requis.' }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: 'Email ou mot de passe incorrect.' }
    }

    redirect(redirectTo)
  } catch (err: unknown) {
    // redirect() throws — il faut le relancer
    if (err instanceof Error && (err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('[loginAction]', err)
    return { error: 'Une erreur inattendue s\'est produite.' }
  }
}

export async function signupAction(
  formData: FormData
): Promise<{ error: string } | never> {
  try {
    const nom      = (formData.get('nom')      as string ?? '').trim()
    const email    = (formData.get('email')    as string ?? '').trim()
    const password =  formData.get('password') as string ?? ''
    const role     = (formData.get('role')     as string) || 'chercheur'

    if (nom.length < 2) {
      return { error: 'Le nom doit contenir au moins 2 caractères.' }
    }
    if (password.length < 6) {
      return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }
    }
    if (!['chercheur', 'proprietaire', 'agence', 'promoteur'].includes(role)) {
      return { error: 'Rôle invalide.' }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nom, role } },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return { error: 'Cette adresse email est déjà utilisée.' }
      }
      return { error: error.message }
    }

    redirect('/dashboard')
  } catch (err: unknown) {
    if (err instanceof Error && (err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('[signupAction]', err)
    return { error: 'Une erreur inattendue s\'est produite.' }
  }
}

export async function logoutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
