'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(
  formData: FormData
): Promise<{ error: string } | never> {
  try {
    const email      = (formData.get('email')    as string ?? '').trim()
    const password   =  formData.get('password') as string ?? ''
    const redirectTo = (formData.get('redirect') as string) || ''

    if (!email || !password) {
      return { error: 'Email et mot de passe requis.' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      return { error: 'Email ou mot de passe incorrect.' }
    }

    // Redirection explicite passée (ex: depuis une route protégée)
    if (redirectTo && redirectTo.startsWith('/')) {
      redirect(redirectTo)
    }

    // Redirection selon le rôle (service_role pour contourner RLS)
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = (profile as { role?: string } | null)?.role ?? 'chercheur'

    redirect(role === 'admin' ? '/dashboard/admin' : '/dashboard')
  } catch (err: unknown) {
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
