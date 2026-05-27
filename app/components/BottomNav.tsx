'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, User, LayoutDashboard } from 'lucide-react'

const ITEMS = [
  { href: '/',                  icon: Home,            label: 'Accueil'   },
  { href: '/annonces',          icon: Search,          label: 'Annonces'  },
  { href: '/annonces/new',      icon: PlusCircle,      label: 'Publier'   },
  { href: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/profil',  icon: User,            label: 'Profil'    },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch">
        {ITEMS.map(({ href, icon: Icon, label }) => {
          const isPublier = href === '/annonces/new'
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))

          if (isPublier) {
            return (
              <Link key={href} href={href}
                className="flex-1 flex flex-col items-center justify-center py-2 -mt-3">
                <div className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-200 transition-colors">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </Link>
            )
          }

          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active ? 'text-orange-500' : 'text-stone-400 hover:text-stone-600'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
              {active && <span className="absolute bottom-0 w-4 h-0.5 bg-orange-500 rounded-full" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
