CREATE TABLE "lab_providers" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"website" text,
	"location_finder_url" text,
	"supports_walk_in" boolean DEFAULT true,
	"supports_insurance" boolean DEFAULT true,
	"supports_direct_access" boolean DEFAULT true,
	"price_range" varchar(20),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "panel_template_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"panel_id" varchar(50) NOT NULL,
	"metric_code" varchar(50) NOT NULL,
	"is_core" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "panel_template_metrics_panel_metric_uniq" UNIQUE("panel_id","metric_code")
);
--> statement-breakpoint
CREATE TABLE "panel_templates" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"estimated_cost_low" integer,
	"estimated_cost_high" integer,
	"target_sex" varchar(10),
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_retest_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"metric_code" varchar(50) NOT NULL,
	"retest_interval_days" integer NOT NULL,
	"is_paused" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_retest_settings_user_metric_uniq" UNIQUE("user_id","metric_code")
);
--> statement-breakpoint
ALTER TABLE "panel_template_metrics" ADD CONSTRAINT "panel_template_metrics_panel_id_panel_templates_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panel_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panel_template_metrics" ADD CONSTRAINT "panel_template_metrics_metric_code_metric_definitions_id_fk" FOREIGN KEY ("metric_code") REFERENCES "public"."metric_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_retest_settings" ADD CONSTRAINT "user_retest_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_retest_settings" ADD CONSTRAINT "user_retest_settings_metric_code_metric_definitions_id_fk" FOREIGN KEY ("metric_code") REFERENCES "public"."metric_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "panel_templates_category_idx" ON "panel_templates" USING btree ("category");