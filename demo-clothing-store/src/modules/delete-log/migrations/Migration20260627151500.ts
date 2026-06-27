import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260627151500 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "delete_log" add column if not exists "action" text not null default 'delete';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "delete_log" drop column if exists "action";`);
  }

}
