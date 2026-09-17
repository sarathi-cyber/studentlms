ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_user_course_unique";--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "termination_reason" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "re_enrollment_requested_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_active_user_course_unique" ON "enrollments" USING btree ("user_id","course_id") WHERE "enrollments"."status" IN ('pending', 'active');