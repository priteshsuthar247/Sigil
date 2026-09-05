ALTER TABLE "clients" DROP CONSTRAINT "clients_email_key";--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "user_id" uuid;--> statement-breakpoint
UPDATE "clients" SET "user_id" = (SELECT id FROM "users" LIMIT 1) WHERE "user_id" IS NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;