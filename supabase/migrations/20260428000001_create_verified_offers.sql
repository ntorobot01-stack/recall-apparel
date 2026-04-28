-- ─────────────────────────────────────────────────────────────────────
-- Migration 001 — verified_offers
-- ─────────────────────────────────────────────────────────────────────
-- Tabla pública de ofertas verificadas. Es la SUPERFICIE única que el
-- frontend lee. Garantía estructural: discount_percent >= 20 a nivel DB
-- (constraint), por lo que es imposible insertar una oferta sub-20%.
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE verified_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  category TEXT,
  gender TEXT CHECK (gender IN ('men', 'women', 'unisex')),
  images JSONB DEFAULT '[]'::jsonb,
  current_price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 20),
  currency TEXT NOT NULL DEFAULT 'MXN',
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  direct_url TEXT,
  country_availability JSONB DEFAULT '[]'::jsonb,
  sizes_available JSONB DEFAULT '[]'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  is_on_sale BOOLEAN DEFAULT true,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sku, store_id)
);

-- Indexes optimizados para los accesos del frontend y del sync worker.
CREATE INDEX idx_verified_offers_store_stock     ON verified_offers(store_id, in_stock);
CREATE INDEX idx_verified_offers_category_gender ON verified_offers(category, gender);
CREATE INDEX idx_verified_offers_country         ON verified_offers USING GIN (country_availability);
CREATE INDEX idx_verified_offers_verified_at     ON verified_offers(verified_at DESC);
CREATE INDEX idx_verified_offers_discount        ON verified_offers(discount_percent DESC);

-- Trigger para mantener updated_at en sincronía con cualquier UPDATE.
-- Sin esto, el campo se queda congelado en el INSERT y el sync worker
-- no podría detectar cambios recientes.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verified_offers_set_updated_at
BEFORE UPDATE ON verified_offers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────
-- Lectura pública (anon key del frontend) + escritura sólo service_role
-- (sync worker). El service_role bypassa RLS por default; las políticas
-- explícitas funcionan como defense-in-depth y auto-documentación.
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE verified_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read verified offers"
  ON verified_offers FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert verified offers"
  ON verified_offers FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update verified offers"
  ON verified_offers FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete verified offers"
  ON verified_offers FOR DELETE
  USING (auth.role() = 'service_role');
