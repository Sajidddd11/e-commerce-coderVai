import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260710135927 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "expense_category" drop constraint if exists "expense_category_name_unique";`);
    this.addSql(`create table if not exists "expense_category" ("id" text not null, "name" text not null, "description" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "expense_category_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_expense_category_name_unique" ON "expense_category" ("name") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_expense_category_deleted_at" ON "expense_category" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "expense" ("id" text not null, "amount" integer not null, "description" text null, "date" timestamptz not null, "category_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "expense_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_expense_category_id" ON "expense" ("category_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_expense_deleted_at" ON "expense" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "variant_buying_price" ("variant_id" text not null, "buying_price" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "variant_buying_price_pkey" primary key ("variant_id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_variant_buying_price_deleted_at" ON "variant_buying_price" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "expense" add constraint "expense_category_id_foreign" foreign key ("category_id") references "expense_category" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "expense" drop constraint if exists "expense_category_id_foreign";`);

    this.addSql(`drop table if exists "expense_category" cascade;`);

    this.addSql(`drop table if exists "expense" cascade;`);

    this.addSql(`drop table if exists "variant_buying_price" cascade;`);
  }

}
