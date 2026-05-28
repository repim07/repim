// =============================================================================
// REPIM — Layout du dashboard
// Ce layout s'affiche autour de TOUTES les pages du dossier /dashboard.
// Son rôle principal :
//   1. Vérifier que l'utilisateur est connecté (sinon → /auth/login)
//   2. Lire le statut de vérification KYC du profil pro
//   3. Afficher une bannière colorée persistante en haut de page si le
//      profil pro n'est pas encore "verified" (draft / pending_review /
//      rejected / suspended)
// =============================================================================

export const dynamic = 'force-dynamic'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { ElementType } from 'react'
import { AlertTriangle, Clock, XCircle, ShieldOff } from 'lucide-react'

// ── Rôles professionnels (nécessitent un suivi KYC) ─────────────────────────

const PRO_ROLES = new Set(['agence', 'promoteur', 'proprietaire', 'communaute', 'agent'])

// ── Configuration des bannières selon le statut KYC ─────────────────────────
// Chaque statut a : couleurs de fond/bord/texte, icône, message, et
// optionnellement un lien vers le tunnel KYC.

interface BannerConfig {
  wrapperCls: string   // classes du conteneur (fond + bordure)
  iconCls: string      // couleur de l'icône
  textCls: string      // couleur du texte
  ctaCls:  string      // couleur du lien CTA
  Icon:    ElementType
  message: string
  cta?: { label: string; href: string }
}

const KYC_BANNERS: Record<string, BannerConfig> = {

  // Dossier non commencé / incomplet
  draft: {
    wrapperCls: 'bg-amber-50 border-b border-amber-300',
    iconCls:    'text-amber-600',
    textCls:    'text-amber-900',
    ctaCls:     'text-amber-700 hover:text-amber-900',
    Icon:       AlertTriangle,
    message:    "Votre dossier de certification est incomplet. Vous ne pouvez pas encore publier d'annonces.",
    cta:        { label: 'Compléter mon dossier →', href: '/dashboard/kyc' },
  },

  // En attente d'examen par l'équipe REPIM
  pending_review: {
    wrapperCls: 'bg-blue-50 border-b border-blue-200',
    iconCls:    'text-blue-500',
    textCls:    'text-blue-900',
    ctaCls:     'text-blue-700 hover:text-blue-900',
    Icon:       Clock,
    message:    'Votre dossier est en cours d\'examen par notre équipe. Réponse attendue sous 24 à 72 h.',
  },

  // Dossier rejeté — l'utilisateur doit corriger ses documents
  rejected: {
    wrapperCls: 'bg-red-50 border-b border-red-300',
    iconCls:    'text-red-600',
    textCls:    'text-red-900',
    ctaCls:     'text-red-700 hover:text-red-900',
    Icon:       XCircle,
    message:    'Votre dossier a été rejeté. Consultez les raisons et corrigez vos documents pour renvoyer.',
    cta:        { label: 'Voir les raisons et corriger →', href: '/dashboard/kyc' },
  },

  // Compte suspendu par un administrateur
  suspended: {
    wrapperCls: 'bg-red-800 border-b border-red-900',
    iconCls:    'text-red-200',
    textCls:    'text-white',
    ctaCls:     'text-red-200 hover:text-white',
    Icon:       ShieldOff,
    message:    'Votre compte a été suspendu. Contactez le support REPIM pour plus d\'informations.',
  },
}

// ── Layout ───────────────────────────────────────────────────────────────────

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ─── 1. Vérification de la session ────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Pas connecté → on renvoie vers la page de connexion
    redirect('/auth/login')
  }

  // ─── 2. Lecture du rôle (via admin client pour bypasser RLS) ──────────────
  const admin = createAdminClient()
  const { data: profileRow } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role  = (profileRow as { role?: string } | null)?.role ?? 'chercheur'
  const isPro = PRO_ROLES.has(role)

  // ─── 3. Si c'est un pro, lire son statut de vérification KYC ──────────────
  let verificationStatus: string | null = null
  if (isPro) {
    const { data: proRow } = await admin
      .from('pro_profiles')
      .select('verification_status')
      .eq('id', user.id)
      .single()

    // Si le pro_profiles n'existe pas encore (erreur SQL pas encore jouée),
    // on affiche quand même la bannière "draft" par sécurité.
    verificationStatus =
      (proRow as { verification_status?: string } | null)?.verification_status
      ?? 'draft'
  }

  // ─── 4. Décider si on affiche la bannière ─────────────────────────────────
  // On l'affiche si c'est un pro ET que son statut n'est pas "verified"
  const banner =
    isPro && verificationStatus && verificationStatus !== 'verified'
      ? KYC_BANNERS[verificationStatus] ?? null
      : null

  return (
    <div className="has-bottom-nav">

      {/* ── Bannière KYC ─────────────────────────────────────────────────── */}
      {/* Elle s'affiche en haut de page, AVANT le contenu, sur toutes les  */}
      {/* sous-pages du dashboard (/dashboard, /dashboard/kyc, etc.)         */}
      {banner && (
        <div className={banner.wrapperCls}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3">
            {/* Icône */}
            <banner.Icon
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${banner.iconCls}`}
              aria-hidden="true"
            />

            {/* Texte + CTA */}
            <div className="min-w-0">
              <p className={`text-sm font-medium ${banner.textCls}`}>
                {banner.message}
              </p>
              {banner.cta && (
                <Link
                  href={banner.cta.href}
                  className={`text-sm font-bold underline underline-offset-2 mt-0.5 inline-block ${banner.ctaCls}`}
                >
                  {banner.cta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Contenu de la page ───────────────────────────────────────────── */}
      {children}

    </div>
  )
}
