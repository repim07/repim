'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createProperty } from '@/actions/property'
import {
  Camera, X, PlusCircle, Loader2, Upload,
  DollarSign, MapPin,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────

type PhotoItem = { file: File; preview: string; id: string }

const MAX_PHOTOS  = 10
const MAX_SIZE_MB = 10

// ─────────────────────────────────────────────────────────────────────────────

export function AnnonceForm({ userId }: { userId: string }) {
  const router         = useRouter()
  const fileInputRef   = useRef<HTMLInputElement>(null)
  const [isPending, start] = useTransition()

  const [photos,   setPhotos]   = useState<PhotoItem[]>([])
  const [error,    setError]    = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)

  // ── Gestion des fichiers sélectionnés ──────────────────────────────────────

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files    = Array.from(e.target.files ?? [])
    const slots    = MAX_PHOTOS - photos.length
    const accepted = files.slice(0, slots)

    const tooBig = accepted.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024)
    if (tooBig.length) {
      setError(`${tooBig.length} fichier(s) dépassent ${MAX_SIZE_MB} Mo et ont été ignorés.`)
      return
    }

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

  // ── Soumission du formulaire ───────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd = new FormData(e.currentTarget)

    const titre    = (fd.get('titre')    as string).trim()
    const type     = (fd.get('type')     as string)
    const prixStr  = (fd.get('prix')     as string)
    const devise   = (fd.get('devise')   as string) || 'XOF'
    const ville    = (fd.get('ville')    as string).trim()
    const commune  = (fd.get('commune')  as string).trim()
    const quartier = (fd.get('quartier') as string).trim()
    const adresse  = (fd.get('adresse')  as string).trim()
    const desc     = (fd.get('description') as string).trim()
    const standing = (fd.get('standing') as string)
    const surfStr  = (fd.get('surface_m2') as string)
    const piecStr  = (fd.get('nb_pieces')  as string)

    if (titre.length < 5)     { setError('Le titre doit contenir au moins 5 caractères.'); return }
    if (!type)                 { setError('Veuillez choisir un type de bien.'); return }
    const prix = parseFloat(prixStr)
    if (!prixStr || isNaN(prix) || prix <= 0) { setError('Veuillez saisir un prix valide.'); return }
    if (!ville || !commune || !quartier)       { setError('Ville, commune et quartier sont obligatoires.'); return }

    start(async () => {
      // 1. Upload des photos vers Supabase Storage
      const supabase   = createClient()
      const photoUrls: string[] = []

      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          setProgress(`Upload photo ${i + 1}/${photos.length}…`)
          const { file } = photos[i]
          const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
          const path = `${userId}/${Date.now()}-${i}.${ext}`

          const { error: uploadErr } = await supabase.storage
            .from('property-photos')
            .upload(path, file, { upsert: false })

          if (uploadErr) {
            setError(`Erreur upload photo ${i + 1} : ${uploadErr.message}`)
            setProgress(null)
            return
          }

          const { data: { publicUrl } } = supabase.storage
            .from('property-photos')
            .getPublicUrl(path)

          photoUrls.push(publicUrl)
        }
        setProgress(null)
      }

      // 2. Création de l'annonce via Server Action
      const res = await createProperty({
        titre,
        type:        type as 'location' | 'vente' | 'colocation' | 'residence_meublee' | 'lotissement',
        prix,
        devise: devise as 'XOF' | 'EUR' | 'USD',
        description: desc || undefined,
        standing:    (standing as 'social' | 'normal' | 'haut_standing') || undefined,
        surface_m2:  surfStr  ? parseFloat(surfStr)   : undefined,
        nb_pieces:   piecStr  ? parseInt(piecStr, 10) : undefined,
        localisation: { ville, commune, quartier, adresse: adresse || undefined },
        photos:      photoUrls,
      })

      if (!res.success) { setError(res.error); return }

      photos.forEach(p => URL.revokeObjectURL(p.preview))
      router.push('/dashboard/annonces')
    })
  }

  // ─────────────────────────────────────────────────────────────────────────

  const inputCls = 'w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white'
  const labelCls = 'block text-sm font-medium text-stone-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Informations générales */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4">
          Informations générales
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Titre de l&apos;annonce <span className="text-orange-500">*</span></label>
            <input name="titre" type="text" required minLength={5} maxLength={200}
              placeholder="ex : Villa 4 pièces à Cocody Angré" className={inputCls} />
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
                <option value="">Choisir…</option>
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
            <textarea name="description" rows={4} maxLength={2000}
              placeholder="Décrivez votre bien (équipements, état, accès…)"
              className={`${inputCls} resize-none`} />
          </div>
        </div>
      </div>

      {/* Prix */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-orange-500" />
          Prix
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Montant <span className="text-orange-500">*</span></label>
            <input name="prix" type="number" required min={1} placeholder="150 000" className={inputCls} />
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

      {/* Localisation */}
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
            <label className={labelCls}>Adresse</label>
            <input name="adresse" type="text" placeholder="Rue 123, côté marché" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Camera className="w-4 h-4 text-orange-500" />
          Photos
          <span className="ml-auto text-xs font-normal text-stone-400 normal-case tracking-normal">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </h2>

        {/* Zone de dépôt / sélection */}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50 transition-all focus:outline-none group mb-4"
          >
            <Upload className="w-9 h-9 text-stone-300 group-hover:text-orange-400 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-semibold text-stone-600 group-hover:text-orange-600">
              Cliquer pour ajouter des photos
            </p>
            <p className="text-xs text-stone-400 mt-1">
              PNG, JPG jusqu&apos;à {MAX_SIZE_MB} Mo · Max {MAX_PHOTOS} photos
            </p>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onFileChange}
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
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    Couverture
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Bouton "+" pour en ajouter d'autres */}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-orange-400 hover:bg-orange-50 transition-all text-stone-400 hover:text-orange-500"
              >
                <PlusCircle className="w-6 h-6" />
                <span className="text-xs font-medium">Ajouter</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">⚠</span>
          {error}
        </div>
      )}

      {/* Boutons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {progress ?? 'Publication en cours…'}
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

      <p className="text-center text-xs text-stone-400">
        Votre annonce sera examinée avant publication.
      </p>
    </form>
  )
}
