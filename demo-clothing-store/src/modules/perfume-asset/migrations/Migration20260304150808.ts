import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260304150808 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "perfume_volume" ("id" text not null, "volume_ml" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "perfume_volume_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_perfume_volume_deleted_at" ON "perfume_volume" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "perfume_bottle" ("id" text not null, "name" text not null, "base_price" integer not null, "image_url" text null, "volume_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "perfume_bottle_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_perfume_bottle_volume_id" ON "perfume_bottle" ("volume_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_perfume_bottle_deleted_at" ON "perfume_bottle" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "perfume_bottle" add constraint "perfume_bottle_volume_id_foreign" foreign key ("volume_id") references "perfume_volume" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "perfume_bottle" drop constraint if exists "perfume_bottle_volume_id_foreign";`);

    this.addSql(`drop table if exists "perfume_volume" cascade;`);

    this.addSql(`drop table if exists "perfume_bottle" cascade;`);
  }

}
