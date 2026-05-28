// =============================================================================
// REPIM — Compression d'images côté client (Canvas API)
// Usage : const compressed = await compressImage(file)
//
// Priorité WebP (meilleure compression), repli JPEG si nécessaire.
// Redimensionne à max 1920×1080 et réduit la qualité par paliers jusqu'à
// atteindre la cible (<500 Ko par défaut).
// Ne touche pas aux vidéos ni aux fichiers non-image.
// =============================================================================

export interface CompressOptions {
  /** Largeur maximale en pixels (défaut : 1920) */
  maxWidthPx?: number
  /** Hauteur maximale en pixels (défaut : 1080) */
  maxHeightPx?: number
  /** Taille cible en Ko (défaut : 500) */
  targetKB?: number
  /** Qualité initiale 0-1 (défaut : 0.85) */
  quality?: number
}

/**
 * Compresse un fichier image via le Canvas API du navigateur.
 * Retourne un nouveau `File` compressé (WebP ou JPEG) ou le fichier original
 * en cas d'erreur / type non supporté.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidthPx = 1920,
    maxHeightPx = 1080,
    targetKB    = 500,
    quality     = 0.85,
  } = options

  // Passe-passe pour les fichiers non-image (vidéo, PDF…)
  if (!file.type.startsWith('image/')) return file

  return new Promise<File>((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      // ── Calcul des dimensions cibles (ratio conservé) ──────────────────────
      let { width, height } = img
      const ratio = Math.min(maxWidthPx / width, maxHeightPx / height, 1)
      width  = Math.round(width  * ratio)
      height = Math.round(height * ratio)

      // ── Canvas ──────────────────────────────────────────────────────────────
      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        // Contexte Canvas indisponible (SSR, env exotique) → retour original
        resolve(file)
        return
      }

      // Qualité de rendu maximale
      ctx.imageSmoothingEnabled  = true
      ctx.imageSmoothingQuality  = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      // ── Fonction de compression ─────────────────────────────────────────────
      const toBlob = (mimeType: string, q: number): Promise<Blob | null> =>
        new Promise(res => canvas.toBlob(res, mimeType, q))

      const tryCompress = async (mimeType: string): Promise<Blob | null> => {
        const targetBytes = targetKB * 1024
        let q = quality

        let blob = await toBlob(mimeType, q)

        // Réduction par paliers de 0.1 jusqu'à cible ou q_min=0.30
        while (blob && blob.size > targetBytes && q > 0.30) {
          q = Math.round((q - 0.10) * 100) / 100
          blob = await toBlob(mimeType, Math.max(q, 0.30))
        }

        return blob
      }

      const run = async () => {
        const targetBytes = targetKB * 1024

        // 1. Essai WebP
        let blob = await tryCompress('image/webp')

        // 2. Repli JPEG si WebP non disponible ou toujours trop grand
        if (!blob || blob.size > targetBytes) {
          const jpegBlob = await tryCompress('image/jpeg')
          // On prend le plus petit
          if (jpegBlob && (!blob || jpegBlob.size < blob.size)) {
            blob = jpegBlob
          }
        }

        // Fallback ultime : retourner le fichier original
        if (!blob) {
          resolve(file)
          return
        }

        // ── Construction du nouveau File ──────────────────────────────────────
        const ext      = blob.type === 'image/webp' ? 'webp' : 'jpg'
        const baseName = file.name.replace(/\.[^.]+$/, '') // retire l'extension
        const newFile  = new File([blob], `${baseName}.${ext}`, {
          type:         blob.type,
          lastModified: Date.now(),
        })

        resolve(newFile)
      }

      run().catch(() => resolve(file)) // sécurité globale
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file) // image illisible → retour original
    }

    img.src = objectUrl
  })
}
