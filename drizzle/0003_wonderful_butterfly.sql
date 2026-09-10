CREATE INDEX "course_modules_course_id_idx" ON "course_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lessons_module_id_idx" ON "lessons" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "enrollments_user_id_idx" ON "enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "enrollments_course_id_idx" ON "enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_user_id_idx" ON "lesson_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_lesson_id_idx" ON "lesson_progress" USING btree ("lesson_id");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_level_check" CHECK ("courses"."level" IN ('beginner', 'intermediate', 'advanced'));--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_duration_check" CHECK ("courses"."duration_minutes" >= 0);--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_position_check" CHECK ("course_modules"."position" >= 0);--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_position_check" CHECK ("lessons"."position" >= 0);--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_duration_check" CHECK ("lessons"."duration_minutes" >= 0);--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_status_check" CHECK ("enrollments"."status" IN ('active', 'completed', 'cancelled'));--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_percent_check" CHECK ("lesson_progress"."progress_percent" >= 0 AND "lesson_progress"."progress_percent" <= 100);