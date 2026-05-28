-- =============================================================================
-- REPIM — Inscription Pro : rôles verrouillés, KYC conditionnel, double statut
-- À coller dans : Supabase Dashboard → SQL Editor → New query → Run
-- Idempotent : peut être exécuté plusieurs fois sans erreur
-- =============================================================================
--
-- Périmètre :
--   1. Verrouillage strict du champ `profiles.role` (immuable post-inscription)
--   2. Endpoint admin sécurisé pour changement de rôle exceptionnel + audit
--   3. Table `pro_profiles` (dossier KYC) avec cohérence rôle forcée
--   4. Table `pro_documents` (pièces) avec exigences conditionnelles par rôle
--   5. Workflow `draft → pending_review → verified|rejected` avec re-soumission
--   6. RLS sur `properties` : annonces visibles uniquement si auteur `verified`
--
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ÉTENDRE L'ENUM DE RÔLES (ajout 'communaute')
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'chercheur',
    'agent',
    'proprietaire',
    'admin',
    'promoteur',
    'agence',
    'communaute'
  ));


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. VERROU D'IMMUTABILITÉ DU RÔLE
-- ─────────────────────────────────────────────────────────────────────────────
-- Bloque tout UPDATE qui modifie `role`, sauf si bypass explicite défini
-- localement à la transaction par admin_change_user_role().

CREATE OR REPLACE FUNCTION enforce_role_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role
     AND COALESCE(current_setting('app.bypass_role_lock', true), 'false') <> 'true' THEN
    RAISE EXCEPTION
      'Le rôle utilisateur est immuable. Utilisez admin_change_user_role().'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_role_lock ON public.profiles;
