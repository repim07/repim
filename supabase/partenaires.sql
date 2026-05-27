-- =============================================================================
-- REPIM — Table partenaires professionnels
-- À coller dans : Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- Types de catégorie partenaire
CREATE TYPE categorie_partenaire AS ENUM (
  'agence',
  'notaire',
  'cabinet_juridique',
  'assurance',
  'promoteur',
  'Aménageur foncier',
  'Huissier de justice',
  'Conseiller Immobilier',
  'Architecte',
  "architecte d'intérieur"
  'autre'
);

-- Statuts d'abonnement
CREATE TYPE statut_abonnement AS ENUM (
  'inactif',        -- inscrit mais pas encore abonné
  'en_attente',     -- paiement initié, en attente de confirmation Mobile Money
  'actif',          -- abonnement payé et actif
  'expire'          -- abonnement expiré
);

-- =============================================================================
-- TABLE : partenaires
-- =============================================================================

CREATE TABLE public.partenaires (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nom_structure       VARCHAR(200)  NOT NULL,
  categorie           categorie_partenaire NOT NULL,

  -- Abonnement
  statut_abonnement   statut_abonnement NOT NULL DEFAULT 'inactif',
  plan_actif          TEXT          CHECK (plan_actif IN ('mensuel', 'trimestriel', 'semestriel', 'annuel')),
  date_debut_abo      TIMESTAMPTZ,
  date_fin_abo        TIMESTAMPTZ,

  -- Paiement Mobile Money (GeniusPay / Wave / Orange Money / MTN)
  -- Rempli lors de l'initiation du paiement et confirmé par webhook
  payment_provider    TEXT,         -- 'genuispay' | 'wave' | 'orange_money' | 'mtn'
  payment_ref         TEXT UNIQUE,  -- référence transaction côté opérateur
  payment_phone       VARCHAR(25),  -- numéro Mobile Money du partenaire

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE (user_id)    -- un profil = un partenaire
);

CREATE INDEX idx_partenaires_user_id          ON public.partenaires(user_id);
CREATE INDEX idx_partenaires_statut_abo       ON public.partenaires(statut_abonnement);
CREATE INDEX idx_partenaires_date_fin         ON public.partenaires(date_fin_abo);

CREATE TRIGGER partenaires_updated_at
  BEFORE UPDATE ON public.partenaires
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.partenaires ENABLE ROW LEVEL SECURITY;

-- Un partenaire peut lire et modifier son propre enregistrement
CREATE POLICY "partenaires: lecture par le partenaire"
  ON public.partenaires FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "partenaires: modification par le partenaire"
  ON public.partenaires FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- L'insertion est faite par la Server Action via service_role (admin client)
-- Pas besoin de policy INSERT pour les utilisateurs normaux

-- Les admins peuvent tout voir et modifier
CREATE POLICY "partenaires: lecture admin"
  ON public.partenaires FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "partenaires: modification admin"
  ON public.partenaires FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
