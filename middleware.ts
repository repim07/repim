import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware Next.js — rafraîchit la session Supabase à chaque requête
 * et protège les routes privées (/dashboard, /annonces/new…).
 *
 * Si les variables Supabase ne sont pas encore configurées (.env.local),
 * le middleware laisse passer toutes les requêtes sans erreur.
 */
export async function middleware(request: NextRequest) {
  // ── Guard : Supabase pas encore configuré → on laisse passer ─────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }

  // ── Supabase configuré : gestion normale de la session ───────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANT : ne pas écrire de code entre createServerClient et getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Routes protégées — redirige vers /auth/login si non connecté
  const protectedRoutes = [
    '/dashboard',
    '/annonces/new',
    '/profil',
    '/partenaires/abonnement',
  ]
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    // Les routes admin redirigent vers la console admin dédiée
    loginUrl.pathname = pathname.startsWith('/dashboard/admin')
      ? '/admin/login'
      : '/auth/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirige un utilisateur déjà connecté hors de /auth/*
  if (user && pathname.startsWith('/auth')) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // ── Contrôle d'accès : essai 21j expiré / abonnement inactif ────────────
  // Tout utilisateur dont le rôle n'est ni 'chercheur' ni 'admin' bénéficie
  // automatiquement de 21 jours d'accès gratuit à compter de son inscription.
  // Passé ce délai sans abonnement actif et sans déblocage admin, il est
  // redirigé vers /partenaires/abonnement.
  //
  // La règle est centralisée dans la fonction SQL user_has_access() :
  //   cf. supabase/abonnements_v2.sql
  if (user && isProtected) {
    const allowedDuringBlock =
      pathname.startsWith('/partenaires/abonnement') ||
      pathname.startsWith('/profil')

    if (!allowedDuringBlock) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: hasAccess } = await (supabase as any)
        .rpc('user_has_access', { p_user_id: user.id })

      // hasAccess === false → blocage explicite. null/undefined → on laisse passer
      // (RPC indisponible : on évite de couper l'app en cas de problème DB).
      if (hasAccess === false) {
        const abonnementUrl = request.nextUrl.clone()
        abonnementUrl.pathname = '/partenaires/abonnement'
        abonnementUrl.searchParams.set('expire', '1')
        return NextResponse.redirect(abonnementUrl)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
