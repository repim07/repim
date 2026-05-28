-- =============================================================================
-- REPIM — Table transactions (traçabilité paiements GeniusPay)
-- Migration : exécuter dans Supabase SQL Editor ou via CLI
-- =============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Référence interne REPIM (format REPIM-{uuid}) — permet la jointure avec partenaires
  payment_ref               TEXT,

  -- FK souple : le partenaire peut être supprimé sans casser l'historique
  partner_id                UUID REFERENCES partenaires(id) ON DELETE SET NULL,

  -- Utilisateur Auth Supabase (permet requêtes RLS côté client)
  user_id                   UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Montant en centimes (XOF : pas de centimes, mais on stocke la valeur brute)
  amount                    INTEGER NOT NULL DEFAULT 0,
  currency                  TEXT    NOT NULL DEFAULT 'XOF',

  -- Statut normalisé REPIM
  status                    TEXT    NOT NULL
                              CHECK (status IN ('pending', 'success', 'failed', 'ignored'))
                              DEFAULT 'pending',

  -- Identifiant côté GeniusPay (transaction_id dans le payload webhook)
  genius_pay_transaction_id TEXT    UNIQUE,

  -- Moyen de paiement déclaré par GeniusPay (mobile_money, card, …)
  payment_method            TEXT,

  -- Type d'événement webhook reçu (payment.success, payment.failed, …)
  event_type                TEXT,

  -- Payload brut conservé pour audit/debug (JSONB pour requêtes indexées)
  raw_payload               JSONB,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Index ──────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_partner_id   ON transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id      ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_ref  ON transactions(payment_ref);
CREATE INDEX IF NOT EXISTS idx_transactions_status       ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at   ON transactions(created_at DESC);

-- ── Row-Level Security ─────────────────────────────────────────────────────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs voient uniquement leurs propres transactions
CREATE POLICY "transactions_select_own"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les insertions et mises à jour sont réservées au service_role (webhooks, admin)
-- Aucune politique INSERT/UPDATE publique → seul createAdminClient() peut écrire
