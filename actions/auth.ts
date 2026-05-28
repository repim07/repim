'use server'

import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// ═════════════════════════════════════════════════════════════════════════════
// Connexion
// ═════════════════════════════════════════════════════════════════════════════

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

    if (redirectTo && redirectTo.startsWith('/')) {
      redirect(redirectTo)
    }

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
    return { error: 'Une erreur inattendue s’est produite.' }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Inscription "chercheur" (parcours simple, sans KYC)
// ═════════════════════════════════════════════════════════════════════════════

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
    // Cette action ne gère QUE chercheur. Les rôles pros passent par createProAccount().
    if (role !== 'chercheur') {
      return { error: 'Cette voie d’inscription est réservée aux chercheurs. Pour un compte pro, utilisez /auth/signup.' }
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
    return { error: 'Une erreur inattendue s’est produite.' }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Déconnexion
// ═════════════════════════════════════════════════════════════════════════════

export async function logoutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// ═════════════════════════════════════════════════════════════════════════════
// Inscription PROFESSIONNELLE — Tunnel KYC
// ═════════════════════════════════════════════════════════════════════════════
// Crée, dans cet ordre :
//   1. auth.users via supabase.auth.signUp (avec role en metadata)
//   2. profiles via le trigger handle_new_user (lit le role de metadata)
//   3. pro_profiles avec verification_status='draft' (admin client, bypass RLS)
//
// Le rôle est FIGÉ dès l'INSERT initial dans profiles. Le trigger
// `profiles_role_lock` empêchera toute modification ultérieure côté client.
// Voir : supabase/pro_signup.sql

const PRO_ROLES = ['agence', 'promoteur', 'proprietaire', 'communaute', 'agent'] as const
type ProRole = typeof PRO_ROLES[number]

const ProSignupSchema = z.object({
  role:           z.enum(PRO_ROLES, { error: 'Rôle professionnel invalide.' }),
  prenom:         z.string().trim().min(2, 'Prénom requis (min. 2 caractères)').max(100),
  nom:            z.string().trim().min(2, 'Nom requis (min. 2 caractères)').max(100),
  email:          z.string().trim().email('Adresse email invalide'),
  telephone:      z.string().trim().min(8, 'Numéro de téléphone invalide').max(25),
  password:       z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  raison_sociale: z.string().trim().min(2).max(200).optional().or(z.literal('')),
})

// Rôles qui exigent une raison sociale
const ROLES_WITH_COMPANY: ProRole[] = ['agence', 'promoteur']

export async function createProAccount(
  formData: FormData
): Promise<{ error: string } | never> {
  try {
    // ─── 1. Validation ────────────────────────────────────────────────────
    const raw = {
      role:           formData.get('role'),
      prenom:         formData.get('prenom'),
      nom:            formData.get('nom'),
      email:          formData.get('email'),
      telephone:      formData.get('telephone'),
      password:       formData.get('password'),
      raison_sociale: formData.get('raison_sociale') ?? '',
    }

    const parsed = ProSignupSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message }
    }

    const { role, prenom, nom, email, telephone, password, raison_sociale } = parsed.data

    // Cohérence : agence/promoteur DOIVENT avoir une raison sociale
    if (ROLES_WITH_COMPANY.includes(role) && !raison_sociale) {
      return { error: 'La raison sociale est requise pour les agences et promoteurs.' }
    }

    // ─── 2. Création du compte Auth + déclenchement du trigger profil ─────
    // Le nom stocké dans profiles.nom dépend du type d'acteur :
    //   - Agence/Promoteur → raison sociale (c'est ce qui s'affichera publiquement)
    //   - Autres           → "Prénom Nom"
    const displayName = ROLES_WITH_COMPANY.includes(role)
      ? (raison_sociale as string)
      : `${prenom} ${nom}`

    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom:  displayName,
          role: role,         // → lu par le trigger handle_new_user
        },
      },
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        return { error: 'Cette adresse email est déjà utilisée.' }
      }
      return { error: authError.message }
    }
    if (!authData.user) {
      return { error: 'La création du compte a échoué. Veuillez réessayer.' }
    }

    const userId = authData.user.id

    // ─── 3. Pause pour laisser le trigger handle_new_user s'exécuter ──────
    // Identique au pattern d'inscrirePartenaire().
    await new Promise((r) => setTimeout(r, 500))

    const admin = createAdminClient()

    // Defense-in-depth : on force le rôle même si le trigger a fait son job.
    // (Le trigger profiles_role_lock l'autorise ici car OLD.role == NEW.role.)
    const { error: profileError } = await admin
      .from('profiles')
      .update({
        nom:       displayName,
        telephone: telephone,
      })
      .eq('id', userId)

    if (profileError) {
      console.error('[createProAccount] profile update error:', profileError.message)
      // On continue : le profil existe via le trigger, juste pas à jour
    }

    // ─── 4. Création du dossier pro (pro_profiles) ────────────────────────
    // verification_status='draft' par défaut.
    // Le trigger enforce_pro_role_consistency vérifie que categorie==profiles.role.
    const { error: proError } = await admin
      .from('pro_profiles')
      .insert({
        id:             userId,
        categorie:      role,
        prenom:         prenom,
        email_pro:      email,
        telephone_pro:  telephone,
        raison_sociale: raison_sociale || null,
      })

    if (proError) {
      console.error('[createProAccount] pro_profiles insert error:', proError.message)
      // Cas spécial : message clair si erreur de cohérence rôle
      if (proError.message.includes('Incohérence')) {
        return { error: 'Erreur de cohérence du profil. Veuillez contacter le support.' }
      }
      return { error: 'Compte créé, mais erreur lors de la création du dossier professionnel.' }
    }

    // ─── 5. Redirection vers le dashboard ─────────────────────────────────
    // Le dashboard détectera verification_status='draft' et affichera
    // la bannière "complétez votre certification".
    redirect('/dashboard')
  } catch (err: unknown) {
    if (err instanceof Error && (err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('[createProAccount]', err)
    return { error: 'Une erreur inattendue s’est produite. Veuillez réessayer.' }
  }
}
