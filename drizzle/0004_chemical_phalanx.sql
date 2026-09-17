ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_status_check";--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "end_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "approved_by" uuid;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "expired_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enrollments_status_idx" ON "enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enrollments_approved_by_idx" ON "enrollments" USING btree ("approved_by");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_date_range_check" CHECK ("courses"."start_at" IS NULL OR "courses"."end_at" IS NULL OR "courses"."end_at" > "courses"."start_at");--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_status_check" CHECK ("enrollments"."status" IN ('pending', 'active', 'completed', 'expired', 'cancelled'));