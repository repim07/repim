import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Cron quotidien : passe en 'expired' les abonnements et essais arrivés à
 * échéance. Sécurisé par le header Authorization « Bearer $CRON_SECRET ».
 *
 * Configuré dans vercel.json :
 *   { "crons": [{ "path": "/api/cron/expire-subscriptions", "schedule": "0 3 * * *" }] }
 *
 * Vercel ajoute automatiquement le header `authorization: Bearer <CRON_SECRET>`
 * sur les requêtes initiées par son scheduler (variable d'env CRON_SECRET
 * à définir dans le dashboard Vercel).
 */
export async function GET(request: NextRequest) {
  // ── Auth : seul Vercel Cron (ou un appel manuel avec le secret) est autorisé
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    const { data, error } = await admin.rpc('expire_old_subscriptions')

    if (error) {
      console.error('[cron expire-subscriptions] rpc error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = Array.isArray(data) && data.length > 0 ? data[0] : null
    return NextResponse.json({
      ok:             true,
      affected_count: result?.affected_count ?? 0,
      ran_at:         result?.ran_at ?? new Date().toISOString(),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    console.error('[cron expire-subscriptions] exception:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
