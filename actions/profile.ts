'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const ProfileSchema = z.object({
  nom:       z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  telephone: z.string().max(25).optional(),
})

export async function updateProfile(
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const parsed = ProfileSchema.safeParse({
    nom:       formData.get('nom'),
    telephone: (formData.get('telephone') as string) || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('profiles')
    .update({ nom: parsed.data.nom, telephone: parsed.data.telephone ?? null })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profil')
  return { success: true }
}
