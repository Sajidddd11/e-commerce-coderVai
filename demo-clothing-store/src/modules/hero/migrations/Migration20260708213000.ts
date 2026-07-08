import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260708213000 extends Migration {

  override async up(): Promise<void> {
    // Copy existing mobile app hero slides from the old app_hero_slide table to the unified hero_slide table
    this.addSql(`
      INSERT INTO "hero_slide" (
        "id", "title", "subtitle", "image", "link_type", "link_value", 
        "link_label", "sort_order", "is_active", "created_at", "updated_at", 
        "deleted_at", "is_web", "is_app"
      )
      SELECT 
        "id", "title", "subtitle", "image", "link_type", "link_value", 
        "link_label", "sort_order", "is_active", "created_at", "updated_at", 
        "deleted_at", false, true
      FROM "app_hero_slide"
      ON CONFLICT ("id") DO NOTHING;
    `);
  }

  override async down(): Promise<void> {
    // No-op down migration
  }

}
