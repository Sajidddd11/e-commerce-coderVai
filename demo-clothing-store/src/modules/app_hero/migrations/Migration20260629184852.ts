import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260629184852 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "app_hero_slide" ("id" text not null, "title" text null, "subtitle" text null, "image" text not null, "link_type" text check ("link_type" in ('none', 'shop', 'new_arrivals', 'best_selling', 'recommended', 'category', 'collection', 'product', 'search')) not null default 'none', "link_value" text null, "link_label" text null, "sort_order" integer not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "app_hero_slide_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_app_hero_slide_deleted_at" ON "app_hero_slide" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "app_hero_slide" cascade;`);
  }

}
