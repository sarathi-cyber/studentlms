CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"instructions" text,
	"duration_minutes" integer DEFAULT 0 NOT NULL,
	"pass_percentage" integer DEFAULT 50 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessments_duration_check" CHECK ("assessments"."duration_minutes" >= 0),
	CONSTRAINT "assessments_pass_percentage_check" CHECK ("assessments"."pass_percentage" >= 0 AND "assessments"."pass_percentage" <= 100)
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"question_type" text DEFAULT 'mcq' NOT NULL,
	"marks" integer DEFAULT 1 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_questions_position_check" CHECK ("assessment_questions"."position" >= 0),
	CONSTRAINT "assessment_questions_marks_check" CHECK ("assessment_questions"."marks" > 0),
	CONSTRAINT "assessment_questions_type_check" CHECK ("assessment_questions"."question_type" IN ('mcq'))
);
--> statement-breakpoint
CREATE TABLE "assessment_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_options_position_check" CHECK ("assessment_options"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "assessment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"score" integer DEFAULT 0 NOT NULL,
	"percentage" integer DEFAULT 0 NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "assessment_attempts_number_check" CHECK ("assessment_attempts"."attempt_number" > 0),
	CONSTRAINT "assessment_attempts_score_check" CHECK ("assessment_attempts"."score" >= 0),
	CONSTRAINT "assessment_attempts_percentage_check" CHECK ("assessment_attempts"."percentage" >= 0 AND "assessment_attempts"."percentage" <= 100)
);
--> statement-breakpoint
CREATE TABLE "assessment_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid,
	"awarded_marks" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_options" ADD CONSTRAINT "assessment_options_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_selected_option_id_assessment_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."assessment_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assessments_course_id_idx" ON "assessments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "assessment_questions_assessment_id_idx" ON "assessment_questions" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "assessment_options_question_id_idx" ON "assessment_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "assessment_attempts_assessment_id_idx" ON "assessment_attempts" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "assessment_attempts_user_id_idx" ON "assessment_attempts" USING btree ("user_id");