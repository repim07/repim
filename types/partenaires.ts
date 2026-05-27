// Types partagés pour le module partenaires.
// Externalisés ici car un fichier `'use server'` ne peut exporter que des
// async functions en Next.js 16 strict.

import type { PlanAbonnement } from '@/lib/partenaires-config'

export type CategoriePartenaire =
  | 'agence'
  | 'promoteur'
  | 'notaire'
  | 'cabinet_juridique'
  | 'assurance'
  | 'huissier'
  | 'architecte'
  | 'conseiller'
  | 'autre'

export type StatutAbonnement =
  | 'inactif'
  | 'en_attente'
  | 'actif'
  | 'expire'
  | 'essai'
  | 'suspendu'

export interface Partenaire {
  id: string
  user_id: string
  nom_structure: string
  categorie: CategoriePartenaire
  statut_abonnement: StatutAbonnement
  plan_actif: PlanAbonnement | null
  date_debut_abo: string | null
  date_fin_abo: string | null
  payment_provider: string | null
  payment_ref: string | null
  payment_phone: string | null
  created_at: string
  updated_at: string
}

// Constante partagée (la valeur runtime vit aussi dans actions/partenaires.ts
// mais ne peut pas y être exportée à cause de la règle 'use server').
export const JOURS_ESSAI_GRATUIT = 21

// Mapping catégorie → rôle profile
export const CATEGORIE_VERS_ROLE: Record<CategoriePartenaire, string> = {
  agence:           'agence',
  promoteur:        'promoteur',
  notaire:          'agent',
  cabinet_juridique:'agent',
  assurance:        'agent',
  huissier:         'agent',
  architecte:       'agent',
  conseiller:       'agent',
  autre:            'agent',
}
