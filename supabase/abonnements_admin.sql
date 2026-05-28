-- =============================================================================
-- REPIM — Migration : essai gratuit explicite, suspension, déblocage admin,
--                     table subscription_plans éditable depuis l'admin
-- À coller dans : Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Étendre l'enum statut_abonnement : ajout de 'essai' et 'suspendu'
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TYPE statut_abonnement ADD VALUE IF NOT EXISTS 'essai';
ALTER TYPE statut_abonnement ADD VALUE IF NOT EXISTS 'suspendu';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Champs supplémentaires sur partenaires
--    - essai_fin              : fin de la période d'essai gratuit (3 semaines)
--    - debloque_par_admin     : l'admin a accordé un accès manuel (bypass)
--    - debloque_jusquau       : durée du déblocage manuel (NULL = illimité)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.partenaires
  ADD COLUMN IF NOT EXISTS essai_fin           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS debloque_par_admin  BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS debloque_jusquau    TIMESTAMPTZ;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Trigger : à l'insertion d'un partenaire sans essai_fin, fixer à J+21
--    et basculer le statut en 'essai' (sauf si l'admin force un autre statut)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_partenaire()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.essai_fin IS NULL THEN
    NEW.essai_fin := NOW() + INTERVAL '14 days';
  END IF;

  -- Si le statut est encore au défaut 'inactif', on accorde l'essai
  IF NEW.statut_abonnement = 'inactif' THEN
    NEW.statut_abonnement := 'essai';
    NEW.date_debut_abo    := COALESCE(NEW.date_debut_abo, NOW());
    NEW.date_fin_abo      := COALESCE(NEW.date_fin_abo,   NEW.essai_fin);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS partenaires_essai_init ON public.partenaires;
CREATE TRIGGER partenaires_essai_init
  BEFORE INSERT ON public.partenaires
  FOR EACH ROW EXECUTE FUNCTION handle_new_partenaire();

-- Backfill : les partenaires existants sans essai_fin reçoivent 14j à partir de leur création
UPDATE public.partenaires
   SET essai_fin = created_at + INTERVAL '14 days'
 WHERE essai_fin IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Vue calculée : a_acces_partenaire
--    Centralise la règle de blocage. À utiliser dans le middleware et le code app.
-- ─────────────────────────────────────────────────────────────────────────────

-- NOTE : on cast statut_abonnement en TEXT pour les comparaisons impliquant
-- des valeurs d'enum fraîchement ajoutées ('essai', 'suspendu'). Sans ce cast,
-- PostgreSQL refuse de valider la fonction dans la même transaction que
-- l'ALTER TYPE ci-dessus (erreur 55P04 « unsafe use of new value »).
CREATE OR REPLACE FUNCTION public.partenaire_a_acces(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.partenaires
     WHERE user_id = p_user_id
       AND statut_abonnement::text <> 'suspendu'
       AND (
         -- Abonnement payant actif
         (statut_abonnement::text = 'actif' AND (date_fin_abo IS NULL OR date_fin_abo > NOW()))
         -- Essai en cours
         OR (statut_abonnement::text = 'essai' AND essai_fin > NOW())
         -- Déblocage manuel admin (illimité ou borné)
         OR (debloque_par_admin = TRUE
             AND (debloque_jusquau IS NULL OR debloque_jusquau > NOW()))
       )
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Table subscription_plans — tarifs éditables depuis l'admin
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  code         TEXT          PRIMARY KEY
                             CHECK (code IN ('mensuel', 'trimestriel', 'semestriel', 'annuel')),
  label        VARCHAR(50)   NOT NULL,
  prix         NUMERIC(12,2) NOT NULL CHECK (prix >= 0),
  duree_jours  INTEGER       NOT NULL CHECK (duree_jours > 0),
  devise       VARCHAR(10)   NOT NULL DEFAULT 'XOF',
  actif        BOOLEAN       NOT NULL DEFAULT TRUE,
  ordre        SMALLINT      NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Seed : valeurs par défaut (idempotent grâce à ON CONFLICT)
INSERT INTO public.subscription_plans (code, label, prix, duree_jours, ordre) VALUES
  ('mensuel',     'Mensuel',     20000,  30,  1),
  ('trimestriel', 'Trimestriel', 56500,  90,  2),
  ('semestriel',  'Semestriel',  115000, 180, 3),
  ('annuel',      'Annuel',      200000, 365, 4)
ON CONFLICT (code) DO NOTHING;

-- RLS : lecture publique des plans actifs, modification réservée admin
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plans: lecture publique" ON public.subscription_plans;
CREATE POLICY "plans: lecture publique"
  ON public.subscription_plans FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "plans: modification admin" ON public.subscription_plans;
CREATE POLICY "plans: modification admin"
  ON public.subscription_plans FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "plans: insertion admin" ON public.subscription_plans;
CREATE POLICY "plans: insertion admin"
  ON public.subscription_plans FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. RLS partenaires — l'admin peut aussi supprimer
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "partenaires: suppression admin" ON public.partenaires;
CREATE POLICY "partenaires: suppression admin"
  ON public.partenaires FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
