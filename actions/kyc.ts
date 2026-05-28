'use server'

// =============================================================================
// REPIM — Server Actions pour le tunnel KYC
// =============================================================================
// Ces actions sont appelées depuis le composant client KycClient.tsx.
// Elles s'exécutent côté serveur et ont accès à Supabase avec les bons droits.
//
// Actions disponibles :
//   uploadKycDocument(formData)  — téléverse un document dans le bucket privé
//   deleteKycDocument(docType)   — supprime un document (uniquement en draft)
//   submitKycDossier()           — envoie le dossier en revue (draft → pending)
//   resetKycToDraft()            — remet en draft après rejet (rejected → draft)
// =============================================================================

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Constantes ────────────────────────────────────────────────────────────────

const BUCKET = 'kyc-documents'   // bucket Supabase Storage privé

const VALID_DOC_TYPES = [
  'agrement_mclu',
  'rccm',
  'dfe',
  'cni_dirigeant',
  'carte_professionnelle',
  'attestation_villageoise',
  'avis_lotissement',
  'attestation_mandat',
] as const

// Taille max : 10 Mo (en octets)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Types MIME acceptés
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

type ActionResult = { success: true } | { success: false; error: string }

/** S'assure que le bucket de stockage existe (idempotent). */
async function ensureBucket(adminStorage: ReturnType<typeof createAdminClient>['storage']) {
  // createBucket renvoie une erreur si le bucket existe déjà → on l'ignore
  await adminStorage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: ALLOWED_TYPES,
  })
}

/** Chemin de stockage standardisé pour un document. */
function storagePath(userId: string, docType: string, ext: string) {
  return `${userId}/${docType}.${ext}`
}

/** Extension depuis le type MIME. */
function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg':       'jpg',
    'image/png':        'png',
    'image/webp':       'webp',
    'image/heic':       'heic',
    'application/pdf':  'pdf',
  }
  return map[mime] ?? 'bin'
}

// =============================================================================
// 1. UPLOAD D'UN DOCUMENT
// =============================================================================
// Appelé via <form action={uploadKycDocument}> avec les champs :
//   - file     : le fichier sélectionné
//   - doc_type : le type de document (ex: 'cni_dirigeant')

export async function uploadKycDocument(formData: FormData): Promise<ActionResult> {
  try {
    // ─── Auth ──────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Non authentifié.' }

    // ─── Récupération des paramètres ───────────────────────────────────────
    const file    = formData.get('file')    as File | null
    const docType = formData.get('doc_type') as string | null

    if (!file || file.size === 0) return { success: false, error: 'Aucun fichier sélectionné.' }
    if (!docType || !VALID_DOC_TYPES.includes(docType as typeof VALID_DOC_TYPES[number])) {
      return { success: false, error: 'Type de document invalide.' }
    }

    // ─── Validation du fichier ─────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: `Fichier trop volumineux. Maximum : 10 Mo (reçu : ${(file.size / 1024 / 1024).toFixed(1)} Mo).` }
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Format non accepté. Utilisez JPG, PNG, WEBP, HEIC ou PDF.' }
    }

    // ─── Vérification du statut KYC ───────────────────────────────────────
    const admin = createAdminClient()
    const { data: proProfile } = await admin
      .from('pro_profiles')
      .select('verification_status')
      .eq('id', user.id)
      .single()

    const status = (proProfile as { verification_status?: string } | null)?.verification_status
    if (!status) return { success: false, error: 'Profil professionnel introuvable.' }

    if (status === 'pending_review') {
      return { success: false, error: 'Votre dossier est déjà en cours d\'examen. Aucune modification possible.' }
    }
    if (status === 'verified') {
      return { success: false, error: 'Votre dossier est déjà certifié.' }
    }
    if (status === 'suspended') {
      return { success: false, error: 'Compte suspendu. Contactez le support.' }
    }

    // ─── Si rejeté → on remet en draft d'abord ────────────────────────────
    // (utilise le client normal pour que auth.uid() = user.id dans le trigger)
    if (status === 'rejected') {
      const { error: resetErr } = await supabase
        .from('pro_profiles')
        .update({ verification_status: 'draft' })
        .eq('id', user.id)

      if (resetErr) {
        console.error('[uploadKycDocument] reset draft error:', resetErr.message)
        // On continue quand même : l'admin client ignorera le trigger
      }
    }

    // ─── Création du bucket si nécessaire ─────────────────────────────────
    await ensureBucket(admin.storage)

    // ─── Supprime l'ancien fichier s'il existe (pour éviter les doublons) ─
    const { data: existing } = await admin
      .from('pro_documents')
      .select('storage_path')
      .eq('pro_profile_id', user.id)
      .eq('doc_type', docType)
      .single()

    if (existing?.storage_path) {
      await admin.storage.from(BUCKET).remove([existing.storage_path])
    }

    // ─── Upload dans Supabase Storage ─────────────────────────────────────
    const ext  = extFromMime(file.type)
    const path = storagePath(user.id, docType, ext)

    const bytes = await file.arrayBuffer()
    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType:  file.type,
        upsert:       true,   // écrase si même chemin
      })

    if (uploadErr) {
      console.error('[uploadKycDocument] storage error:', uploadErr.message)
      return { success: false, error: 'Erreur lors du téléversement du fichier.' }
    }

    // ─── Upsert dans pro_documents ─────────────────────────────────────────
    // ON CONFLICT (pro_profile_id, doc_type) → UPDATE
    const { error: dbErr } = await admin
      .from('pro_documents')
      .upsert(
        {
          pro_profile_id: user.id,
          doc_type:       docType,
          storage_path:   path,
          status:         'pending',   // réinitialisé à "pending" sur chaque upload
          reviewer_notes: null,
          reviewed_at:    null,
          uploaded_at:    new Date().toISOString(),
        },
        { onConflict: 'pro_profile_id,doc_type' }
      )

    if (dbErr) {
      console.error('[uploadKycDocument] db error:', dbErr.message)
      // Supprime le fichier si l'insertion DB a échoué
      await admin.storage.from(BUCKET).remove([path])
      return { success: false, error: 'Erreur lors de l\'enregistrement du document.' }
    }

    // ─── Rafraîchit la page ─────────────────────────────────────────────
    revalidatePath('/dashboard/kyc')
    revalidatePath('/dashboard')

    return { success: true }

  } catch (err) {
    console.error('[uploadKycDocument]', err)
    return { success: false, error: 'Une erreur inattendue s\'est produite.' }
  }
}

