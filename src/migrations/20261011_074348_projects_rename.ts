import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."home" ALTER COLUMN "network_eyebrow" SET DEFAULT 'Ongoing & completed projects';
  ALTER TABLE "cms"."home" ALTER COLUMN "network_intro" SET DEFAULT 'Each glowing node is a store we designed, a system we built or a brand we launched. Ongoing projects pulse; completed ones shine steady. When we pass one hundred projects it becomes a universe, and every project becomes a star.';
  -- rename the section where editors kept the launch wording
  UPDATE "cms"."home" SET "network_eyebrow" = 'Ongoing & completed projects' WHERE "network_eyebrow" = 'Network';
  UPDATE "cms"."home" SET "network_intro" = 'Each glowing node is a store we designed, a system we built or a brand we launched. Ongoing projects pulse; completed ones shine steady. When we pass one hundred projects it becomes a universe, and every project becomes a star.' WHERE "network_intro" = 'Each glowing node is a store we designed, a system we built or a brand we launched. When the network passes one hundred projects it becomes a universe, and every project becomes a star.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."home" ALTER COLUMN "network_eyebrow" SET DEFAULT 'Network';
  ALTER TABLE "cms"."home" ALTER COLUMN "network_intro" SET DEFAULT 'Each glowing node is a store we designed, a system we built or a brand we launched. When the network passes one hundred projects it becomes a universe, and every project becomes a star.';`)
}
