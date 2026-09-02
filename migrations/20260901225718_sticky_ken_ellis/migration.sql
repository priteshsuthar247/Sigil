ALTER TABLE "invoices" ADD COLUMN "number" integer NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "paid_at" timestamp;