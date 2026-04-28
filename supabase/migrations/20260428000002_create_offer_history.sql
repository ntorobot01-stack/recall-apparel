-- ─────────────────────────────────────────────────────────────────────
-- Migration 002 — offer_history
-- ─────────────────────────────────────────────────────────────────────
-- Log inmutable de eventos de ciclo de vida de cada oferta:
--   - 'entered'  → producto pasó la verificación y entró al catálogo.
--   - 'exited'   → producto dejó de cumplir (sin stock, sin descuento,
--                  expiró, etc.) y fue removido del catálogo público.
--   - 'updated'  → cambió precio, stock u otro campo relevante.
-- Sólo accesible vía service_role. Insumo para analítica interna y
-- futuras alertas. No expuesto al frontend.
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE offer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL,
  store_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('entered', 'exited', 'updated')),
  discount_percent INTEGER,
  current_price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  reason TEXT,
  event_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_offer_history_sku      ON offer_history(sku);
CREATE INDEX idx_offer_history_event_at ON offer_history(event_at DESC);
CREATE INDEX idx_offer_history_store    ON offer_history(store_id);

-- ─────────────────────────────────────────────────────────────────────
-- Row Level Security: cero acceso público, solo service_role escribe y lee.
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE offer_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only access"
  ON offer_history FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
