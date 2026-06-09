-- Add denormalized avg_quality to software for efficient top_rated sorting
ALTER TABLE "software" ADD COLUMN "avg_quality" DOUBLE PRECISION;

-- Backfill from existing ratings
UPDATE "software"
SET "avg_quality" = (
  SELECT AVG("quality_score")
  FROM "ratings"
  WHERE "ratings"."software_id" = "software"."id"
    AND "ratings"."quality_score" IS NOT NULL
);

-- Index for top_rated sort: approved rows sorted by avg_quality DESC, nulls last
CREATE INDEX "software_approved_avg_quality_idx"
  ON "software"("approved", "avg_quality" DESC NULLS LAST);

-- Fix software.updated_at: backfill nulls then make non-nullable
UPDATE "software" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;
ALTER TABLE "software" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "software" ALTER COLUMN "updated_at" SET NOT NULL;

-- Unique constraint on UserListEntry to prevent duplicate entries
ALTER TABLE "UserListEntry"
  ADD CONSTRAINT "UserListEntry_list_id_software_id_key"
  UNIQUE ("list_id", "software_id");
