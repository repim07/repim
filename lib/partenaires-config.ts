// Module pur (sans dépendance serveur) — peut être importé par des composants
// 'use client' aussi bien que par du code serveur. Pour récupérer les plans
// depuis la base de données, utiliser plutôt lib/partenaires-plans.server.ts.

export type PlanAbonnement = 'mensuel' | 'trimestriel' | 'semestriel' | 'annuel'

export interface PlanInfo {
  label: string
  prix: number
  dureeJours: number
  devise?: string
  actif?: boolean
}

// Valeurs par défaut (fallback si la table subscription_plans est indisponible)
export const PLANS_DEFAUT: Record<PlanAbonnement, PlanInfo> = {
  mensuel:     { label: 'Mensuel',     prix: 20_000,  dureeJours: 30,  devise: 'XOF', actif: true },
  trimestriel: { label: 'Trimestriel', prix: 56_500,  dureeJours: 90,  devise: 'XOF', actif: true },
  semestriel:  { label: 'Semestriel',  prix: 115_000, dureeJours: 180, devise: 'XOF', actif: true },
  annuel:      { label: 'Annuel',      prix: 200_000, dureeJours: 365, devise: 'XOF', actif: true },
}

// Alias rétrocompatible
export const PLANS = PLANS_DEFAUT
