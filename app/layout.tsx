import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { ServiceWorker } from './components/ServiceWorker'
import { BottomNav } from './components/BottomNav'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://repim.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'REPIM — Immobilier en Côte d\'Ivoire',
    template: '%s | REPIM',
  },
  description: "Trouvez, louez ou vendez un bien immobilier en Côte d'Ivoire. REPIM connecte particuliers et professionnels certifiés à Abidjan et en Afrique de l'Ouest.",
  keywords: ['immobilier', 'Abidjan', 'Côte d\'Ivoire', 'location', 'vente', 'appartement', 'villa', 'terrain', 'agence immobilière'],
  authors: [{ name: 'REPIM' }],
  creator: 'REPIM',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'REPIM',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
    shortcut: '/icons/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CI',
    url: APP_URL,
    siteName: 'REPIM',
    title: 'REPIM — Immobilier en Côte d\'Ivoire',
    description: "Trouvez, louez ou vendez un bien immobilier avec des professionnels certifiés en Afrique de l'Ouest.",
    images: [{
      url: `${APP_URL}/og-image.jpg`,
      width: 1200,
      height: 630,
      alt: 'REPIM — Marketplace Immobilière Afrique de l\'Ouest',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'REPIM — Immobilier en Côte d\'Ivoire',
    description: "Trouvez, louez ou vendez un bien immobilier avec des professionnels certifiés.",
    images: [`${APP_URL}/og-image.jpg`],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <head>
        {/* iOS PWA splash / standalone */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-stone-900">
        {children}
        <BottomNav />
        <ServiceWorker />
      </body>
    </html>
  )
}
