import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'REPIM — Marketplace Immobilière',
    short_name: 'REPIM',
    description: "Trouvez votre bien idéal en Côte d'Ivoire et en Afrique",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f97316',
    orientation: 'portrait-primary',
    categories: ['lifestyle', 'business'],
    lang: 'fr',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Chercher un bien',
        url: '/annonces',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Publier une annonce',
        url: '/annonces/new',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
