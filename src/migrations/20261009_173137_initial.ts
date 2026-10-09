import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "cms"."enum_pillars_key" AS ENUM('retail', 'software', 'web', 'brand');
  CREATE TYPE "cms"."enum_pillars_accent" AS ENUM('lilac', 'tangerine', 'aqua', 'lime');
  CREATE TYPE "cms"."enum_case_studies_pillars" AS ENUM('retail', 'software', 'web', 'brand');
  CREATE TYPE "cms"."enum_case_studies_approach_pillar" AS ENUM('retail', 'software', 'web', 'brand');
  CREATE TYPE "cms"."enum_case_studies_location" AS ENUM('LK', 'intl');
  CREATE TYPE "cms"."enum_case_studies_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__case_studies_v_version_pillars" AS ENUM('retail', 'software', 'web', 'brand');
  CREATE TYPE "cms"."enum__case_studies_v_version_approach_pillar" AS ENUM('retail', 'software', 'web', 'brand');
  CREATE TYPE "cms"."enum__case_studies_v_version_location" AS ENUM('LK', 'intl');
  CREATE TYPE "cms"."enum__case_studies_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_products_accent" AS ENUM('lilac', 'tangerine', 'aqua', 'lime');
  CREATE TYPE "cms"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__products_v_version_accent" AS ENUM('lilac', 'tangerine', 'aqua', 'lime');
  CREATE TYPE "cms"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_rate_card_pillar" AS ENUM('retail', 'software', 'web', 'brand');
  CREATE TYPE "cms"."enum_rate_card_unit" AS ENUM('project', 'sqft');
  CREATE TYPE "cms"."enum_users_roles" AS ENUM('admin', 'editor', 'pricing');
  CREATE TYPE "cms"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "cms"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "cms"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "cms"."pillars_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "cms"."pillars_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "cms"."pillars_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "cms"."pillars" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" "cms"."enum_pillars_key" NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"accent" "cms"."enum_pillars_accent" NOT NULL,
  	"one_liner" varchar NOT NULL,
  	"h1" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"from_price_l_k_r" numeric NOT NULL,
  	"from_price_u_s_d" numeric NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."case_studies_pillars" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms"."enum_case_studies_pillars",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cms"."case_studies_approach" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pillar" "cms"."enum_case_studies_approach_pillar",
  	"body" varchar
  );
  
  CREATE TABLE "cms"."case_studies_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"unit" varchar
  );
  
  CREATE TABLE "cms"."case_studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client" varchar,
  	"slug" varchar,
  	"logo_id" integer,
  	"industry" varchar,
  	"location" "cms"."enum_case_studies_location" DEFAULT 'LK',
  	"result" varchar,
  	"brief" varchar,
  	"cover_id" integer,
  	"video_id" integer,
  	"quote_id" integer,
  	"window_file_name" varchar,
  	"featured" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_case_studies_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."case_studies_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "cms"."_case_studies_v_version_pillars" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms"."enum__case_studies_v_version_pillars",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cms"."_case_studies_v_version_approach" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"pillar" "cms"."enum__case_studies_v_version_approach_pillar",
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_case_studies_v_version_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"unit" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_case_studies_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_client" varchar,
  	"version_slug" varchar,
  	"version_logo_id" integer,
  	"version_industry" varchar,
  	"version_location" "cms"."enum__case_studies_v_version_location" DEFAULT 'LK',
  	"version_result" varchar,
  	"version_brief" varchar,
  	"version_cover_id" integer,
  	"version_video_id" integer,
  	"version_quote_id" integer,
  	"version_window_file_name" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__case_studies_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "cms"."_case_studies_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "cms"."products_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "cms"."products_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"highlight" boolean,
  	"lkr" numeric,
  	"usd" numeric,
  	"yearly_discount_pct" numeric DEFAULT 15,
  	"setup_l_k_r" numeric,
  	"setup_u_s_d" numeric
  );
  
  CREATE TABLE "cms"."products_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "cms"."products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"glyph" varchar,
  	"accent" "cms"."enum_products_accent",
  	"app_icon_id" integer,
  	"pitch" varchar,
  	"audience" varchar,
  	"demo_url" varchar,
  	"trial_url" varchar,
  	"screen_recording_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_products_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_products_v_version_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"highlight" boolean,
  	"lkr" numeric,
  	"usd" numeric,
  	"yearly_discount_pct" numeric DEFAULT 15,
  	"setup_l_k_r" numeric,
  	"setup_u_s_d" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_products_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "cms"."_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_glyph" varchar,
  	"version_accent" "cms"."enum__products_v_version_accent",
  	"version_app_icon_id" integer,
  	"version_pitch" varchar,
  	"version_audience" varchar,
  	"version_demo_url" varchar,
  	"version_trial_url" varchar,
  	"version_screen_recording_id" integer,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."rate_card_multipliers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"factor" numeric NOT NULL
  );
  
  CREATE TABLE "cms"."rate_card" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pillar" "cms"."enum_rate_card_pillar" NOT NULL,
  	"unit" "cms"."enum_rate_card_unit" DEFAULT 'project' NOT NULL,
  	"base_price_l_k_r" numeric NOT NULL,
  	"base_price_u_s_d" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"person" varchar NOT NULL,
  	"role" varchar,
  	"company" varchar NOT NULL,
  	"case_study_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"portrait_loop_id" integer,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."careers_description" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"paragraph" varchar NOT NULL
  );
  
  CREATE TABLE "cms"."careers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" varchar DEFAULT 'Full-time' NOT NULL,
  	"location" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"open" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"poster_id" integer,
  	"sources_av1_id" integer,
  	"sources_webm_id" integer,
  	"sources_vertical_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar
  );
  
  CREATE TABLE "cms"."users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms"."enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cms"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "cms"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "cms"."lead_outbox" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"type" varchar NOT NULL,
  	"payload" jsonb NOT NULL,
  	"attempts" numeric DEFAULT 0,
  	"last_error" varchar,
  	"delivered" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "cms"."payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "cms"."enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "cms"."enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "cms"."payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "cms"."enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pillars_id" integer,
  	"case_studies_id" integer,
  	"products_id" integer,
  	"rate_card_id" integer,
  	"testimonials_id" integer,
  	"team_id" integer,
  	"careers_id" integer,
  	"pages_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"lead_outbox_id" integer
  );
  
  CREATE TABLE "cms"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "cms"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."settings_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "cms"."settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats_clients" numeric NOT NULL,
  	"stats_team" numeric NOT NULL,
  	"stats_products" numeric NOT NULL,
  	"stats_years" numeric NOT NULL,
  	"open_for_projects" boolean DEFAULT true,
  	"whatsapp" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"booking_url" varchar NOT NULL,
  	"office_line1" varchar NOT NULL,
  	"office_city" varchar NOT NULL,
  	"office_country" varchar NOT NULL,
  	"office_map_url" varchar,
  	"founder_note_quote" varchar NOT NULL,
  	"founder_note_name" varchar NOT NULL,
  	"founder_note_role" varchar NOT NULL,
  	"founder_note_video_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "cms"."pricing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"bundle_saving_pct" numeric DEFAULT 0.1 NOT NULL,
  	"range_width" numeric DEFAULT 1.6 NOT NULL,
  	"round_l_k_r" numeric DEFAULT 5000 NOT NULL,
  	"round_u_s_d" numeric DEFAULT 50 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "cms"."pillars_capabilities" ADD CONSTRAINT "pillars_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pillars_process" ADD CONSTRAINT "pillars_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pillars_tools" ADD CONSTRAINT "pillars_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."pillars" ADD CONSTRAINT "pillars_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."case_studies_pillars" ADD CONSTRAINT "case_studies_pillars_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."case_studies_approach" ADD CONSTRAINT "case_studies_approach_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."case_studies_metrics" ADD CONSTRAINT "case_studies_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."case_studies" ADD CONSTRAINT "case_studies_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."case_studies" ADD CONSTRAINT "case_studies_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."case_studies" ADD CONSTRAINT "case_studies_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."case_studies" ADD CONSTRAINT "case_studies_quote_id_testimonials_id_fk" FOREIGN KEY ("quote_id") REFERENCES "cms"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."case_studies" ADD CONSTRAINT "case_studies_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."case_studies_rels" ADD CONSTRAINT "case_studies_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."case_studies_rels" ADD CONSTRAINT "case_studies_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v_version_pillars" ADD CONSTRAINT "_case_studies_v_version_pillars_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v_version_approach" ADD CONSTRAINT "_case_studies_v_version_approach_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v_version_metrics" ADD CONSTRAINT "_case_studies_v_version_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v" ADD CONSTRAINT "_case_studies_v_parent_id_case_studies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_video_id_media_id_fk" FOREIGN KEY ("version_video_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_quote_id_testimonials_id_fk" FOREIGN KEY ("version_quote_id") REFERENCES "cms"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."products_features" ADD CONSTRAINT "products_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."products_plans" ADD CONSTRAINT "products_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."products_faq" ADD CONSTRAINT "products_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."products" ADD CONSTRAINT "products_app_icon_id_media_id_fk" FOREIGN KEY ("app_icon_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."products" ADD CONSTRAINT "products_screen_recording_id_media_id_fk" FOREIGN KEY ("screen_recording_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."products" ADD CONSTRAINT "products_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_products_v_version_features" ADD CONSTRAINT "_products_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_products_v_version_plans" ADD CONSTRAINT "_products_v_version_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_products_v_version_faq" ADD CONSTRAINT "_products_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_products_v" ADD CONSTRAINT "_products_v_version_app_icon_id_media_id_fk" FOREIGN KEY ("version_app_icon_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_products_v" ADD CONSTRAINT "_products_v_version_screen_recording_id_media_id_fk" FOREIGN KEY ("version_screen_recording_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_products_v" ADD CONSTRAINT "_products_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."rate_card_multipliers" ADD CONSTRAINT "rate_card_multipliers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."rate_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."testimonials" ADD CONSTRAINT "testimonials_case_study_id_case_studies_id_fk" FOREIGN KEY ("case_study_id") REFERENCES "cms"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."team" ADD CONSTRAINT "team_portrait_loop_id_media_id_fk" FOREIGN KEY ("portrait_loop_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."careers_description" ADD CONSTRAINT "careers_description_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."careers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."media" ADD CONSTRAINT "media_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."media" ADD CONSTRAINT "media_sources_av1_id_media_id_fk" FOREIGN KEY ("sources_av1_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."media" ADD CONSTRAINT "media_sources_webm_id_media_id_fk" FOREIGN KEY ("sources_webm_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."media" ADD CONSTRAINT "media_sources_vertical_id_media_id_fk" FOREIGN KEY ("sources_vertical_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pillars_fk" FOREIGN KEY ("pillars_id") REFERENCES "cms"."pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "cms"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "cms"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rate_card_fk" FOREIGN KEY ("rate_card_id") REFERENCES "cms"."rate_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "cms"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "cms"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_careers_fk" FOREIGN KEY ("careers_id") REFERENCES "cms"."careers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "cms"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lead_outbox_fk" FOREIGN KEY ("lead_outbox_id") REFERENCES "cms"."lead_outbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."settings_socials" ADD CONSTRAINT "settings_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."settings" ADD CONSTRAINT "settings_founder_note_video_id_media_id_fk" FOREIGN KEY ("founder_note_video_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pillars_capabilities_order_idx" ON "cms"."pillars_capabilities" USING btree ("_order");
  CREATE INDEX "pillars_capabilities_parent_id_idx" ON "cms"."pillars_capabilities" USING btree ("_parent_id");
  CREATE INDEX "pillars_process_order_idx" ON "cms"."pillars_process" USING btree ("_order");
  CREATE INDEX "pillars_process_parent_id_idx" ON "cms"."pillars_process" USING btree ("_parent_id");
  CREATE INDEX "pillars_tools_order_idx" ON "cms"."pillars_tools" USING btree ("_order");
  CREATE INDEX "pillars_tools_parent_id_idx" ON "cms"."pillars_tools" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pillars_key_idx" ON "cms"."pillars" USING btree ("key");
  CREATE UNIQUE INDEX "pillars_slug_idx" ON "cms"."pillars" USING btree ("slug");
  CREATE INDEX "pillars_seo_seo_image_idx" ON "cms"."pillars" USING btree ("seo_image_id");
  CREATE INDEX "pillars_updated_at_idx" ON "cms"."pillars" USING btree ("updated_at");
  CREATE INDEX "pillars_created_at_idx" ON "cms"."pillars" USING btree ("created_at");
  CREATE INDEX "case_studies_pillars_order_idx" ON "cms"."case_studies_pillars" USING btree ("order");
  CREATE INDEX "case_studies_pillars_parent_idx" ON "cms"."case_studies_pillars" USING btree ("parent_id");
  CREATE INDEX "case_studies_approach_order_idx" ON "cms"."case_studies_approach" USING btree ("_order");
  CREATE INDEX "case_studies_approach_parent_id_idx" ON "cms"."case_studies_approach" USING btree ("_parent_id");
  CREATE INDEX "case_studies_metrics_order_idx" ON "cms"."case_studies_metrics" USING btree ("_order");
  CREATE INDEX "case_studies_metrics_parent_id_idx" ON "cms"."case_studies_metrics" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "case_studies_slug_idx" ON "cms"."case_studies" USING btree ("slug");
  CREATE INDEX "case_studies_logo_idx" ON "cms"."case_studies" USING btree ("logo_id");
  CREATE INDEX "case_studies_cover_idx" ON "cms"."case_studies" USING btree ("cover_id");
  CREATE INDEX "case_studies_video_idx" ON "cms"."case_studies" USING btree ("video_id");
  CREATE INDEX "case_studies_quote_idx" ON "cms"."case_studies" USING btree ("quote_id");
  CREATE INDEX "case_studies_seo_seo_image_idx" ON "cms"."case_studies" USING btree ("seo_image_id");
  CREATE INDEX "case_studies_updated_at_idx" ON "cms"."case_studies" USING btree ("updated_at");
  CREATE INDEX "case_studies_created_at_idx" ON "cms"."case_studies" USING btree ("created_at");
  CREATE INDEX "case_studies__status_idx" ON "cms"."case_studies" USING btree ("_status");
  CREATE INDEX "case_studies_rels_order_idx" ON "cms"."case_studies_rels" USING btree ("order");
  CREATE INDEX "case_studies_rels_parent_idx" ON "cms"."case_studies_rels" USING btree ("parent_id");
  CREATE INDEX "case_studies_rels_path_idx" ON "cms"."case_studies_rels" USING btree ("path");
  CREATE INDEX "case_studies_rels_media_id_idx" ON "cms"."case_studies_rels" USING btree ("media_id");
  CREATE INDEX "_case_studies_v_version_pillars_order_idx" ON "cms"."_case_studies_v_version_pillars" USING btree ("order");
  CREATE INDEX "_case_studies_v_version_pillars_parent_idx" ON "cms"."_case_studies_v_version_pillars" USING btree ("parent_id");
  CREATE INDEX "_case_studies_v_version_approach_order_idx" ON "cms"."_case_studies_v_version_approach" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_approach_parent_id_idx" ON "cms"."_case_studies_v_version_approach" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_metrics_order_idx" ON "cms"."_case_studies_v_version_metrics" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_metrics_parent_id_idx" ON "cms"."_case_studies_v_version_metrics" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_parent_idx" ON "cms"."_case_studies_v" USING btree ("parent_id");
  CREATE INDEX "_case_studies_v_version_version_slug_idx" ON "cms"."_case_studies_v" USING btree ("version_slug");
  CREATE INDEX "_case_studies_v_version_version_logo_idx" ON "cms"."_case_studies_v" USING btree ("version_logo_id");
  CREATE INDEX "_case_studies_v_version_version_cover_idx" ON "cms"."_case_studies_v" USING btree ("version_cover_id");
  CREATE INDEX "_case_studies_v_version_version_video_idx" ON "cms"."_case_studies_v" USING btree ("version_video_id");
  CREATE INDEX "_case_studies_v_version_version_quote_idx" ON "cms"."_case_studies_v" USING btree ("version_quote_id");
  CREATE INDEX "_case_studies_v_version_seo_version_seo_image_idx" ON "cms"."_case_studies_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_case_studies_v_version_version_updated_at_idx" ON "cms"."_case_studies_v" USING btree ("version_updated_at");
  CREATE INDEX "_case_studies_v_version_version_created_at_idx" ON "cms"."_case_studies_v" USING btree ("version_created_at");
  CREATE INDEX "_case_studies_v_version_version__status_idx" ON "cms"."_case_studies_v" USING btree ("version__status");
  CREATE INDEX "_case_studies_v_created_at_idx" ON "cms"."_case_studies_v" USING btree ("created_at");
  CREATE INDEX "_case_studies_v_updated_at_idx" ON "cms"."_case_studies_v" USING btree ("updated_at");
  CREATE INDEX "_case_studies_v_latest_idx" ON "cms"."_case_studies_v" USING btree ("latest");
  CREATE INDEX "_case_studies_v_autosave_idx" ON "cms"."_case_studies_v" USING btree ("autosave");
  CREATE INDEX "_case_studies_v_rels_order_idx" ON "cms"."_case_studies_v_rels" USING btree ("order");
  CREATE INDEX "_case_studies_v_rels_parent_idx" ON "cms"."_case_studies_v_rels" USING btree ("parent_id");
  CREATE INDEX "_case_studies_v_rels_path_idx" ON "cms"."_case_studies_v_rels" USING btree ("path");
  CREATE INDEX "_case_studies_v_rels_media_id_idx" ON "cms"."_case_studies_v_rels" USING btree ("media_id");
  CREATE INDEX "products_features_order_idx" ON "cms"."products_features" USING btree ("_order");
  CREATE INDEX "products_features_parent_id_idx" ON "cms"."products_features" USING btree ("_parent_id");
  CREATE INDEX "products_plans_order_idx" ON "cms"."products_plans" USING btree ("_order");
  CREATE INDEX "products_plans_parent_id_idx" ON "cms"."products_plans" USING btree ("_parent_id");
  CREATE INDEX "products_faq_order_idx" ON "cms"."products_faq" USING btree ("_order");
  CREATE INDEX "products_faq_parent_id_idx" ON "cms"."products_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "cms"."products" USING btree ("slug");
  CREATE INDEX "products_app_icon_idx" ON "cms"."products" USING btree ("app_icon_id");
  CREATE INDEX "products_screen_recording_idx" ON "cms"."products" USING btree ("screen_recording_id");
  CREATE INDEX "products_seo_seo_image_idx" ON "cms"."products" USING btree ("seo_image_id");
  CREATE INDEX "products_updated_at_idx" ON "cms"."products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "cms"."products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "cms"."products" USING btree ("_status");
  CREATE INDEX "_products_v_version_features_order_idx" ON "cms"."_products_v_version_features" USING btree ("_order");
  CREATE INDEX "_products_v_version_features_parent_id_idx" ON "cms"."_products_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_plans_order_idx" ON "cms"."_products_v_version_plans" USING btree ("_order");
  CREATE INDEX "_products_v_version_plans_parent_id_idx" ON "cms"."_products_v_version_plans" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_faq_order_idx" ON "cms"."_products_v_version_faq" USING btree ("_order");
  CREATE INDEX "_products_v_version_faq_parent_id_idx" ON "cms"."_products_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "cms"."_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "cms"."_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_app_icon_idx" ON "cms"."_products_v" USING btree ("version_app_icon_id");
  CREATE INDEX "_products_v_version_version_screen_recording_idx" ON "cms"."_products_v" USING btree ("version_screen_recording_id");
  CREATE INDEX "_products_v_version_seo_version_seo_image_idx" ON "cms"."_products_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "cms"."_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "cms"."_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "cms"."_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "cms"."_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "cms"."_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "cms"."_products_v" USING btree ("latest");
  CREATE INDEX "rate_card_multipliers_order_idx" ON "cms"."rate_card_multipliers" USING btree ("_order");
  CREATE INDEX "rate_card_multipliers_parent_id_idx" ON "cms"."rate_card_multipliers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "rate_card_pillar_idx" ON "cms"."rate_card" USING btree ("pillar");
  CREATE INDEX "rate_card_updated_at_idx" ON "cms"."rate_card" USING btree ("updated_at");
  CREATE INDEX "rate_card_created_at_idx" ON "cms"."rate_card" USING btree ("created_at");
  CREATE INDEX "testimonials_case_study_idx" ON "cms"."testimonials" USING btree ("case_study_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "cms"."testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "cms"."testimonials" USING btree ("created_at");
  CREATE INDEX "team_portrait_loop_idx" ON "cms"."team" USING btree ("portrait_loop_id");
  CREATE INDEX "team_updated_at_idx" ON "cms"."team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "cms"."team" USING btree ("created_at");
  CREATE INDEX "careers_description_order_idx" ON "cms"."careers_description" USING btree ("_order");
  CREATE INDEX "careers_description_parent_id_idx" ON "cms"."careers_description" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "careers_slug_idx" ON "cms"."careers" USING btree ("slug");
  CREATE INDEX "careers_updated_at_idx" ON "cms"."careers" USING btree ("updated_at");
  CREATE INDEX "careers_created_at_idx" ON "cms"."careers" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "cms"."pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "cms"."pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "cms"."pages" USING btree ("created_at");
  CREATE INDEX "media_poster_idx" ON "cms"."media" USING btree ("poster_id");
  CREATE INDEX "media_sources_sources_av1_idx" ON "cms"."media" USING btree ("sources_av1_id");
  CREATE INDEX "media_sources_sources_webm_idx" ON "cms"."media" USING btree ("sources_webm_id");
  CREATE INDEX "media_sources_sources_vertical_idx" ON "cms"."media" USING btree ("sources_vertical_id");
  CREATE INDEX "media_updated_at_idx" ON "cms"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "cms"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "cms"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "cms"."media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "cms"."media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "cms"."media" USING btree ("sizes_wide_filename");
  CREATE INDEX "users_roles_order_idx" ON "cms"."users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "cms"."users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "cms"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "cms"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "cms"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "cms"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "cms"."users" USING btree ("email");
  CREATE INDEX "lead_outbox_reference_idx" ON "cms"."lead_outbox" USING btree ("reference");
  CREATE INDEX "lead_outbox_updated_at_idx" ON "cms"."lead_outbox" USING btree ("updated_at");
  CREATE INDEX "lead_outbox_created_at_idx" ON "cms"."lead_outbox" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "cms"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "cms"."payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "cms"."payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "cms"."payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "cms"."payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "cms"."payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "cms"."payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "cms"."payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "cms"."payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "cms"."payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "cms"."payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "cms"."payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "cms"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "cms"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "cms"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "cms"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "cms"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "cms"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pillars_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("pillars_id");
  CREATE INDEX "payload_locked_documents_rels_case_studies_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("case_studies_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_rate_card_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("rate_card_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_careers_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("careers_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_lead_outbox_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("lead_outbox_id");
  CREATE INDEX "payload_preferences_key_idx" ON "cms"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "cms"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "cms"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "cms"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "cms"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "cms"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "cms"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "cms"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "cms"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "settings_socials_order_idx" ON "cms"."settings_socials" USING btree ("_order");
  CREATE INDEX "settings_socials_parent_id_idx" ON "cms"."settings_socials" USING btree ("_parent_id");
  CREATE INDEX "settings_founder_note_founder_note_video_idx" ON "cms"."settings" USING btree ("founder_note_video_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms"."pillars_capabilities" CASCADE;
  DROP TABLE "cms"."pillars_process" CASCADE;
  DROP TABLE "cms"."pillars_tools" CASCADE;
  DROP TABLE "cms"."pillars" CASCADE;
  DROP TABLE "cms"."case_studies_pillars" CASCADE;
  DROP TABLE "cms"."case_studies_approach" CASCADE;
  DROP TABLE "cms"."case_studies_metrics" CASCADE;
  DROP TABLE "cms"."case_studies" CASCADE;
  DROP TABLE "cms"."case_studies_rels" CASCADE;
  DROP TABLE "cms"."_case_studies_v_version_pillars" CASCADE;
  DROP TABLE "cms"."_case_studies_v_version_approach" CASCADE;
  DROP TABLE "cms"."_case_studies_v_version_metrics" CASCADE;
  DROP TABLE "cms"."_case_studies_v" CASCADE;
  DROP TABLE "cms"."_case_studies_v_rels" CASCADE;
  DROP TABLE "cms"."products_features" CASCADE;
  DROP TABLE "cms"."products_plans" CASCADE;
  DROP TABLE "cms"."products_faq" CASCADE;
  DROP TABLE "cms"."products" CASCADE;
  DROP TABLE "cms"."_products_v_version_features" CASCADE;
  DROP TABLE "cms"."_products_v_version_plans" CASCADE;
  DROP TABLE "cms"."_products_v_version_faq" CASCADE;
  DROP TABLE "cms"."_products_v" CASCADE;
  DROP TABLE "cms"."rate_card_multipliers" CASCADE;
  DROP TABLE "cms"."rate_card" CASCADE;
  DROP TABLE "cms"."testimonials" CASCADE;
  DROP TABLE "cms"."team" CASCADE;
  DROP TABLE "cms"."careers_description" CASCADE;
  DROP TABLE "cms"."careers" CASCADE;
  DROP TABLE "cms"."pages" CASCADE;
  DROP TABLE "cms"."media" CASCADE;
  DROP TABLE "cms"."users_roles" CASCADE;
  DROP TABLE "cms"."users_sessions" CASCADE;
  DROP TABLE "cms"."users" CASCADE;
  DROP TABLE "cms"."lead_outbox" CASCADE;
  DROP TABLE "cms"."payload_kv" CASCADE;
  DROP TABLE "cms"."payload_jobs_log" CASCADE;
  DROP TABLE "cms"."payload_jobs" CASCADE;
  DROP TABLE "cms"."payload_locked_documents" CASCADE;
  DROP TABLE "cms"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "cms"."payload_preferences" CASCADE;
  DROP TABLE "cms"."payload_preferences_rels" CASCADE;
  DROP TABLE "cms"."payload_migrations" CASCADE;
  DROP TABLE "cms"."settings_socials" CASCADE;
  DROP TABLE "cms"."settings" CASCADE;
  DROP TABLE "cms"."pricing" CASCADE;
  DROP TYPE "cms"."enum_pillars_key";
  DROP TYPE "cms"."enum_pillars_accent";
  DROP TYPE "cms"."enum_case_studies_pillars";
  DROP TYPE "cms"."enum_case_studies_approach_pillar";
  DROP TYPE "cms"."enum_case_studies_location";
  DROP TYPE "cms"."enum_case_studies_status";
  DROP TYPE "cms"."enum__case_studies_v_version_pillars";
  DROP TYPE "cms"."enum__case_studies_v_version_approach_pillar";
  DROP TYPE "cms"."enum__case_studies_v_version_location";
  DROP TYPE "cms"."enum__case_studies_v_version_status";
  DROP TYPE "cms"."enum_products_accent";
  DROP TYPE "cms"."enum_products_status";
  DROP TYPE "cms"."enum__products_v_version_accent";
  DROP TYPE "cms"."enum__products_v_version_status";
  DROP TYPE "cms"."enum_rate_card_pillar";
  DROP TYPE "cms"."enum_rate_card_unit";
  DROP TYPE "cms"."enum_users_roles";
  DROP TYPE "cms"."enum_payload_jobs_log_task_slug";
  DROP TYPE "cms"."enum_payload_jobs_log_state";
  DROP TYPE "cms"."enum_payload_jobs_task_slug";`)
}
