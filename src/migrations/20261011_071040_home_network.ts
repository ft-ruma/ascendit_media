import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."home" ADD COLUMN "network_eyebrow" varchar DEFAULT 'Network' NOT NULL;
  ALTER TABLE "cms"."home" ADD COLUMN "network_title" varchar DEFAULT 'Every project,
  a new connection.' NOT NULL;
  ALTER TABLE "cms"."home" ADD COLUMN "network_intro" varchar DEFAULT 'Each glowing node is a store we designed, a system we built or a brand we launched. When the network passes one hundred projects it becomes a universe, and every project becomes a star.';
  ALTER TABLE "cms"."home" ADD COLUMN "network_universe_at" numeric DEFAULT 100 NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."home" DROP COLUMN "network_eyebrow";
  ALTER TABLE "cms"."home" DROP COLUMN "network_title";
  ALTER TABLE "cms"."home" DROP COLUMN "network_intro";
  ALTER TABLE "cms"."home" DROP COLUMN "network_universe_at";`)
}
