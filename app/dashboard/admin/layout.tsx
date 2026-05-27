export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Users, BadgePercent, LayoutDashboard } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nom')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header admin */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-stone-900">Console Admin</h1>
              <p className="text-xs text-stone-500">{profile?.nom ?? user.email}</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600 hover:text-orange-500 transition-colors"
          >
            Retour au dashboard
          </Link>
        </div>
      </header>

      {/* Navigation admin */}
      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto">
          {[
            { href: '/dashboard/admin',              label: 'Vue d’ensemble', icon: LayoutDashboard },
            { href: '/dashboard/admin/utilisateurs', label: 'Utilisateurs',   icon: Users },
            { href: '/dashboard/admin/tarifs',       label: 'Tarifs',         icon: BadgePercent },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-stone-600 hover:text-orange-600 hover:bg-orange-50 border-b-2 border-transparent hover:border-orange-500 transition-colors whitespace-nowrap"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
