import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260709000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "bulk_setting" ("key" text not null, "value" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bulk_setting_pkey" primary key ("key"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bulk_setting_deleted_at" ON "bulk_setting" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bulk_setting" cascade;`);
  }

}
