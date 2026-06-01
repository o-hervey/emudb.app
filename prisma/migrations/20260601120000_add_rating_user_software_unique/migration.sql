-- Keep the newest rating if concurrent requests previously created duplicates.
DELETE FROM "ratings"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      row_number() OVER (
        PARTITION BY "software_id", "user_id"
        ORDER BY "created_at" DESC, "id" DESC
      ) AS "row_number"
    FROM "ratings"
  ) ranked
  WHERE ranked."row_number" > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "ratings_software_id_user_id_key" ON "ratings"("software_id", "user_id");
