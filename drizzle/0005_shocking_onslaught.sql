ALTER TABLE "profiles" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "education_level" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "school_or_college" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "parent_guardian_name" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "parent_guardian_contact" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "parent_consent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "profile_completed" boolean DEFAULT false NOT NULL;