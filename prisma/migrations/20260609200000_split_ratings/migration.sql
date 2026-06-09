-- CreateTable: quality_ratings
CREATE TABLE "quality_ratings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "software_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quality_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: performance_ratings
CREATE TABLE "performance_ratings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "software_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hardware_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "performance_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quality_ratings_software_id_user_id_key" ON "quality_ratings"("software_id", "user_id");
CREATE INDEX "quality_ratings_software_id_score_idx" ON "quality_ratings"("software_id", "score");
CREATE INDEX "quality_ratings_created_at_idx" ON "quality_ratings"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "performance_ratings_software_id_user_id_hardware_id_key" ON "performance_ratings"("software_id", "user_id", "hardware_id");
CREATE INDEX "performance_ratings_software_id_idx" ON "performance_ratings"("software_id");
CREATE INDEX "performance_ratings_hardware_id_idx" ON "performance_ratings"("hardware_id");
CREATE INDEX "performance_ratings_created_at_idx" ON "performance_ratings"("created_at");

-- AddForeignKey
ALTER TABLE "quality_ratings"
    ADD CONSTRAINT "quality_ratings_software_id_fkey" FOREIGN KEY ("software_id") REFERENCES "software"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "quality_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_ratings"
    ADD CONSTRAINT "performance_ratings_software_id_fkey" FOREIGN KEY ("software_id") REFERENCES "software"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "performance_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "performance_ratings_hardware_id_fkey" FOREIGN KEY ("hardware_id") REFERENCES "hardware"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- MigrateData: rows with a non-null quality_score go to quality_ratings
INSERT INTO "quality_ratings" ("software_id", "user_id", "score", "comment", "created_at", "updated_at")
SELECT "software_id", "user_id", "quality_score", "comment", "created_at", CURRENT_TIMESTAMP
FROM "ratings"
WHERE "quality_score" IS NOT NULL;

-- MigrateData: rows with non-null performance_score and hardware_id go to performance_ratings
INSERT INTO "performance_ratings" ("software_id", "user_id", "hardware_id", "score", "comment", "created_at", "updated_at")
SELECT "software_id", "user_id", "hardware_id", "performance_score", "comment", "created_at", CURRENT_TIMESTAMP
FROM "ratings"
WHERE "performance_score" IS NOT NULL AND "hardware_id" IS NOT NULL;

-- BackfillAvgQuality: recalculate from new quality_ratings table
UPDATE "software"
SET "avg_quality" = (
    SELECT AVG("score"::DOUBLE PRECISION)
    FROM "quality_ratings"
    WHERE "quality_ratings"."software_id" = "software"."id"
);

-- DropTable
DROP TABLE "ratings";
