CREATE TABLE "scans" (
	"address" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"trust_score" integer NOT NULL,
	"risk_level" text NOT NULL,
	"verdict" text NOT NULL,
	"findings" text[] DEFAULT '{}',
	"scan_data" jsonb,
	"scanned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallet_profiles" (
	"address" text PRIMARY KEY NOT NULL,
	"first_tx_timestamp" timestamp,
	"tx_count" integer DEFAULT 0,
	"funder_type" text DEFAULT 'unknown',
	"reputation_flags" text[] DEFAULT '{}',
	"launches" integer DEFAULT 0,
	"dead_under_10m" integer DEFAULT 0,
	"avg_extraction_sol" numeric DEFAULT '0',
	"funded_snipers" integer DEFAULT 0,
	"trust" numeric DEFAULT '1.0',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallet_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" text,
	"nonce" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"tg_chat_id" text,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "wallet_sessions" ADD CONSTRAINT "wallet_sessions_address_wallet_profiles_address_fk" FOREIGN KEY ("address") REFERENCES "public"."wallet_profiles"("address") ON DELETE no action ON UPDATE no action;