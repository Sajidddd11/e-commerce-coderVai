-- ============================================================
-- COURIER INTEGRATION TABLES
-- Pathao courier integration for demo-clothing-store backend
-- Run once against your database:
--   node scripts/migrate-courier-tables.js
-- Or paste directly into your RDS/psql console.
-- ============================================================

-- 1. Courier provider configuration (stores credentials + tokens)
CREATE TABLE IF NOT EXISTS courier_config (
    id              TEXT PRIMARY KEY,
    provider        TEXT NOT NULL UNIQUE,          -- e.g. 'pathao'
    is_active       BOOLEAN NOT NULL DEFAULT false,
    is_sandbox      BOOLEAN NOT NULL DEFAULT true,
    config          JSONB NOT NULL DEFAULT '{}',   -- credentials, tokens, etc.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courier_config_provider
    ON courier_config (provider);

-- 2. Shipment records (one per order dispatch to courier)
CREATE TABLE IF NOT EXISTS courier_shipment (
    id                  TEXT PRIMARY KEY,
    order_id            TEXT NOT NULL,
    provider            TEXT NOT NULL,             -- e.g. 'pathao'
    consignment_id      TEXT,                      -- Pathao consignment ID
    merchant_order_id   TEXT,                      -- Medusa display_id
    status              TEXT NOT NULL DEFAULT 'created',
    delivery_fee        NUMERIC,
    error_message       TEXT,
    tracking_data       JSONB,
    request_payload     JSONB,
    response_payload    JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courier_shipment_order_id
    ON courier_shipment (order_id);
CREATE INDEX IF NOT EXISTS idx_courier_shipment_provider
    ON courier_shipment (provider);
CREATE INDEX IF NOT EXISTS idx_courier_shipment_consignment_id
    ON courier_shipment (consignment_id);

-- 3. Pathao stores (synced from Pathao merchant portal)
CREATE TABLE IF NOT EXISTS pathao_store (
    id              TEXT PRIMARY KEY,
    store_id        INTEGER NOT NULL UNIQUE,       -- Pathao's store_id
    store_name      TEXT NOT NULL,
    contact_name    TEXT,
    contact_number  TEXT,
    address         TEXT,
    city_id         INTEGER,
    zone_id         INTEGER,
    area_id         INTEGER,
    is_default      BOOLEAN NOT NULL DEFAULT false,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pathao_store_is_default
    ON pathao_store (is_default) WHERE is_default = true;
