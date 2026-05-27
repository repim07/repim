-- =============================================================================
-- REPIM — Migration V2 : essai 21 jours porté sur PROFILES (et plus sur partenaires)
--
-- Objectif :
--   - tout utilisateur dont le rôle n'est ni 'chercheur' ni 'admin' bénéficie
--     automatiquement de 21 jours d'accès gratuit à partir de la création du
--     compte (profile.created_at + 21 days)
--   - après 21 jours, l'utilisateur est redirigé vers /partenaires/abonnement
--   - l'admin peut suspendre / activer / débloquer manuellement
--   - une suspension automatique nocturne passe les abonnements payés expirés
--     au statut 'expired' (cf. expire_old_subscriptions())
--
-- À coller dans Supabase → SQL Editor → Run
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Nouvelles colonnes sur profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_end_date         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_status    TEXT
      DEFAULT 'trial'
      CHECK (subscription_status IN ('trial', 'active', 'expired', 'suspended')),
  ADD COLUMN IF NOT EXISTS subscription_plan      TEXT
      CHECK (subscription_plan IN ('mensuel', 'trimestriel', 'semestriel', 'annuel')),
  ADD COLUMN IF NOT EXISTS subscription_end_date  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS debloque_par_admin     BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS debloque_jusquau       TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
  ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end_date
  ON public.profiles(trial_end_date);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end_date
  ON public.profiles(subscription_end_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Backfill : tous les profils existants reçoivent un trial_end_date
--    (21 jours après leur création s'ils n'en ont pas déjà un)
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.profiles
   SET trial_end_date = created_at + INTERVAL '21 days'
 WHERE trial_end_date IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Patch du trigger handle_new_user pour initialiser le trial à l'inscription
--    Le trigger existant crée le profil avec role='chercheur'.
--    On ajoute trial_end_date = NOW() + 21 days + subscription_status = 'trial'.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, trial_end_date, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email, '@', 1)),
    NOW() + INTERVAL '21 days',
    'trial'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RPC : user_has_access(user_id) — source de vérité pour le middleware
--    Renvoie TRUE si l'utilisateur a le droit d'utiliser les fonctionnalités
--    protégées de l'app.
--    Règles :
--      - chercheur          → toujours OK
--      - admin              → toujours OK
--      - subscription_status = 'suspended' → KO
--      - subscription_status = 'active' AND subscription_end_date > NOW() → OK
--      - subscription_status = 'trial'  AND trial_end_date > NOW()        → OK
--      - debloque_par_admin AND (debloque_jusquau IS NULL OR debloque_jusquau > NOW()) → OK
--      - sinon → KO (à diriger vers /partenaires/abonnement)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.user_has_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.profiles
     WHERE id = p_user_id
       AND (
         -- Rôles toujours autorisés
         role IN ('chercheur', 'admin')
         -- Sinon : abonné, essai, ou débloqué (et pas suspendu)
         OR (
           subscription_status <> 'suspended'
           AND (
             (subscription_status = 'active'
              AND subscription_end_date IS NOT NULL
              AND subscription_end_date > NOW())
             OR (subscription_status = 'trial'
                 AND trial_end_date IS NOT NULL
                 AND trial_end_date > NOW())
             OR (debloque_par_admin = TRUE
                 AND (debloque_jusquau IS NULL OR debloque_jusquau > NOW()))
           )
         )
       )
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RPC : expire_old_subscriptions() — appelé par le cron nocturne
--    Passe automatiquement les abonnements expirés au statut 'expired'.
--    Ne touche pas aux comptes 'chercheur' ni 'admin'.
--    Ne touche pas non plus aux 'suspended' (l'admin a la main).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.expire_old_subscriptions()
RETURNS TABLE (
  affected_count INTEGER,
  ran_at         TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  v_step  INTEGER := 0;
BEGIN
  -- Abonnements payants arrivés à échéance → 'expired'
  UPDATE public.profiles
     SET subscription_status = 'expired'
   WHERE role NOT IN ('chercheur', 'admin')
     AND subscription_status = 'active'
     AND subscription_end_date IS NOT NULL
     AND subscription_end_date < NOW();

  GET DIAGNOSTICS v_step = ROW_COUNT;
  v_count := v_count + v_step;

  -- Essais arrivés à échéance ET pas encore upgradés → 'expired'
  UPDATE public.profiles
     SET subscription_status = 'expired'
   WHERE role NOT IN ('chercheur', 'admin')
     AND subscription_status = 'trial'
     AND trial_end_date IS NOT NULL
     AND trial_end_date < NOW();

  GET DIAGNOSTICS v_step = ROW_COUNT;
  v_count := v_count + v_step;

  RETURN QUERY SELECT v_count, NOW();
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. RLS profiles — l'admin peut tout lire et tout modifier
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles: lecture admin" ON public.profiles;
CREATE POLICY "profiles: lecture admin"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "profiles: modification admin" ON public.profiles;
CREATE POLICY "profiles: modification admin"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
