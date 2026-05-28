'use client'

// =============================================================================
// REPIM — Formulaire de publication d'annonce
// =============================================================================
// Gère :
//  1. Sélection + prévisualisation des photos (JPEG/PNG/WEBP, max 5 Mo, max 10)
//  2. Sélection de vidéos (MP4/MOV, max 50 Mo, max 2)
//  3. Upload vers le bucket Supabase Storage "annonces" (public)
//  4. Barre de progression par fichier
//  5. Validation locale avant envoi
//  6. Appel de la Server Action createProperty pour enregistrer en base
// =============================================================================

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createProperty } from '@/actions/property'
import {
  Camera, Video, X, PlusCircle, Loader2, Upload,
  DollarSign, MapPin, CheckCircle2, AlertTriangle, Film,
} from 'lucide-react'

// ─── Constantes de validation ─────────────────────────────────────────────────

const BUCKET        = 'annonces'          // bucket Supabase Storage public
const MAX_PHOTOS    = 10                  // max 10 photos
const MAX_VIDEOS    = 2                   // max 2 vidéos
const MAX_PHOTO_MB  = 5                   // 5 Mo par photo
const MAX_VIDEO_MB  = 50                  // 50 Mo par vidéo

// Formats acceptés
const PHOTO_ACCEPT  = 'image/jpeg,image/png,image/webp'
const VIDEO_ACCEPT  = 'video/mp4,video/quicktime,video/avi,video/x-msvideo'

// ─── Types locaux ─────────────────────────────────────────────────────────────

type PhotoItem = { file: File; preview: string; id: string }
type VideoItem = { file: File; id: string }

// ─── Composant ────────────────────────────────────────────────────────────────

