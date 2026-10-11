import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "cms"."enum_case_studies_project_status" AS ENUM('completed', 'in-progress');
  CREATE TYPE "cms"."enum__case_studies_v_version_project_status" AS ENUM('completed', 'in-progress');
  CREATE TABLE "cms"."pillars_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "cms"."home_store_to_system" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "cms"."home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'Ascendit Media · Nittambuwa, Sri Lanka' NOT NULL,
  	"hero_headline" varchar DEFAULT 'We design the store,
  build the system,
  and launch the brand.' NOT NULL,
  	"hero_intro" varchar DEFAULT 'Retail interiors, POS and custom software, websites and launch content. One studio, one team, from the floor plan to the first sale.' NOT NULL,
  	"hero_primary_cta" varchar DEFAULT 'Start a project' NOT NULL,
  	"hero_secondary_cta" varchar DEFAULT 'See the work' NOT NULL,
  	"hero_seal" varchar DEFAULT 'Made in Sri Lanka' NOT NULL,
  	"hero_ask_bubble" varchar DEFAULT 'Can you design my shop and set up the POS too?' NOT NULL,
  	"hero_reply_bubble" varchar DEFAULT 'Yes. And the website, and the launch reels.' NOT NULL,
  	"phone_hero_headline" varchar DEFAULT 'From the shop floor' NOT NULL,
  	"phone_hero_accent" varchar DEFAULT 'to the cloud' NOT NULL,
  	"phone_hero_intro" varchar DEFAULT 'Store design, POS and software, websites and launch content. One studio, one system.' NOT NULL,
  	"beats_services_eyebrow" varchar DEFAULT 'Services' NOT NULL,
  	"beats_services_title" varchar DEFAULT 'Four pillars,
  one studio.' NOT NULL,
  	"beats_services_intro" varchar DEFAULT 'Most shops hire four companies to open one store. We are all four, so the render, the till, the website and the launch reel all agree.',
  	"beats_store_to_system_eyebrow" varchar DEFAULT 'Store to System' NOT NULL,
  	"beats_store_to_system_title" varchar DEFAULT 'From floor plan
  to first sale.' NOT NULL,
  	"beats_store_to_system_intro" varchar DEFAULT 'Pick two or more and the bundle saving applies automatically in the project builder.',
  	"beats_products_eyebrow" varchar DEFAULT 'Products' NOT NULL,
  	"beats_products_title" varchar DEFAULT 'Software we run
  our clients on.' NOT NULL,
  	"beats_products_intro" varchar DEFAULT 'Three apps we built for Sri Lankan businesses, priced monthly, set up by the people who made them.',
  	"beats_work_eyebrow" varchar DEFAULT 'Work' NOT NULL,
  	"beats_work_title" varchar DEFAULT 'Stores open.
  Tills ringing.' NOT NULL,
  	"beats_work_intro" varchar,
  	"beats_proof_eyebrow" varchar DEFAULT 'Proof' NOT NULL,
  	"beats_proof_title" varchar DEFAULT 'In their
  words.' NOT NULL,
  	"beats_proof_intro" varchar,
  	"beats_studio_eyebrow" varchar DEFAULT 'Studio' NOT NULL,
  	"beats_studio_title" varchar DEFAULT 'Small team.
  Whole system.' NOT NULL,
  	"beats_studio_intro" varchar,
  	"beats_start_eyebrow" varchar DEFAULT 'Start' NOT NULL,
  	"beats_start_title" varchar DEFAULT 'Get a price
  in two minutes.' NOT NULL,
  	"beats_start_intro" varchar DEFAULT 'Six short questions, a live estimate in LKR or USD, and a reply within a working day.',
  	"now_building_title" varchar DEFAULT 'Now building' NOT NULL,
  	"now_building_intro" varchar DEFAULT 'Projects on the workbench right now.' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "cms"."case_studies" ADD COLUMN "project_status" "cms"."enum_case_studies_project_status" DEFAULT 'completed';
  ALTER TABLE "cms"."case_studies" ADD COLUMN "progress" varchar;
  ALTER TABLE "cms"."case_studies" ADD COLUMN "expected_launch" timestamp(3) with time zone;
  ALTER TABLE "cms"."_case_studies_v" ADD COLUMN "version_project_status" "cms"."enum__case_studies_v_version_project_status" DEFAULT 'completed';
  ALTER TABLE "cms"."_case_studies_v" ADD COLUMN "version_progress" varchar;
  ALTER TABLE "cms"."_case_studies_v" ADD COLUMN "version_expected_launch" timestamp(3) with time zone;
  ALTER TABLE "cms"."pillars_rels" ADD CONSTRAINT "pillars_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pillars_rels" ADD CONSTRAINT "pillars_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."home_store_to_system" ADD CONSTRAINT "home_store_to_system_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."home"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pillars_rels_order_idx" ON "cms"."pillars_rels" USING btree ("order");
  CREATE INDEX "pillars_rels_parent_idx" ON "cms"."pillars_rels" USING btree ("parent_id");
  CREATE INDEX "pillars_rels_path_idx" ON "cms"."pillars_rels" USING btree ("path");
  CREATE INDEX "pillars_rels_media_id_idx" ON "cms"."pillars_rels" USING btree ("media_id");
  CREATE INDEX "home_store_to_system_order_idx" ON "cms"."home_store_to_system" USING btree ("_order");
  CREATE INDEX "home_store_to_system_parent_id_idx" ON "cms"."home_store_to_system" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms"."pillars_rels" CASCADE;
  DROP TABLE "cms"."home_store_to_system" CASCADE;
  DROP TABLE "cms"."home" CASCADE;
  ALTER TABLE "cms"."case_studies" DROP COLUMN "project_status";
  ALTER TABLE "cms"."case_studies" DROP COLUMN "progress";
  ALTER TABLE "cms"."case_studies" DROP COLUMN "expected_launch";
  ALTER TABLE "cms"."_case_studies_v" DROP COLUMN "version_project_status";
  ALTER TABLE "cms"."_case_studies_v" DROP COLUMN "version_progress";
  ALTER TABLE "cms"."_case_studies_v" DROP COLUMN "version_expected_launch";
  DROP TYPE "cms"."enum_case_studies_project_status";
  DROP TYPE "cms"."enum__case_studies_v_version_project_status";`)
}
