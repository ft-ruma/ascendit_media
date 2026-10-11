import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "cms"."enum_case_studies_sub_projects_service" AS ENUM('retail', 'software', 'web', 'brand');
  CREATE TYPE "cms"."enum_case_studies_sub_projects_stage" AS ENUM('completed', 'in-progress');
  CREATE TYPE "cms"."enum__case_studies_v_version_sub_projects_service" AS ENUM('retail', 'software', 'web', 'brand');
  CREATE TYPE "cms"."enum__case_studies_v_version_sub_projects_stage" AS ENUM('completed', 'in-progress');
  CREATE TABLE "cms"."case_studies_sub_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"service" "cms"."enum_case_studies_sub_projects_service",
  	"stage" "cms"."enum_case_studies_sub_projects_stage" DEFAULT 'completed',
  	"summary" varchar,
  	"started_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "cms"."_case_studies_v_version_sub_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"service" "cms"."enum__case_studies_v_version_sub_projects_service",
  	"stage" "cms"."enum__case_studies_v_version_sub_projects_stage" DEFAULT 'completed',
  	"summary" varchar,
  	"started_at" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  ALTER TABLE "cms"."case_studies_sub_projects" ADD CONSTRAINT "case_studies_sub_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v_version_sub_projects" ADD CONSTRAINT "_case_studies_v_version_sub_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "case_studies_sub_projects_order_idx" ON "cms"."case_studies_sub_projects" USING btree ("_order");
  CREATE INDEX "case_studies_sub_projects_parent_id_idx" ON "cms"."case_studies_sub_projects" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_sub_projects_order_idx" ON "cms"."_case_studies_v_version_sub_projects" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_sub_projects_parent_id_idx" ON "cms"."_case_studies_v_version_sub_projects" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms"."case_studies_sub_projects" CASCADE;
  DROP TABLE "cms"."_case_studies_v_version_sub_projects" CASCADE;
  DROP TYPE "cms"."enum_case_studies_sub_projects_service";
  DROP TYPE "cms"."enum_case_studies_sub_projects_stage";
  DROP TYPE "cms"."enum__case_studies_v_version_sub_projects_service";
  DROP TYPE "cms"."enum__case_studies_v_version_sub_projects_stage";`)
}
