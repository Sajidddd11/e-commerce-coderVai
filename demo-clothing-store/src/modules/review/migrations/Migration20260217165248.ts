import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260217165248 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_review" ("id" text not null, "product_id" text not null, "variant_id" text null, "customer_id" text null, "order_id" text null, "customer_name" text not null, "customer_email" text not null, "rating" integer not null, "title" text not null, "content" text not null, "images" jsonb null, "is_verified_purchase" boolean not null default false, "is_approved" boolean not null default false, "helpful_count" integer not null default 0, "not_helpful_count" integer not null default 0, "admin_response" text null, "admin_responded_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_review_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_review_deleted_at" ON "product_review" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_review" cascade;`);
  }

}