CREATE TRIGGER profiles_role_lock
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_role_immutability();


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. AUDIT LOG DES CHANGEMENTS DE RÔLE (admin only)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.role_change_log (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_role     TEXT         NOT NULL,
  new_role     TEXT         NOT NULL,
  changed_by   UUID         NOT NULL REFERENCES auth.users(id),
  reason       TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_change_log_user_id ON public.role_change_log(user_id);

ALTER TABLE public.role_change_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "role_change_log: lecture admin" ON public.role_change_log;
CREATE POLICY "role_change_log: lecture admin"
  ON public.role_change_log FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ENDPOINT ADMIN : changement de rôle exceptionnel
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION admin_change_user_role(
  target_user_id UUID,
  new_role       TEXT,
  reason         TEXT
)
RETURNS VOID AS $$
DECLARE
  old_role_value TEXT;
  caller_role    TEXT;
BEGIN
  -- 1. Vérifie que l'appelant est admin
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Permission refusée : action réservée aux administrateurs.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- 2. Vérifie que la raison est fournie
  IF reason IS NULL OR length(trim(reason)) < 10 THEN
    RAISE EXCEPTION 'Une raison d''au moins 10 caractères est requise pour tracer le changement.';
  END IF;

  -- 3. Récupère l'ancien rôle
  SELECT role INTO old_role_value FROM public.profiles WHERE id = target_user_id;
  IF old_role_value IS NULL THEN
    RAISE EXCEPTION 'Utilisateur introuvable.';
  END IF;

  -- 4. No-op si même rôle
  IF old_role_value = new_role THEN
    RETURN;
  END IF;

  -- 5. Active le bypass pour CETTE transaction uniquement
  PERFORM set_config('app.bypass_role_lock', 'true', true);

  -- 6. Effectue le changement
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;

  -- 7. Trace l'opération
  INSERT INTO public.role_change_log (user_id, old_role, new_role, changed_by, reason)
  VALUES (target_user_id, old_role_value, new_role, auth.uid(), reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION admin_change_user_role(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION admin_change_user_role(UUID, TEXT, TEXT) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TABLE pro_profiles (dossier KYC, one-to-one avec profiles)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pro_profiles (
  id                   UUID         PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Catégorie produit (doit correspondre au rôle du profil parent)
  categorie            TEXT         NOT NULL,

  -- Identité pro
  prenom               VARCHAR(100) NOT NULL,
  email_pro            VARCHAR(255) NOT NULL,
  telephone_pro        VARCHAR(25)  NOT NULL,

  -- Entreprise (obligatoire pour agence/promoteur, optionnel sinon — contrôlé applicativement)
  raison_sociale       VARCHAR(200),

  -- Adresse siège (souple : { "ville", "commune", "quartier", "adresse" })
  adresse              JSONB        NOT NULL DEFAULT '{}'::jsonb,

  -- ─── DOUBLE STATUT ──────────────────────────────────────────────────────
  verification_status  TEXT         NOT NULL DEFAULT 'draft',
  submitted_at         TIMESTAMPTZ,
  reviewed_at          TIMESTAMPTZ,
  reviewed_by          UUID         REFERENCES auth.users(id),
  rejection_reason     TEXT,

  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Contraintes CHECK (recréées idempotentes)
ALTER TABLE public.pro_profiles DROP CONSTRAINT IF EXISTS pro_profiles_categorie_check;
ALTER TABLE public.pro_profiles ADD CONSTRAINT pro_profiles_categorie_check
  CHECK (categorie IN ('agence','promoteur','proprietaire','communaute','agent'));

ALTER TABLE public.pro_profiles DROP CONSTRAINT IF EXISTS pro_profiles_status_check;
ALTER TABLE public.pro_profiles ADD CONSTRAINT pro_profiles_status_check
  CHECK (verification_status IN ('draft','pending_review','verified','rejected','suspended'));

CREATE INDEX IF NOT EXISTS idx_pro_profiles_status    ON public.pro_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_pro_profiles_categorie ON public.pro_profiles(categorie);

DROP TRIGGER IF EXISTS pro_profiles_updated_at ON public.pro_profiles;
CREATE TRIGGER pro_profiles_updated_at
  BEFORE UPDATE ON public.pro_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. COHÉRENCE FORCÉE : categorie de pro_profiles == role de profiles
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION enforce_pro_role_consistency()
RETURNS TRIGGER AS $$
DECLARE
  parent_role TEXT;
BEGIN
  SELECT role INTO parent_role FROM public.profiles WHERE id = NEW.id;
  IF parent_role IS DISTINCT FROM NEW.categorie THEN
    RAISE EXCEPTION
      'Incohérence : dossier pro de catégorie "%" rattaché à un user de rôle "%".',
      NEW.categorie, parent_role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pro_profiles_role_consistency ON public.pro_profiles;
CREATE TRIGGER pro_profiles_role_consistency
  BEFORE INSERT OR UPDATE OF categorie ON public.pro_profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_pro_role_consistency();


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. TABLE pro_documents (pièces uploadées)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pro_documents (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_profile_id  UUID         NOT NULL REFERENCES public.pro_profiles(id) ON DELETE CASCADE,
  doc_type        TEXT         NOT NULL,
  storage_path    TEXT         NOT NULL,   -- bucket privé Supabase Storage
  numero          VARCHAR(100),            -- ex : numéro d'agrément, RCCM
  date_emission   DATE,
  date_expiration DATE,
  status          TEXT         NOT NULL DEFAULT 'pending',
  reviewer_notes  TEXT,
  uploaded_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  UNIQUE (pro_profile_id, doc_type)        -- un seul document par type par pro
);

ALTER TABLE public.pro_documents DROP CONSTRAINT IF EXISTS pro_documents_doc_type_check;
ALTER TABLE public.pro_documents ADD CONSTRAINT pro_documents_doc_type_check
  CHECK (doc_type IN (
    'agrement_mclu',           -- Agrément Ministère Construction/Logement/Urbanisme
    'rccm',                    -- Registre du Commerce et du Crédit Mobilier
    'dfe',                     -- Déclaration Fiscale d'Existence
    'cni_dirigeant',           -- CNI du représentant légal
    'carte_professionnelle',   -- Carte pro pour agents
    'attestation_villageoise', -- Pour communautés / mandataires
    'avis_lotissement',        -- Avis de lotissement approuvé
    'attestation_mandat'       -- Mandat signé par le propriétaire (démarcheurs)
  ));

ALTER TABLE public.pro_documents DROP CONSTRAINT IF EXISTS pro_documents_status_check;
ALTER TABLE public.pro_documents ADD CONSTRAINT pro_documents_status_check
  CHECK (status IN ('pending','verified','rejected'));

CREATE INDEX IF NOT EXISTS idx_pro_documents_profile ON public.pro_documents(pro_profile_id);
CREATE INDEX IF NOT EXISTS idx_pro_documents_status  ON public.pro_documents(status);


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. EXIGENCES DOCUMENTAIRES CONDITIONNELLES PAR RÔLE
-- ─────────────────────────────────────────────────────────────────────────────
-- Source de vérité unique pour : UI (afficher les bons champs),
-- backend (valider l'upload), et trigger de soumission (bloquer si incomplet).

CREATE OR REPLACE FUNCTION required_doc_types_for_role(role_name TEXT)
RETURNS TEXT[] AS $$
BEGIN
  RETURN CASE role_name
    WHEN 'agence'       THEN ARRAY['agrement_mclu','rccm','dfe','cni_dirigeant']
    WHEN 'promoteur'    THEN ARRAY['agrement_mclu','rccm','dfe','cni_dirigeant']
    WHEN 'proprietaire' THEN ARRAY['cni_dirigeant']
    WHEN 'communaute'   THEN ARRAY['cni_dirigeant','attestation_villageoise']
    WHEN 'agent'        THEN ARRAY['cni_dirigeant','attestation_mandat']
    ELSE ARRAY[]::TEXT[]
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Pour 'communaute' : attestation_villageoise OU avis_lotissement acceptés
-- Pour 'agent'      : attestation_mandat OU carte_professionnelle acceptés
-- → on traite ces équivalences dans is_dossier_complete() ci-dessous.

CREATE OR REPLACE FUNCTION is_dossier_complete(profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role    TEXT;
  uploaded     TEXT[];
  has_strict   BOOLEAN;
BEGIN
  SELECT categorie INTO user_role FROM public.pro_profiles WHERE id = profile_id;
  IF user_role IS NULL THEN RETURN FALSE; END IF;

  SELECT array_agg(doc_type) INTO uploaded
    FROM public.pro_documents
   WHERE pro_profile_id = profile_id;
  uploaded := COALESCE(uploaded, ARRAY[]::TEXT[]);

  -- Cas strict : tous les doc_type requis sont présents
  has_strict := required_doc_types_for_role(user_role) <@ uploaded;

  -- Équivalences acceptées
  IF user_role = 'communaute' AND NOT has_strict THEN
    has_strict := ARRAY['cni_dirigeant','avis_lotissement']::TEXT[] <@ uploaded;
  END IF;

  IF user_role = 'agent' AND NOT has_strict THEN
    has_strict := ARRAY['cni_dirigeant','carte_professionnelle']::TEXT[] <@ uploaded;
  END IF;

  RETURN has_strict;
END;
$$ LANGUAGE plpgsql STABLE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. AUDIT DES TRANSITIONS DE STATUT (verification_history)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.verification_history (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_profile_id  UUID         NOT NULL REFERENCES public.pro_profiles(id) ON DELETE CASCADE,
  old_status      TEXT         NOT NULL,
  new_status      TEXT         NOT NULL,
  changed_by      UUID         REFERENCES auth.users(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_history_profile ON public.verification_history(pro_profile_id);

ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verification_history: lecture par propriétaire ou admin" ON public.verification_history;
CREATE POLICY "verification_history: lecture par propriétaire ou admin"
  ON public.verification_history FOR SELECT
  USING (
    pro_profile_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. VERROU DES TRANSITIONS DE STATUT
-- ─────────────────────────────────────────────────────────────────────────────
-- Transitions autorisées :
--   • Propriétaire : draft → pending_review (si dossier complet)
--   • Propriétaire : rejected → draft (re-soumission après correction)
--   • Admin       : tout
-- Toute autre transition (notamment pending_review → verified) = admin only.

CREATE OR REPLACE FUNCTION enforce_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  caller_role TEXT;
  is_owner    BOOLEAN;
BEGIN
  IF OLD.verification_status IS NOT DISTINCT FROM NEW.verification_status THEN
    RETURN NEW;
  END IF;

  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  is_owner := (NEW.id = auth.uid());

  -- Admin : toutes transitions
  IF caller_role = 'admin' THEN
    IF NEW.verification_status IN ('verified','rejected','suspended') THEN
      NEW.reviewed_at := NOW();
      NEW.reviewed_by := auth.uid();
    END IF;
    RETURN NEW;
  END IF;

  -- Propriétaire : soumission
  IF is_owner
     AND OLD.verification_status = 'draft'
     AND NEW.verification_status = 'pending_review' THEN
    IF NOT is_dossier_complete(NEW.id) THEN
      RAISE EXCEPTION 'Dossier incomplet : tous les documents requis pour la catégorie "%" ne sont pas uploadés.', NEW.categorie;
    END IF;
    NEW.submitted_at := NOW();
    RETURN NEW;
  END IF;

  -- Propriétaire : re-soumission après rejet
  IF is_owner
     AND OLD.verification_status = 'rejected'
     AND NEW.verification_status = 'draft' THEN
    -- On préserve rejection_reason pour que l'utilisateur garde le contexte
    NEW.submitted_at := NULL;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Transition de statut non autorisée : % → % (rôle appelant : %).',
    OLD.verification_status, NEW.verification_status, COALESCE(caller_role, 'anonyme');
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pro_profiles_status_transition ON public.pro_profiles;
CREATE TRIGGER pro_profiles_status_transition
  BEFORE UPDATE OF verification_status ON public.pro_profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_status_transition();

-- Audit AFTER UPDATE
CREATE OR REPLACE FUNCTION log_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    INSERT INTO public.verification_history (pro_profile_id, old_status, new_status, changed_by, notes)
    VALUES (
      NEW.id,
      OLD.verification_status,
      NEW.verification_status,
      auth.uid(),
      CASE
        WHEN NEW.verification_status = 'rejected' THEN NEW.rejection_reason
        ELSE NULL
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pro_profiles_status_log ON public.pro_profiles;
CREATE TRIGGER pro_profiles_status_log
  AFTER UPDATE OF verification_status ON public.pro_profiles
  FOR EACH ROW EXECUTE FUNCTION log_status_transition();


-- ─────────────────────────────────────────────────────────────────────────────
-- 11. RLS sur pro_profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.pro_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pro_profiles: lecture par propriétaire ou admin" ON public.pro_profiles;
CREATE POLICY "pro_profiles: lecture par propriétaire ou admin"
  ON public.pro_profiles FOR SELECT
  USING (
    id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "pro_profiles: insertion par propriétaire" ON public.pro_profiles;
CREATE POLICY "pro_profiles: insertion par propriétaire"
  ON public.pro_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "pro_profiles: édition par propriétaire" ON public.pro_profiles;
CREATE POLICY "pro_profiles: édition par propriétaire"
  ON public.pro_profiles FOR UPDATE
  USING  (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "pro_profiles: édition admin" ON public.pro_profiles;
CREATE POLICY "pro_profiles: édition admin"
  ON public.pro_profiles FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- ─────────────────────────────────────────────────────────────────────────────
-- 12. RLS sur pro_documents
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.pro_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pro_documents: lecture par propriétaire ou admin" ON public.pro_documents;
CREATE POLICY "pro_documents: lecture par propriétaire ou admin"
  ON public.pro_documents FOR SELECT
  USING (
    pro_profile_id = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "pro_documents: upload par propriétaire en draft" ON public.pro_documents;
CREATE POLICY "pro_documents: upload par propriétaire en draft"
  ON public.pro_documents FOR INSERT
  WITH CHECK (
    pro_profile_id = auth.uid()
    AND (SELECT verification_status FROM public.pro_profiles WHERE id = auth.uid()) = 'draft'
  );

DROP POLICY IF EXISTS "pro_documents: suppression par propriétaire en draft" ON public.pro_documents;
CREATE POLICY "pro_documents: suppression par propriétaire en draft"
  ON public.pro_documents FOR DELETE
  USING (
    pro_profile_id = auth.uid()
    AND (SELECT verification_status FROM public.pro_profiles WHERE id = auth.uid()) = 'draft'
  );

DROP POLICY IF EXISTS "pro_documents: revue admin" ON public.pro_documents;
CREATE POLICY "pro_documents: revue admin"
  ON public.pro_documents FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- ─────────────────────────────────────────────────────────────────────────────
-- 13. VISIBILITÉ PUBLIQUE DES ANNONCES (RLS sur properties)
-- ─────────────────────────────────────────────────────────────────────────────
-- Remplace la policy existante : par défaut, le public ne voit RIEN d'un
-- auteur non vérifié, même si statut='actif'.

DROP POLICY IF EXISTS "properties: lecture des biens visibles" ON public.properties;
DROP POLICY IF EXISTS "properties: lecture publique des biens d'auteurs vérifiés" ON public.properties;

CREATE POLICY "properties: lecture publique des biens d'auteurs vérifiés"
  ON public.properties FOR SELECT
  USING (
    -- Cas 1 : annonce active + auteur certifié
    (
      statut = 'actif'
      AND owner_id IN (
        SELECT id FROM public.pro_profiles WHERE verification_status = 'verified'
      )
    )
    -- Cas 2 : je vois mes propres brouillons
    OR owner_id = auth.uid()
    -- Cas 3 : admin voit tout
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 14. VUE ADMIN : file d'attente de validation
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.admin_pending_validations AS
SELECT
  pp.id,
  pp.categorie,
  p.nom,
  pp.prenom,
  pp.email_pro,
  pp.telephone_pro,
  pp.raison_sociale,
  pp.submitted_at,
  COUNT(pd.id)                                           AS nb_documents,
  COUNT(pd.id) FILTER (WHERE pd.status = 'verified')     AS nb_verifies,
  COUNT(pd.id) FILTER (WHERE pd.status = 'rejected')     AS nb_rejetes,
  is_dossier_complete(pp.id)                             AS dossier_complet
FROM public.pro_profiles pp
JOIN public.profiles     p  ON p.id = pp.id
LEFT JOIN public.pro_documents pd ON pd.pro_profile_id = pp.id
WHERE pp.verification_status = 'pending_review'
GROUP BY pp.id, p.nom
ORDER BY pp.submitted_at ASC;

-- =============================================================================
-- FIN DU SCRIPT
-- =============================================================================
