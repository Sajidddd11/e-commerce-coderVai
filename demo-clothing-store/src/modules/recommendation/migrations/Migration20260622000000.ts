import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260622000000 extends Migration {

    override async up(): Promise<void> {
        // ─── behaviour_event table ──────────────────────────────────────────────
        this.addSql(`
            create table if not exists "behaviour_event" (
                "id"             text not null,
                "customer_id"    text null,
                "session_id"     text not null,
                "fingerprint_id" text null,
                "product_id"     text not null,
                "event_type"     text not null,
                "category_id"    text null,
                "collection_id"  text null,
                "amount"         integer null,
                "price"          numeric null,
                "rating"         numeric null,
                "recomm_id"      text null,
                "created_at"     timestamptz not null default now(),
                "updated_at"     timestamptz not null default now(),
                "deleted_at"     timestamptz null,
                constraint "behaviour_event_pkey" primary key ("id")
            );
        `)

        // Lookups by logged-in customer (most common for personalised recs)
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_be_customer_date"
            ON "behaviour_event" ("customer_id", "created_at" DESC)
            WHERE deleted_at IS NULL AND customer_id IS NOT NULL;
        `)

        // Lookups by session (anonymous / guest users)
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_be_session_date"
            ON "behaviour_event" ("session_id", "created_at" DESC)
            WHERE deleted_at IS NULL;
        `)

        // Lookups by device fingerprint (cross-profile identity merge)
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_be_fingerprint_date"
            ON "behaviour_event" ("fingerprint_id", "created_at" DESC)
            WHERE deleted_at IS NULL AND fingerprint_id IS NOT NULL;
        `)

        // Lookups by product (used by bought-together query)
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_be_product"
            ON "behaviour_event" ("product_id")
            WHERE deleted_at IS NULL;
        `)

        // Used by trending query (event_type + date range filter)
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_be_type_date"
            ON "behaviour_event" ("event_type", "created_at" DESC)
            WHERE deleted_at IS NULL;
        `)

        // Used by personalised category-affinity query
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_be_category"
            ON "behaviour_event" ("category_id")
            WHERE deleted_at IS NULL AND category_id IS NOT NULL;
        `)

        // ─── product_cooccurrence table ─────────────────────────────────────────
        this.addSql(`
            create table if not exists "product_cooccurrence" (
                "id"           text not null,
                "product_a_id" text not null,
                "product_b_id" text not null,
                "count"        integer not null default 1,
                "created_at"   timestamptz not null default now(),
                "updated_at"   timestamptz not null default now(),
                "deleted_at"   timestamptz null,
                constraint "product_cooccurrence_pkey" primary key ("id")
            );
        `)

        // Unique pair constraint — prevents duplicates during nightly rebuild
        this.addSql(`
            CREATE UNIQUE INDEX IF NOT EXISTS "IDX_cooccurrence_pair"
            ON "product_cooccurrence" ("product_a_id", "product_b_id")
            WHERE deleted_at IS NULL;
        `)

        // Fast lookup: given product A, find top co-purchased products sorted by count
        this.addSql(`
            CREATE INDEX IF NOT EXISTS "IDX_cooccurrence_a_count"
            ON "product_cooccurrence" ("product_a_id", "count" DESC)
            WHERE deleted_at IS NULL;
        `)
    }

    override async down(): Promise<void> {
        this.addSql(`drop table if exists "behaviour_event" cascade;`)
        this.addSql(`drop table if exists "product_cooccurrence" cascade;`)
    }
}
