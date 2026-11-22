CREATE TYPE "public"."guardian_role" AS ENUM('owner');--> statement-breakpoint
CREATE TYPE "public"."household_plan" AS ENUM('free', 'full');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"target" text,
	"detail" jsonb,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"label" text NOT NULL,
	"token_hash" text NOT NULL,
	"authorised_by" uuid,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardian" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"auth_uid" text NOT NULL,
	"email" text NOT NULL,
	"role" "guardian_role" DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "household" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"timezone" text DEFAULT 'Europe/London' NOT NULL,
	"plan" "household_plan" DEFAULT 'free' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kid" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"nickname" text NOT NULL,
	"avatar" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"birth_year" integer,
	"pin_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kid_nickname_length" CHECK (char_length("kid"."nickname") between 1 and 24),
	CONSTRAINT "kid_birth_year_range" CHECK ("kid"."birth_year" is null or "kid"."birth_year" between 2000 and 2100)
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device" ADD CONSTRAINT "device_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device" ADD CONSTRAINT "device_authorised_by_guardian_id_fk" FOREIGN KEY ("authorised_by") REFERENCES "public"."guardian"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guardian" ADD CONSTRAINT "guardian_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kid" ADD CONSTRAINT "kid_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_household_at_idx" ON "audit_log" USING btree ("household_id","at");--> statement-breakpoint
CREATE UNIQUE INDEX "device_token_hash_idx" ON "device" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "device_household_idx" ON "device" USING btree ("household_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guardian_auth_uid_idx" ON "guardian" USING btree ("auth_uid");--> statement-breakpoint
CREATE INDEX "guardian_household_idx" ON "guardian" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "kid_household_idx" ON "kid" USING btree ("household_id");