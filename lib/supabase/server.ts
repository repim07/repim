import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Client Supabase pour Server Components, Server Actions et Route Handlers.
 * Lit et écrit les cookies de session via next/headers.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Dans un Server Component pur les set() sont silencieux.
            // Le Middleware s'occupe de rafraîchir la session.
          }
        },
      },
    }
  )
}

/**
 * Client Supabase avec la clé SERVICE_ROLE.
 * À utiliser UNIQUEMENT dans des Route Handlers internes ou des scripts.
 * Ne jamais exposer côté client.
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  )
}
