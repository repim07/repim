-- =============================================================================
-- REPIM — Schéma complet Supabase (PostgreSQL)
-- À coller dans : Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- Extension UUID (activée par défaut sur Supabase, mais au cas où)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- FONCTION UTILITAIRE : mise à jour automatique de updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE : profiles
-- Extension de auth.users — créée automatiquement à l'inscription
-- =============================================================================

CREATE TABLE public.profiles (
  id          UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom         VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  telephone   VARCHAR(25),
  role        TEXT         NOT NULL DEFAULT 'chercheur'
                           CHECK (role IN ('chercheur', 'agent', 'proprietaire', 'admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger : crée automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- TABLE : properties
-- =============================================================================

CREATE TABLE public.properties (
  id           UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre        VARCHAR(200)   NOT NULL,
  description  TEXT,
  prix         NUMERIC(14, 2) NOT NULL CHECK (prix >= 0),
  devise       VARCHAR(10)    NOT NULL DEFAULT 'XOF',
  -- localisation : { "ville": "Abidjan", "commune": "Cocody", "quartier": "Angré",
  --                  "adresse": "...", "lat": 5.3600, "lng": -4.0083 }
  localisation JSONB          NOT NULL DEFAULT '{}'::jsonb,
  type         TEXT           NOT NULL
               CHECK (type IN ('location', 'vente', 'colocation')),
  statut       TEXT           NOT NULL DEFAULT 'actif'
               CHECK (statut IN ('actif', 'loue', 'vendu', 'inactif', 'en_attente_validation')),
  surface_m2   NUMERIC(8, 2)  CHECK (surface_m2 > 0),
  nb_pieces    SMALLINT       CHECK (nb_pieces > 0),
  standing     TEXT           CHECK (standing IN ('social', 'normal', 'haut_standing')),
  photos       TEXT[]         NOT NULL DEFAULT '{}',
  owner_id     UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_properties_owner_id      ON public.properties(owner_id);
CREATE INDEX idx_properties_type          ON public.properties(type);
CREATE INDEX idx_properties_statut        ON public.properties(statut);
CREATE INDEX idx_properties_localisation  ON public.properties USING GIN(localisation);

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- TABLE : appointments (rendez-vous de visite)
-- =============================================================================

CREATE TABLE public.appointments (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  date_visite TIMESTAMPTZ NOT NULL,
  statut      TEXT        NOT NULL DEFAULT 'en_attente'
              CHECK (statut IN ('en_attente', 'confirme', 'annule', 'effectue')),
  message     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Un utilisateur ne peut pas avoir deux RDV au même moment pour le même bien
  UNIQUE (property_id, user_id, date_visite)
);

CREATE INDEX idx_appointments_property_id ON public.appointments(property_id);
CREATE INDEX idx_appointments_user_id     ON public.appointments(user_id);
CREATE INDEX idx_appointments_statut      ON public.appointments(statut);

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- ── profiles ──────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les profils (pour afficher le nom de l'agent)
CREATE POLICY "profiles: lecture publique"
  ON public.profiles FOR SELECT
  USING (true);

-- Un utilisateur ne peut modifier que son propre profil
CREATE POLICY "profiles: modification par le propriétaire"
  ON public.profiles FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- L'insertion est gérée par le trigger handle_new_user (SECURITY DEFINER)
CREATE POLICY "profiles: insertion via trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── properties ────────────────────────────────────────────────────────────────

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Les biens actifs sont visibles par tous ; le propriétaire voit aussi les siens inactifs
CREATE POLICY "properties: lecture des biens visibles"
  ON public.properties FOR SELECT
  USING (statut = 'actif' OR owner_id = auth.uid());

-- Seuls les agents/propriétaires/admins peuvent publier
CREATE POLICY "properties: création par rôle autorisé"
  ON public.properties FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) IN ('agent', 'proprietaire', 'admin')
  );

-- Seul le propriétaire du bien peut le modifier
CREATE POLICY "properties: modification par le propriétaire du bien"
  ON public.properties FOR UPDATE
  USING  (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Seul le propriétaire peut supprimer son bien
CREATE POLICY "properties: suppression par le propriétaire du bien"
  ON public.properties FOR DELETE
  USING (auth.uid() = owner_id);

-- ── appointments ──────────────────────────────────────────────────────────────

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Le demandeur et le propriétaire du bien peuvent voir les RDV
CREATE POLICY "appointments: lecture par les parties concernées"
  ON public.appointments FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT owner_id FROM public.properties WHERE id = property_id
    )
  );

-- Tout utilisateur connecté peut demander une visite
CREATE POLICY "appointments: création par utilisateur connecté"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Le demandeur peut annuler son propre RDV
CREATE POLICY "appointments: annulation par le demandeur"
  ON public.appointments FOR UPDATE
  USING  (auth.uid() = user_id AND statut = 'en_attente')
  WITH CHECK (statut = 'annule');

-- Le propriétaire du bien peut confirmer ou annuler
CREATE POLICY "appointments: gestion par le propriétaire du bien"
  ON public.appointments FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT owner_id FROM public.properties WHERE id = property_id
    )
  );
