-- =============================================================================
-- Migration : ajout des types résidence_meublée et lotissement
-- À exécuter dans : Supabase Dashboard → SQL Editor → Run
-- (uniquement si la table properties existe déjà)
-- =============================================================================

ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_type_check;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_type_check
  CHECK (type IN ('location', 'vente', 'colocation', 'residence_meublee', 'lotissement'));
