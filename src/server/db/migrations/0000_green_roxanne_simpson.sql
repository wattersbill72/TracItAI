CREATE TYPE "public"."camera_angle" AS ENUM('dtl', 'face_on', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."clip_processing_status" AS ENUM('pending', 'processing', 'complete', 'failed');--> statement-breakpoint
CREATE TYPE "public"."cv_processing_status" AS ENUM('pending', 'queued', 'processing', 'complete', 'failed');--> statement-breakpoint
CREATE TYPE "public"."fairway_miss_direction" AS ENUM('left', 'right');--> statement-breakpoint
CREATE TYPE "public"."lie" AS ENUM('tee', 'fairway', 'rough', 'deep_rough', 'sand', 'recovery', 'fringe', 'green');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."session_entry_method" AS ENUM('voice', 'form', 'both');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('round', 'range', 'short_game');--> statement-breakpoint
CREATE TYPE "public"."sg_source" AS ENUM('calculated', 'arccos_override', 'manual');--> statement-breakpoint
CREATE TYPE "public"."shot_entry_method" AS ENUM('voice', 'form', 'cv_assisted');--> statement-breakpoint
CREATE TYPE "public"."shot_result" AS ENUM('fairway', 'left_rough', 'right_rough', 'sand', 'ob', 'water', 'green', 'holed');--> statement-breakpoint
CREATE TYPE "public"."shot_shape" AS ENUM('straight', 'draw', 'fade', 'hook', 'slice', 'push', 'pull');--> statement-breakpoint
CREATE TYPE "public"."tag_source" AS ENUM('auto_cv', 'auto_whisper', 'auto_nova', 'user');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('pending', 'invited', 'rejected');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clarification_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"clip_id" uuid NOT NULL,
	"signals" jsonb,
	"suggested_angle" text,
	"suggested_hole" integer,
	"suggested_shots" jsonb,
	"confidence" numeric(4, 3),
	"resolved_at" timestamp with time zone,
	"resolution" jsonb,
	"learn_from_resolution" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"blob_url" text NOT NULL,
	"filename" text NOT NULL,
	"duration_seconds" integer,
	"file_size_bytes" bigint,
	"camera_angle" "camera_angle",
	"angle_confidence" numeric(4, 3),
	"capture_timestamp" timestamp with time zone,
	"gpmf_device_name" text,
	"transcript" text,
	"transcript_confidence" numeric(4, 3),
	"processing_status" "clip_processing_status" DEFAULT 'pending' NOT NULL,
	"processing_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_holes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"tee_id" uuid NOT NULL,
	"hole_number" integer NOT NULL,
	"par" integer NOT NULL,
	"yards" integer,
	"handicap_index" integer,
	"is_modified" boolean DEFAULT false NOT NULL,
	"modification_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_course_holes_tee_hole" UNIQUE("tee_id","hole_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_tees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"tee_name" text NOT NULL,
	"tee_color" text,
	"total_yards" integer,
	"course_rating" numeric(4, 1),
	"slope_rating" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_course_tees_course_tee" UNIQUE("course_id","tee_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"golf_intelligence_id" text,
	"name" text NOT NULL,
	"city" text,
	"state" text,
	"country" text DEFAULT 'USA' NOT NULL,
	"total_holes" integer DEFAULT 18 NOT NULL,
	"is_manually_entered" boolean DEFAULT false NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hole_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"hole_number" integer NOT NULL,
	"par" integer,
	"score" integer,
	"fairway_hit" boolean,
	"fairway_miss_direction" "fairway_miss_direction",
	"gir" boolean,
	"putts" integer,
	"penalty_strokes" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_hole_summaries_session_hole" UNIQUE("session_id","hole_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"created_by" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "session_type" NOT NULL,
	"session_date" date NOT NULL,
	"course_id" uuid,
	"tee_id" uuid,
	"tee_used" text,
	"weather_conditions" text,
	"temperature_f" integer,
	"wind_description" text,
	"notes" text,
	"entry_method" "session_entry_method",
	"arccos_round_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sg_baseline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lie" text NOT NULL,
	"distance_yards" integer NOT NULL,
	"expected_strokes" numeric(5, 3) NOT NULL,
	CONSTRAINT "uq_sg_baseline_lie_distance" UNIQUE("lie","distance_yards")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shot_clips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shot_id" uuid NOT NULL,
	"clip_id" uuid NOT NULL,
	"trimmed_blob_url" text,
	"trim_start_seconds" numeric(8, 3),
	"trim_end_seconds" numeric(8, 3),
	"ball_flight_data" jsonb,
	"pose_landmarks_dtl" jsonb,
	"pose_landmarks_fo" jsonb,
	"arc_overlay_blob_url" text,
	"cv_processing_status" "cv_processing_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shot_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shot_id" uuid NOT NULL,
	"tag_category" text NOT NULL,
	"tag_key" text NOT NULL,
	"tag_value" text NOT NULL,
	"measured_value" text,
	"source" "tag_source" NOT NULL,
	"confidence" numeric(4, 3),
	"user_confirmed" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"hole_number" integer,
	"shot_number" integer,
	"club" text,
	"distance_yards" numeric(6, 1),
	"lie" "lie",
	"shot_result" "shot_result",
	"shot_shape" "shot_shape",
	"pin_distance_feet" numeric(6, 1),
	"sg_total" numeric(5, 3),
	"sg_off_tee" numeric(5, 3),
	"sg_approach" numeric(5, 3),
	"sg_around_green" numeric(5, 3),
	"sg_putting" numeric(5, 3),
	"sg_source" "sg_source" DEFAULT 'calculated' NOT NULL,
	"entry_method" "shot_entry_method",
	"voice_transcript" text,
	"shot_timestamp" timestamp with time zone,
	"arccos_shot_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "telemetry_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"user_id" uuid,
	"properties" jsonb,
	"ip_hash" text,
	"device_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_system_account" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"message" text,
	"status" "waitlist_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actioned_at" timestamp with time zone,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clarification_queue" ADD CONSTRAINT "clarification_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clarification_queue" ADD CONSTRAINT "clarification_queue_clip_id_clips_id_fk" FOREIGN KEY ("clip_id") REFERENCES "public"."clips"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clips" ADD CONSTRAINT "clips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clips" ADD CONSTRAINT "clips_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_holes" ADD CONSTRAINT "course_holes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_holes" ADD CONSTRAINT "course_holes_tee_id_course_tees_id_fk" FOREIGN KEY ("tee_id") REFERENCES "public"."course_tees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_tees" ADD CONSTRAINT "course_tees_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hole_summaries" ADD CONSTRAINT "hole_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hole_summaries" ADD CONSTRAINT "hole_summaries_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invites" ADD CONSTRAINT "invites_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tee_id_course_tees_id_fk" FOREIGN KEY ("tee_id") REFERENCES "public"."course_tees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shot_clips" ADD CONSTRAINT "shot_clips_shot_id_shots_id_fk" FOREIGN KEY ("shot_id") REFERENCES "public"."shots"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shot_clips" ADD CONSTRAINT "shot_clips_clip_id_clips_id_fk" FOREIGN KEY ("clip_id") REFERENCES "public"."clips"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shot_tags" ADD CONSTRAINT "shot_tags_shot_id_shots_id_fk" FOREIGN KEY ("shot_id") REFERENCES "public"."shots"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shots" ADD CONSTRAINT "shots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shots" ADD CONSTRAINT "shots_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "telemetry_events" ADD CONSTRAINT "telemetry_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_clips_user_id" ON "clips" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_clips_session_id" ON "clips" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_clips_processing_status" ON "clips" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_courses_golf_intelligence_id" ON "courses" USING btree ("golf_intelligence_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hole_summaries_session_id" ON "hole_summaries" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_type" ON "sessions" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shot_tags_shot_id" ON "shot_tags" USING btree ("shot_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shots_user_id" ON "shots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shots_session_id" ON "shots" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_telemetry_event_type" ON "telemetry_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_telemetry_user_id" ON "telemetry_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_telemetry_created_at" ON "telemetry_events" USING btree ("created_at");