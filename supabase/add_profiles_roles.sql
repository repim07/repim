-- =============================================================================
-- Migration : nouveaux rôles profils + catégories partenaires
-- Supabase Dashboard → SQL Editor → New query → Run
-- Idempotent : peut être exécuté plusieurs fois sans erreur
-- =============================================================================

-- ── 1. Ajouter 'promoteur' et 'agence' aux rôles profiles ────────────────────

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('chercheur', 'agent', 'proprietaire', 'admin', 'promoteur', 'agence'));

-- ── 2. Nettoyer et étendre les catégories partenaires ────────────────────────

-- Convertir la colonne en TEXT si elle est encore de type ENUM
ALTER TABLE public.partenaires
  ALTER COLUMN categorie TYPE TEXT;

-- Supprimer l'ancien type ENUM s'il existe encore
DROP TYPE IF EXISTS categorie_partenaire CASCADE;

-- Supprimer la contrainte si elle existe déjà (idempotence)
ALTER TABLE public.partenaires
  DROP CONSTRAINT IF EXISTS partenaires_categorie_check;

-- Recréer la contrainte avec toutes les catégories
ALTER TABLE public.partenaires
  ADD CONSTRAINT partenaires_categorie_check
  CHECK (categorie IN (
    'agence',
    'promoteur',
    'notaire',
    'cabinet_juridique',
    'assurance',
    'huissier',
    'architecte',
    'conseiller',
    'autre'
  ));