export function AnnonceForm({ userId }: { userId: string }) {
  const router              = useRouter()
  const photoInputRef       = useRef<HTMLInputElement>(null)
  const videoInputRef       = useRef<HTMLInputElement>(null)
  const [isPending, start]  = useTransition()

  // ── State : médias ──
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])

  // ── State : retour utilisateur ──
  const [error,       setError]       = useState<string | null>(null)
  const [uploadInfo,  setUploadInfo]  = useState<string | null>(null)   // texte pendant upload
  const [uploadPct,   setUploadPct]   = useState<number>(0)             // 0-100 pour la barre

  // ── CSS réutilisables ──
  const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white'
  const labelCls = 'block text-sm font-medium text-stone-700 mb-1.5'

  // ─── Gestion des photos ────────────────────────────────────────────────────

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files    = Array.from(e.target.files ?? [])
    const slots    = MAX_PHOTOS - photos.length
    const accepted = files.slice(0, slots)

    const tooBig = accepted.filter(f => f.size > MAX_PHOTO_MB * 1024 * 1024)
    if (tooBig.length) {
      setError(`${tooBig.length} photo(s) dépassent ${MAX_PHOTO_MB} Mo et ont été ignorées. Compressez-les avant l'envoi.`)
      e.target.value = ''
      return
    }

    setError(null)
    setPhotos(prev => [
      ...prev,
      ...accepted.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id:      `${Date.now()}-${Math.random()}`,
      })),
    ])
    e.target.value = ''
  }

  function removePhoto(id: string) {
    setPhotos(prev => {
      const item = prev.find(p => p.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter(p => p.id !== id)
    })
  }

  // ─── Gestion des vidéos ────────────────────────────────────────────────────

  function onVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files    = Array.from(e.target.files ?? [])
    const slots    = MAX_VIDEOS - videos.length
    const accepted = files.slice(0, slots)

    const tooBig = accepted.filter(f => f.size > MAX_VIDEO_MB * 1024 * 1024)
    if (tooBig.length) {
      setError(`${tooBig.length} vidéo(s) dépassent ${MAX_VIDEO_MB} Mo. Compressez ou rognez vos vidéos.`)
      e.target.value = ''
      return
    }

    setError(null)
    setVideos(prev => [
      ...prev,
      ...accepted.map(file => ({
        file,
        id: `${Date.now()}-${Math.random()}`,
      })),
    ])
    e.target.value = ''
  }

  function removeVideo(id: string) {
    setVideos(prev => prev.filter(v => v.id !== id))
  }

  // ─── Fonction d'upload vers Supabase Storage ──────────────────────────────
  // Retourne les URLs publiques des fichiers uploadés, ou null en cas d'erreur.

  async function uploadFiles(): Promise<string[] | null> {
    const supabase  = createClient()
    const allUrls: string[] = []
    const total     = photos.length + videos.length

    if (total === 0) return []

    let uploaded = 0

    // Upload des photos
    for (let i = 0; i < photos.length; i++) {
      const { file } = photos[i]
      const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      // Chemin : {userId}/photos/{timestamp}-{index}.{ext}
      const path = `${userId}/photos/${Date.now()}-${i}.${ext}`

      setUploadInfo(`Envoi photo ${i + 1}/${photos.length}…`)

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert:       false,
          contentType:  file.type,
        })

      if (uploadErr) {
        // Messages d'erreur explicites selon le type d'erreur
        if (uploadErr.message.includes('Bucket not found')) {
          setError('Erreur de configuration : le bucket de stockage "annonces" est introuvable. Contactez le support.')
        } else if (uploadErr.message.includes('not authorized') || uploadErr.message.includes('permission')) {
          setError('Erreur d\'autorisation : vous devez être connecté pour uploader des photos.')
        } else if (uploadErr.message.includes('Payload too large') || uploadErr.message.includes('size')) {
          setError(`Photo ${i + 1} trop volumineuse. Maximum autorisé : ${MAX_PHOTO_MB} Mo.`)
        } else {
          setError(`Erreur lors de l'envoi de la photo ${i + 1} : ${uploadErr.message}`)
        }
        return null
      }

      // Récupération de l'URL publique (bucket public → pas besoin de signer)
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path)

      allUrls.push(publicUrl)
      uploaded++
      setUploadPct(Math.round((uploaded / total) * 100))
    }

    // Upload des vidéos
    for (let i = 0; i < videos.length; i++) {
      const { file } = videos[i]
      const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'mp4'
      const path = `${userId}/videos/${Date.now()}-${i}.${ext}`

      setUploadInfo(`Envoi vidéo ${i + 1}/${videos.length} (peut prendre quelques secondes)…`)

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert:       false,
          contentType:  file.type,
        })

      if (uploadErr) {
        if (uploadErr.message.includes('Payload too large') || uploadErr.message.includes('size')) {
          setError(`Vidéo ${i + 1} trop volumineuse. Maximum autorisé : ${MAX_VIDEO_MB} Mo.`)
        } else {
          setError(`Erreur lors de l'envoi de la vidéo ${i + 1} : ${uploadErr.message}`)
        }
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path)

      allUrls.push(publicUrl)
      uploaded++
      setUploadPct(Math.round((uploaded / total) * 100))
    }

    return allUrls
  }

  // ─── Soumission du formulaire ──────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setUploadInfo(null)
    setUploadPct(0)

    const fd = new FormData(e.currentTarget)

    // Lecture des champs
    const titre    = (fd.get('titre')       as string).trim()
    const type     = (fd.get('type')        as string)
    const prixStr  = (fd.get('prix')        as string)
    const devise   = (fd.get('devise')      as string) || 'XOF'
    const ville    = (fd.get('ville')       as string).trim()
    const commune  = (fd.get('commune')     as string).trim()
    const quartier = (fd.get('quartier')    as string).trim()
    const adresse  = (fd.get('adresse')     as string).trim()
    const desc     = (fd.get('description') as string).trim()
    const standing = (fd.get('standing')    as string)
    const surfStr  = (fd.get('surface_m2')  as string)
    const piecStr  = (fd.get('nb_pieces')   as string)

    // Validations locales (avant de contacter Supabase)
    if (titre.length < 5)     { setError('Le titre doit contenir au moins 5 caractères.'); return }
    if (!type)                 { setError('Veuillez choisir un type de bien.'); return }
    const prix = parseFloat(prixStr)
    if (!prixStr || isNaN(prix) || prix <= 0) { setError('Veuillez saisir un prix valide (nombre positif).'); return }
    if (!ville)    { setError('La ville est obligatoire.'); return }
    if (!commune)  { setError('La commune est obligatoire.'); return }
    if (!quartier) { setError('Le quartier est obligatoire.'); return }

    start(async () => {
      // ── Étape 1 : Upload des médias ──────────────────────────────────────
      const mediaUrls = await uploadFiles()
      if (mediaUrls === null) {
        // uploadFiles a déjà mis à jour setError
        setUploadInfo(null)
        setUploadPct(0)
        return
      }

      setUploadInfo('Enregistrement de l\'annonce…')

      // ── Étape 2 : Création de l'annonce en base de données ────────────────
      const res = await createProperty({
        titre,
        type:        type as 'location' | 'vente' | 'colocation' | 'residence_meublee' | 'lotissement',
        prix,
        devise:      devise as 'XOF' | 'EUR' | 'USD',
        description: desc     || undefined,
        standing:    (standing as 'social' | 'normal' | 'haut_standing') || undefined,
        surface_m2:  surfStr  ? parseFloat(surfStr)   : undefined,
        nb_pieces:   piecStr  ? parseInt(piecStr, 10) : undefined,
        localisation: { ville, commune, quartier, adresse: adresse || undefined },
        photos:      mediaUrls,   // photos ET vidéos stockées dans ce tableau
      })

      if (!res.success) {
        setError(res.error)
        setUploadInfo(null)
        return
      }

      // ── Étape 3 : Nettoyage des Object URLs et redirection ────────────────
      photos.forEach(p => URL.revokeObjectURL(p.preview))
      router.push('/dashboard/annonces')
    })
  }

  // ─── Calcul de l'état de la barre de progression ──────────────────────────
  const totalFiles  = photos.length + videos.length
  const isUploading = isPending && uploadPct > 0 && uploadPct < 100

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — Informations générales
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4">
          Informations générales
        </h2>
        <div className="space-y-4">

          <div>
            <label className={labelCls}>
              Titre de l&apos;annonce <span className="text-orange-500">*</span>
            </label>
            <input
              name="titre" type="text" required minLength={5} maxLength={200}
              placeholder="ex : Villa 4 pièces à Cocody Angré"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Type <span className="text-orange-500">*</span></label>
              <select name="type" required defaultValue="" className={inputCls}>
                <option value="" disabled>Choisir…</option>
                <option value="location">Location</option>
                <option value="vente">Vente</option>
                <option value="colocation">Colocation</option>
                <option value="residence_meublee">Résidence meublée</option>
                <option value="lotissement">Lotissement</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Standing</label>
              <select name="standing" defaultValue="" className={inputCls}>
                <option value="">Non précisé</option>
                <option value="social">Social</option>
                <option value="normal">Normal</option>
                <option value="haut_standing">Haut standing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Surface (m²)</label>
              <input name="surface_m2" type="number" min={1} placeholder="85" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nombre de pièces</label>
              <input name="nb_pieces" type="number" min={1} max={50} placeholder="4" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              name="description" rows={4} maxLength={2000}
              placeholder="Décrivez votre bien : équipements, état général, accès, environnement…"
              className={`${inputCls} resize-none`}
            />
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — Prix
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-orange-500" />
          Prix
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Montant <span className="text-orange-500">*</span></label>
            <input
              name="prix" type="number" required min={1}
              placeholder="150 000"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Devise</label>
            <select name="devise" defaultValue="XOF" className={inputCls}>
              <option value="XOF">XOF (Franc CFA)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dollar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — Localisation
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          Localisation
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Ville <span className="text-orange-500">*</span></label>
            <input name="ville" type="text" required placeholder="Abidjan" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Commune <span className="text-orange-500">*</span></label>
            <input name="commune" type="text" required placeholder="Cocody" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Quartier <span className="text-orange-500">*</span></label>
            <input name="quartier" type="text" required placeholder="Angré" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Adresse <span className="text-stone-400 font-normal">(facultatif)</span></label>
            <input name="adresse" type="text" placeholder="Rue 123, côté marché" className={inputCls} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 — Photos
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-1 flex items-center gap-2">
          <Camera className="w-4 h-4 text-orange-500" />
          Photos
          <span className="ml-auto text-xs font-normal text-stone-400 normal-case tracking-normal">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </h2>
        <p className="text-xs text-stone-400 mb-4">
          JPG, PNG, WEBP · Max {MAX_PHOTO_MB} Mo par photo · {MAX_PHOTOS} photos maximum
        </p>

        {/* Zone de dépôt */}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="w-full border-2 border-dashed border-stone-200 rounded-xl p-7 text-center hover:border-orange-400 hover:bg-orange-50 transition-all focus:outline-none group mb-4"
          >
            <Upload className="w-8 h-8 text-stone-300 group-hover:text-orange-400 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-semibold text-stone-500 group-hover:text-orange-600">
              Cliquer pour ajouter des photos
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Sélection multiple autorisée
            </p>
          </button>
        )}

        {/* Input caché */}
        <input
          ref={photoInputRef}
          type="file"
          accept={PHOTO_ACCEPT}
          multiple
          onChange={onPhotoChange}
          className="hidden"
        />

        {/* Grille de prévisualisations */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {photos.map((p, idx) => (
              <div key={p.id} className="relative group aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.preview}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover rounded-xl border border-stone-100"
                />
                {/* Badge "Couverture" sur la 1re photo */}
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    Couverture
                  </span>
                )}
                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Supprimer cette photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Bouton "+" pour en ajouter */}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-orange-400 hover:bg-orange-50 transition-all text-stone-400 hover:text-orange-500"
              >
                <PlusCircle className="w-6 h-6" />
                <span className="text-xs font-medium">Ajouter</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5 — Vidéos (optionnel)
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-1 flex items-center gap-2">
          <Video className="w-4 h-4 text-orange-500" />
          Vidéos
          <span className="ml-1 text-xs font-normal text-stone-400 normal-case tracking-normal">(optionnel)</span>
          <span className="ml-auto text-xs font-normal text-stone-400 normal-case tracking-normal">
            {videos.length}/{MAX_VIDEOS}
          </span>
        </h2>
        <p className="text-xs text-stone-400 mb-4">
          MP4, MOV · Max {MAX_VIDEO_MB} Mo par vidéo · {MAX_VIDEOS} vidéos maximum
        </p>

        {/* Zone de dépôt vidéo */}
        {videos.length < MAX_VIDEOS && (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="w-full border-2 border-dashed border-stone-200 rounded-xl p-7 text-center hover:border-orange-400 hover:bg-orange-50 transition-all focus:outline-none group"
          >
            <Film className="w-8 h-8 text-stone-300 group-hover:text-orange-400 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-semibold text-stone-500 group-hover:text-orange-600">
              Cliquer pour ajouter une vidéo
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Visite virtuelle, tour du bien…
            </p>
          </button>
        )}

        <input
          ref={videoInputRef}
          type="file"
          accept={VIDEO_ACCEPT}
          multiple={false}
          onChange={onVideoChange}
          className="hidden"
        />

        {/* Liste des vidéos sélectionnées */}
        {videos.length > 0 && (
          <div className="mt-4 space-y-2">
            {videos.map((v, idx) => (
              <div
                key={v.id}
                className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Film className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{v.file.name}</p>
                  <p className="text-xs text-stone-400">
                    {(v.file.size / 1024 / 1024).toFixed(1)} Mo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeVideo(v.id)}
                  className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Supprimer cette vidéo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Barre de progression (visible uniquement pendant l'upload)
      ═══════════════════════════════════════════════════════════ */}
      {isPending && (uploadInfo || uploadPct > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadInfo ?? 'Traitement en cours…'}
            </span>
            {uploadPct > 0 && (
              <span className="text-blue-600 font-bold">{uploadPct}%</span>
            )}
          </div>
          {/* Barre de progression */}
          {uploadPct > 0 && (
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadPct}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          Message d'erreur
      ═══════════════════════════════════════════════════════════ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          Boutons de soumission
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {uploadInfo ?? 'Publication en cours…'}
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              Publier l&apos;annonce
            </>
          )}
        </button>
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center border border-stone-200 hover:border-stone-300 text-stone-600 font-medium py-3.5 rounded-xl transition-colors"
        >
          Annuler
        </Link>
      </div>

      {/* Résumé des fichiers sélectionnés */}
      {totalFiles > 0 && !isPending && (
        <p className="text-center text-xs text-stone-400">
          {photos.length > 0 && `${photos.length} photo${photos.length > 1 ? 's' : ''}`}
          {photos.length > 0 && videos.length > 0 && ' · '}
          {videos.length > 0 && `${videos.length} vidéo${videos.length > 1 ? 's' : ''}`}
          {' prête(s) à l\'envoi'}
        </p>
      )}

    </form>
  )
}
