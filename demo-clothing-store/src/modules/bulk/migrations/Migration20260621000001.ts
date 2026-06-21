import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260621000001 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "bulk_product" ("id" text not null, "product_id" text not null, "is_active" boolean not null default true, "min_quantity" integer null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bulk_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bulk_product_deleted_at" ON "bulk_product" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bulk_product_product_id" ON "bulk_product" ("product_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bulk_product" cascade;`);
  }

}
