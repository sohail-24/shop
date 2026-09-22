CREATE TABLE IF NOT EXISTS "product_images" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"productId" bigint,
	"filename" varchar(255) NOT NULL,
	"mimeType" varchar(100) NOT NULL,
	"data" bytea NOT NULL,
	"size" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_images_filename_idx" ON "product_images" USING btree ("filename");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_images_product_idx" ON "product_images" USING btree ("productId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
