import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260626145130 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "loyalty_account" drop constraint if exists "loyalty_account_customer_id_unique";`);
    this.addSql(`create table if not exists "loyalty_account" ("id" text not null, "customer_id" text not null, "points" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_loyalty_account_customer_id_unique" ON "loyalty_account" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_account_deleted_at" ON "loyalty_account" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "loyalty_history" ("id" text not null, "customer_id" text not null, "points" integer not null, "type" text check ("type" in ('earn', 'redeem', 'admin_adjustment', 'refund')) not null, "description" text null, "order_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_history_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_history_deleted_at" ON "loyalty_history" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "loyalty_setting" ("key" text not null, "value" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_setting_pkey" primary key ("key"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_setting_deleted_at" ON "loyalty_setting" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "loyalty_account" cascade;`);

    this.addSql(`drop table if exists "loyalty_history" cascade;`);

    this.addSql(`drop table if exists "loyalty_setting" cascade;`);
  }

}
