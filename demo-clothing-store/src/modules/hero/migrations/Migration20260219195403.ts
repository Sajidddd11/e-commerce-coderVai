import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260219195403 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "hero_slide" ("id" text not null, "slide_type" text check ("slide_type" in ('side_image_left', 'side_image_right', 'center_text', 'video', 'static_image')) not null, "title" text null, "description" text null, "button_text" text null, "button_link" text null, "background_image" text null, "side_image" text null, "video_url" text null, "overlay_color" text null, "sort_order" integer not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "hero_slide_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_hero_slide_deleted_at" ON "hero_slide" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "hero_slide" cascade;`);
  }

}
