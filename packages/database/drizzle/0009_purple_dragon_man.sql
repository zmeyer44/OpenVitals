CREATE TABLE "flagged_extractions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_job_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"analyte" text NOT NULL,
	"value_numeric" real,
	"value_text" text,
	"unit" varchar(50),
	"reference_range_low" real,
	"reference_range_high" real,
	"reference_range_text" text,
	"is_abnormal" boolean,
	"observed_at" date,
	"flag_reason" text NOT NULL,
	"flag_details" text,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_metric_code" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "ai_model" SET DEFAULT 'claude-sonnet-4';--> statement-breakpoint
ALTER TABLE "flagged_extractions" ADD CONSTRAINT "flagged_extractions_import_job_id_import_jobs_id_fk" FOREIGN KEY ("import_job_id") REFERENCES "public"."import_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flagged_extractions" ADD CONSTRAINT "flagged_extractions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flagged_extractions" ADD CONSTRAINT "flagged_extractions_resolved_metric_code_metric_definitions_id_fk" FOREIGN KEY ("resolved_metric_code") REFERENCES "public"."metric_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_flagged_import_job" ON "flagged_extractions" USING btree ("import_job_id");