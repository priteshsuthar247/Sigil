CREATE TABLE "company_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL UNIQUE,
	"company_name" text NOT NULL,
	"company_address" text NOT NULL,
	"company_email" text NOT NULL,
	"company_phone" text NOT NULL,
	"payment_terms" text NOT NULL,
	"gstin" text NOT NULL,
	"notes" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;