// =============================================================================
// 2. SUPPRESSION D'UN DOCUMENT
// =============================================================================

export async function deleteKycDocument(docType: string): Promise<ActionResult> {
  try {
    // ─── Auth ──────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Non authentifié.' }

    // ─── Vérification du statut ────────────────────────────────────────────
    const admin = createAdminClient()
    const { data: proProfile } = await admin
      .from('pro_profiles')
      .select('verification_status')
      .eq('id', user.id)
      .single()

    const status = (proProfile as { verification_status?: string } | null)?.verification_status
    if (status !== 'draft') {
      return { success: false, error: 'Suppression impossible : le dossier n\'est pas en mode brouillon.' }
    }

    // ─── Récupère le chemin de stockage ────────────────────────────────────
    const { data: doc } = await admin
      .from('pro_documents')
      .select('storage_path')
      .eq('pro_profile_id', user.id)
      .eq('doc_type', docType)
      .single()

    if (!doc) return { success: false, error: 'Document introuvable.' }

    // ─── Supprime du storage ───────────────────────────────────────────────
    await admin.storage.from(BUCKET).remove([doc.storage_path])

    // ─── Supprime de la DB ─────────────────────────────────────────────────
    const { error: dbErr } = await admin
      .from('pro_documents')
      .delete()
      .eq('pro_profile_id', user.id)
      .eq('doc_type', docType)

    if (dbErr) {
      console.error('[deleteKycDocument] db error:', dbErr.message)
      return { success: false, error: 'Erreur lors de la suppression du document.' }
    }

    revalidatePath('/dashboard/kyc')
    return { success: true }

  } catch (err) {
    console.error('[deleteKycDocument]', err)
    return { success: false, error: 'Une erreur inattendue s\'est produite.' }
  }
}

// =============================================================================
// 3. SOUMISSION DU DOSSIER (draft → pending_review)
// =============================================================================
// Utilise le client NORMAL (pas admin) pour que auth.uid() soit défini dans
// le trigger enforce_status_transition qui vérifie is_dossier_complete().

export async function submitKycDossier(): Promise<ActionResult> {
  try {
    // ─── Auth ──────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Non authentifié.' }

    // ─── Mise à jour du statut via le client normal ────────────────────────
    // Le trigger enforce_status_transition() vérifiera :
    //   1. Que l'appelant est bien le propriétaire (auth.uid() = NEW.id)
    //   2. Que is_dossier_complete() retourne true
    // Si le dossier est incomplet, une exception SQL sera levée.
    const { error: updateErr } = await supabase
      .from('pro_profiles')
      .update({ verification_status: 'pending_review' })
      .eq('id', user.id)

    if (updateErr) {
      console.error('[submitKycDossier] error:', updateErr.message)

      // Message d'erreur lisible si le dossier est incomplet
      if (updateErr.message.includes('incomplet') || updateErr.message.includes('requis')) {
        return { success: false, error: 'Dossier incomplet : certains documents obligatoires sont manquants.' }
      }
      if (updateErr.message.includes('non autorisée')) {
        return { success: false, error: 'Transition de statut non autorisée depuis l\'état actuel.' }
      }

      return { success: false, error: updateErr.message }
    }

    revalidatePath('/dashboard/kyc')
    revalidatePath('/dashboard')

    return { success: true }

  } catch (err) {
    console.error('[submitKycDossier]', err)
    return { success: false, error: 'Une erreur inattendue s\'est produite.' }
  }
}

// =============================================================================
// 4. REMISE EN DRAFT APRÈS REJET (rejected → draft)
// =============================================================================

export async function resetKycToDraft(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Non authentifié.' }

    const { error } = await supabase
      .from('pro_profiles')
      .update({ verification_status: 'draft' })
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/kyc')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('[resetKycToDraft]', err)
    return { success: false, error: 'Une erreur inattendue s\'est produite.' }
  }
}
