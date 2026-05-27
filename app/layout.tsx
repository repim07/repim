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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://repim.vercel.app'),
  title: {
    default: 'REPIM — Marketplace Immobilière',
    template: '%s | REPIM',
  },
  description: "REPIM connecte acheteurs, vendeurs et locataires avec des agents certifiés en Côte d'Ivoire et en Afrique.",
  keywords: ['immobilier', 'Abidjan', 'Côte d\'Ivoire', 'location', 'vente', 'appartement', 'villa'],
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
    siteName: 'REPIM',
    title: 'REPIM — Marketplace Immobilière',
    description: "La référence de l'immobilier digital en Afrique",
    images: [{ url: '/villa-hero.jpg', width: 1200, height: 630, alt: 'REPIM' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'REPIM — Marketplace Immobilière',
    description: "La référence de l'immobilier digital en Afrique",
    images: ['/villa-hero.jpg'],
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
