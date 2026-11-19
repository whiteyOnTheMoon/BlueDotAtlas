ALTER TABLE "render_jobs" ADD COLUMN "lease_token" uuid;--> statement-breakpoint
ALTER TABLE "render_jobs" ADD COLUMN "heartbeat_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "render_jobs" ADD COLUMN "available_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "render_jobs_dispatch_idx" ON "render_jobs" USING btree ("status","available_at","created_at");--> statement-breakpoint
ALTER TABLE "render_jobs" ADD CONSTRAINT "render_jobs_lease_ownership_valid" CHECK (("render_jobs"."status" = 'running' AND "render_jobs"."lease_token" IS NOT NULL AND "render_jobs"."lease_expires_at" IS NOT NULL) OR ("render_jobs"."status" <> 'running' AND "render_jobs"."lease_token" IS NULL AND "render_jobs"."lease_expires_at" IS NULL));