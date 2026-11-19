CREATE TYPE "public"."bda_approval_scope" AS ENUM('script', 'rights', 'render', 'publish');--> statement-breakpoint
CREATE TYPE "public"."bda_approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."bda_artifact_kind" AS ENUM('source', 'image', 'footage', 'audio', 'thumbnail', 'render', 'subtitle', 'other');--> statement-breakpoint
CREATE TYPE "public"."bda_artifact_rights" AS ENUM('unreviewed', 'cleared', 'blocked', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."bda_audit_target" AS ENUM('project', 'project_version', 'step', 'video', 'render_job', 'approval', 'artifact');--> statement-breakpoint
CREATE TYPE "public"."bda_project_status" AS ENUM('draft', 'in_progress', 'in_review', 'approved', 'archived');--> statement-breakpoint
CREATE TYPE "public"."bda_render_job_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."bda_step_status" AS ENUM('pending', 'active', 'complete', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."bda_video_status" AS ENUM('draft', 'rendered', 'in_review', 'ready', 'published');--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_version_id" uuid NOT NULL,
	"video_id" uuid,
	"scope" "bda_approval_scope" NOT NULL,
	"status" "bda_approval_status" DEFAULT 'pending' NOT NULL,
	"decision_note" text,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "approvals_decision_time_valid" CHECK (("approvals"."status" = 'pending' AND "approvals"."decided_at" IS NULL) OR ("approvals"."status" <> 'pending' AND "approvals"."decided_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_version_id" uuid NOT NULL,
	"kind" "bda_artifact_kind" NOT NULL,
	"rights_status" "bda_artifact_rights" DEFAULT 'unreviewed' NOT NULL,
	"storage_key" text,
	"source_uri" text,
	"license_evidence" text,
	"checksum_sha256" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "artifacts_require_location" CHECK ("artifacts"."storage_key" IS NOT NULL OR "artifacts"."source_uri" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"target_kind" "bda_audit_target" NOT NULL,
	"target_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_events_type_not_blank" CHECK (length(btrim("audit_events"."event_type")) > 0)
);
--> statement-breakpoint
CREATE TABLE "project_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "project_versions_revision_positive" CHECK ("project_versions"."revision" > 0)
);
--> statement-breakpoint
CREATE TABLE "render_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_version_id" uuid NOT NULL,
	"video_id" uuid,
	"status" "bda_render_job_status" DEFAULT 'queued' NOT NULL,
	"progress_pct" integer DEFAULT 0 NOT NULL,
	"attempt" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"manifest" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"lease_expires_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "render_jobs_progress_valid" CHECK ("render_jobs"."progress_pct" BETWEEN 0 AND 100),
	CONSTRAINT "render_jobs_attempt_valid" CHECK ("render_jobs"."attempt" >= 0 AND "render_jobs"."max_attempts" > 0)
);
--> statement-breakpoint
CREATE TABLE "step_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_version_id" uuid NOT NULL,
	"step_number" integer NOT NULL,
	"status" "bda_step_status" DEFAULT 'pending' NOT NULL,
	"draft" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "step_progress_step_valid" CHECK ("step_progress"."step_number" BETWEEN 1 AND 7)
);
--> statement-breakpoint
CREATE TABLE "video_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"status" "bda_project_status" DEFAULT 'draft' NOT NULL,
	"current_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "video_projects_title_not_blank" CHECK (length(btrim("video_projects"."title")) > 0),
	CONSTRAINT "video_projects_version_positive" CHECK ("video_projects"."current_version" > 0)
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"project_version_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"status" "bda_video_status" DEFAULT 'draft' NOT NULL,
	"duration_ms" integer,
	"final_artifact_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "videos_title_not_blank" CHECK (length(btrim("videos"."title")) > 0),
	CONSTRAINT "videos_duration_valid" CHECK ("videos"."duration_ms" IS NULL OR "videos"."duration_ms" >= 0),
	CONSTRAINT "videos_published_require_artifact" CHECK ("videos"."status" <> 'published' OR ("videos"."final_artifact_id" IS NOT NULL AND "videos"."published_at" IS NOT NULL))
);
--> statement-breakpoint
-- Required before the composite videos_project_version_fk. Drizzle Kit emits
-- FK constraints before unique indexes; PostgreSQL requires the unique key first.
CREATE UNIQUE INDEX "project_versions_project_id_unique" ON "project_versions" USING btree ("project_id","id");--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "public"."project_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "public"."project_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_project_id_video_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."video_projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_versions" ADD CONSTRAINT "project_versions_project_id_video_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."video_projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "render_jobs" ADD CONSTRAINT "render_jobs_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "public"."project_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "render_jobs" ADD CONSTRAINT "render_jobs_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "public"."project_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_project_id_video_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."video_projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_final_artifact_id_artifacts_id_fk" FOREIGN KEY ("final_artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_project_version_fk" FOREIGN KEY ("project_id","project_version_id") REFERENCES "public"."project_versions"("project_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "approvals_version_scope_idx" ON "approvals" USING btree ("project_version_id","scope");--> statement-breakpoint
CREATE UNIQUE INDEX "artifacts_storage_key_unique" ON "artifacts" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "artifacts_version_idx" ON "artifacts" USING btree ("project_version_id");--> statement-breakpoint
CREATE INDEX "audit_events_project_created_idx" ON "audit_events" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "project_versions_project_revision_unique" ON "project_versions" USING btree ("project_id","revision");--> statement-breakpoint
CREATE INDEX "render_jobs_status_idx" ON "render_jobs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "render_jobs_version_idx" ON "render_jobs" USING btree ("project_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "step_progress_version_step_unique" ON "step_progress" USING btree ("project_version_id","step_number");--> statement-breakpoint
CREATE INDEX "video_projects_status_idx" ON "video_projects" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "videos_slug_unique" ON "videos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "videos_project_status_idx" ON "videos" USING btree ("project_id","status");