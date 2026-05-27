import Link from 'next/link'
import Image from 'next/image'
import { Bell, ArrowLeft } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-repim.png" alt="REPIM" width={100} height={32} className="h-8 w-auto object-contain" />
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Tableau de bord
          </Link>
        </div>
      </header>

      <div className="pt-16 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-stone-900">Notifications</h1>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-14 text-center">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-stone-300" />
          </div>
          <h2 className="text-lg font-bold text-stone-800 mb-2">Aucune notification</h2>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">
            Vous serez notifié ici des nouvelles demandes de visite, confirmations et messages.
          </p>
        </div>
      </div>
    </div>
  )
}
