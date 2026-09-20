CREATE TABLE "admin_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"manage_students" boolean DEFAULT false NOT NULL,
	"manage_courses" boolean DEFAULT false NOT NULL,
	"manage_lessons" boolean DEFAULT false NOT NULL,
	"manage_assignments" boolean DEFAULT false NOT NULL,
	"manage_assessments" boolean DEFAULT false NOT NULL,
	"manage_attendance" boolean DEFAULT false NOT NULL,
	"manage_support" boolean DEFAULT false NOT NULL,
	"manage_certificates" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_permissions_user_id_idx" ON "admin_permissions" USING btree ("user_id");