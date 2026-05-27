import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, SlidersHorizontal, Home, TreePine, Building, Briefcase, ArrowRight, BedDouble, LayoutGrid } from 'lucide-react'

export default function AnnoncesPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; categorie?: string }
}) {
  const q         = searchParams.q         ?? ''
  const type      = searchParams.type      ?? ''
  const categorie = searchParams.categorie ?? ''

  const typeLabel: Record<string, string> = {
    location:          'À louer',
    vente:             'À vendre',
    colocation:        'Colocation',
    residence_meublee: 'Résidences meublées',
    lotissement:       'Lotissement',
  }

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Header */}
      <header className="bg-white border-b border-stone-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-repim.png" alt="REPIM" width={100} height={32} className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-stone-600 hover:text-orange-500 transition-colors">
              Se connecter
            </Link>
            <Link href="/annonces/new" className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Publier
            </Link>
          </div>
        </div>
      </header>

      {/* Barre de recherche */}
      <div className="bg-orange-950 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-white text-2xl font-extrabold mb-2 text-center">
            {type ? typeLabel[type] ?? 'Annonces' : 'Toutes les annonces'}
            {q && <span className="text-orange-300 ml-2">&ldquo;{q}&rdquo;</span>}
          </h1>
          <p className="text-orange-300 text-sm text-center mb-6">
            {categorie && `Catégorie : ${categorie} · `}Abidjan & Afrique de l&apos;Ouest
          </p>
          <form method="GET" action="/annonces" className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3">
              <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <input
                name="q" defaultValue={q} type="text"
                placeholder="Ville, quartier, commune…"
                className="flex-1 text-sm text-stone-700 placeholder-stone-400 outline-none"
              />
              {type && <input type="hidden" name="type" value={type} />}
            </div>
            <button type="submit" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Rechercher</span>
            </button>
          </form>
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <SlidersHorizontal className="w-4 h-4 text-stone-400 flex-shrink-0" />
          {[
            { label: 'Tous',               href: '/annonces',                              icon: null        },
            { label: 'À louer',            href: '/annonces?type=location',                icon: Home        },
            { label: 'À vendre',           href: '/annonces?type=vente',                   icon: Building    },
            { label: 'Résid. meublées',    href: '/annonces?type=residence_meublee',        icon: BedDouble   },
            { label: 'Lotissement',        href: '/annonces?type=lotissement',              icon: LayoutGrid  },
            { label: 'Colocation',         href: '/annonces?type=colocation',               icon: null        },
            { label: 'Terrains',           href: '/annonces?categorie=terrains',            icon: TreePine    },
            { label: 'Bureaux',            href: '/annonces?categorie=bureaux',             icon: Briefcase   },
          ].map((f) => {
            const Icon = f.icon
            const active = (f.href === `/annonces?type=${type}` && type) ||
                           (f.href === '/annonces' && !type && !categorie)
            return (
              <Link
                key={f.label} href={f.href}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-orange-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {f.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center py-16">

          {/* Illustration */}
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <Building className="w-12 h-12 text-orange-400" />
          </div>

          <h2 className="text-xl font-bold text-stone-800 mb-3">
            Les annonces arrivent bientôt !
          </h2>
          <p className="text-stone-500 text-sm max-w-md mb-8 leading-relaxed">
            La base de données est en cours de configuration. Revenez dans quelques instants ou publiez la première annonce.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/annonces/new"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Publier une annonce
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/"
              className="inline-flex items-center gap-2 border border-stone-200 hover:border-orange-300 text-stone-600 hover:text-orange-600 font-medium px-6 py-3 rounded-xl transition-colors">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
