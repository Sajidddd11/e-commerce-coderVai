#!/usr/bin/env node

/**
 * Creates the 3 courier integration tables in the database.
 * Run: node scripts/run-courier-migration.js
 */

const { Client } = require('pg')
require('dotenv').config()

const SQL = `
-- 1. Courier provider configuration
CREATE TABLE IF NOT EXISTS courier_config (
    id              TEXT PRIMARY KEY,
    provider        TEXT NOT NULL UNIQUE,
    is_active       BOOLEAN NOT NULL DEFAULT false,
    is_sandbox      BOOLEAN NOT NULL DEFAULT true,
    config          JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_courier_config_provider
    ON courier_config (provider);

-- 2. Shipment records
CREATE TABLE IF NOT EXISTS courier_shipment (
    id                  TEXT PRIMARY KEY,
    order_id            TEXT NOT NULL,
    provider            TEXT NOT NULL,
    consignment_id      TEXT,
    merchant_order_id   TEXT,
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

-- 3. Pathao stores
CREATE TABLE IF NOT EXISTS pathao_store (
    id              TEXT PRIMARY KEY,
    store_id        INTEGER NOT NULL UNIQUE,
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
`

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })

    try {
        await client.connect()
        console.log('✅ Connected to RDS database')

        await client.query(SQL)
        console.log('✅ courier_config   — created')
        console.log('✅ courier_shipment — created')
        console.log('✅ pathao_store     — created')
        console.log('✅ All indexes      — created')

        // Verify tables exist
        const result = await client.query(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('courier_config','courier_shipment','pathao_store') ORDER BY tablename"
        )
        const found = result.rows.map(r => r.tablename)
        const expected = ['courier_config', 'courier_shipment', 'pathao_store']
        const missing = expected.filter(t => !found.includes(t))

        if (missing.length === 0) {
            console.log('\n🎉 All 3 courier tables verified in database!')
            console.log('   Tables:', found.join(', '))
        } else {
            console.error('\n⚠️  Missing tables after migration:', missing.join(', '))
            process.exit(1)
        }

    } catch (err) {
        console.error('❌ Migration failed:', err.message)
        process.exit(1)
    } finally {
        await client.end()
    }
}

run()
