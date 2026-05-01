import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260304072707 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "delete_log" ("id" text not null, "entity_type" text not null, "entity_id" text not null, "entity_label" text null, "actor_id" text not null, "actor_email" text null, "actor_name" text null, "url" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "delete_log_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delete_log_deleted_at" ON "delete_log" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "delete_log" cascade;`);
  }

}
