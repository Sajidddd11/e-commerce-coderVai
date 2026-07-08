import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260708212500 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "hero_slide" add column if not exists "is_web" boolean not null default true;`);
    this.addSql(`alter table "hero_slide" add column if not exists "is_app" boolean not null default false;`);
    this.addSql(`alter table "hero_slide" add column if not exists "subtitle" text null;`);
    this.addSql(`alter table "hero_slide" add column if not exists "image" text null;`);
    this.addSql(`alter table "hero_slide" add column if not exists "link_type" text check ("link_type" in ('none', 'shop', 'new_arrivals', 'best_selling', 'recommended', 'category', 'collection', 'product', 'search')) not null default 'none';`);
    this.addSql(`alter table "hero_slide" add column if not exists "link_value" text null;`);
    this.addSql(`alter table "hero_slide" add column if not exists "link_label" text null;`);
    this.addSql(`alter table "hero_slide" alter column "slide_type" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "hero_slide" alter column "slide_type" set not null;`);
    this.addSql(`alter table "hero_slide" drop column if exists "link_label";`);
    this.addSql(`alter table "hero_slide" drop column if exists "link_value";`);
    this.addSql(`alter table "hero_slide" drop column if exists "link_type";`);
    this.addSql(`alter table "hero_slide" drop column if exists "image";`);
    this.addSql(`alter table "hero_slide" drop column if exists "subtitle";`);
    this.addSql(`alter table "hero_slide" drop column if exists "is_app";`);
    this.addSql(`alter table "hero_slide" drop column if exists "is_web";`);
  }

}
