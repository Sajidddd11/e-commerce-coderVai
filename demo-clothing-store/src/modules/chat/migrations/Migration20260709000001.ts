import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260709000001 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "chat_message" ("id" text not null, "session_id" text not null, "sender" text not null, "content" text not null, "customer_name" text null, "customer_email" text null, "is_read" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "chat_message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_chat_message_session_id" ON "chat_message" ("session_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_chat_message_deleted_at" ON "chat_message" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "chat_message" cascade;`);
  }

}
