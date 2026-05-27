-- =============================================================================
-- Migration : nouveaux rôles profils + catégories partenaires
-- Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- ── 1. Ajouter 'promoteur' et 'agence' aux rôles profiles ────────────────────

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('chercheur', 'agent', 'proprietaire', 'admin', 'promoteur', 'agence'));

-- ── 2. Nettoyer et étendre les catégories partenaires ────────────────────────
-- On remplace le TYPE ENUM par un TEXT + CHECK (plus flexible pour les migrations)

ALTER TABLE public.partenaires
  ALTER COLUMN categorie TYPE TEXT;

DROP TYPE IF EXISTS categorie_partenaire CASCADE;

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
