-- CreateEnum
CREATE TYPE "Category" AS ENUM ('EMULATOR', 'FRONTEND', 'OPERATING_SYSTEM', 'COMPATIBILITY_LAYER', 'UTILITY', 'SCRAPER', 'SHADER', 'COMPANION_APP', 'INPUT_CONTROLLERS', 'STREAMING');

-- CreateEnum
CREATE TYPE "SoftwareStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "SystemType" AS ENUM ('HOME', 'HANDHELD', 'ARCADE', 'COMPUTER', 'OTHER');

-- CreateEnum
CREATE TYPE "PlatformGroup" AS ENUM ('WINDOWS', 'MACOS', 'LINUX', 'MOBILE', 'OTHER');

-- CreateEnum
CREATE TYPE "HardwareType" AS ENUM ('HANDHELD', 'SBC', 'MODDED_CONSOLE', 'DESKTOP_ARCHITECTURE');

-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('NEW_LISTING', 'EDIT', 'NEW_HARDWARE', 'NEW_TAG');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('LISTING', 'EDIT', 'RATING', 'COMMENT', 'TAG');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UPHELD', 'DISMISSED');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "username" TEXT,
    "is_moderator" BOOLEAN NOT NULL DEFAULT false,
    "report_credibility" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "reports_filed_today" INTEGER NOT NULL DEFAULT 0,
    "complaint_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "software" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "Category" NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "website_url" TEXT,
    "download_url" TEXT,
    "source_url" TEXT,
    "status" "SoftwareStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "submitted_by" UUID,

    CONSTRAINT "software_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "systems" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "type" "SystemType" NOT NULL,

    CONSTRAINT "systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "group" "PlatformGroup" NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hardware" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "type" "HardwareType" NOT NULL,
    "primary_platform_id" UUID,

    CONSTRAINT "hardware_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "submitted_by" UUID,
    "reviewed_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "software_systems" (
    "software_id" UUID NOT NULL,
    "system_id" UUID NOT NULL,

    CONSTRAINT "software_systems_pkey" PRIMARY KEY ("software_id","system_id")
);

-- CreateTable
CREATE TABLE "software_platforms" (
    "software_id" UUID NOT NULL,
    "platform_id" UUID NOT NULL,

    CONSTRAINT "software_platforms_pkey" PRIMARY KEY ("software_id","platform_id")
);

-- CreateTable
CREATE TABLE "software_hardware" (
    "software_id" UUID NOT NULL,
    "hardware_id" UUID NOT NULL,

    CONSTRAINT "software_hardware_pkey" PRIMARY KEY ("software_id","hardware_id")
);

-- CreateTable
CREATE TABLE "software_tags" (
    "software_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "software_tags_pkey" PRIMARY KEY ("software_id","tag_id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "software_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hardware_id" UUID,
    "quality_score" INTEGER,
    "performance_score" INTEGER,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "SubmissionType" NOT NULL,
    "submitted_by" UUID NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "target_id" UUID,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reporter_id" UUID NOT NULL,
    "target_type" "ReportTargetType" NOT NULL,
    "target_id" UUID,
    "reported_user_id" UUID,
    "credibility_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "comment" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "upheld_at" TIMESTAMP(3),
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- AddForeignKey
ALTER TABLE "software" ADD CONSTRAINT "software_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hardware" ADD CONSTRAINT "hardware_primary_platform_id_fkey" FOREIGN KEY ("primary_platform_id") REFERENCES "platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_systems" ADD CONSTRAINT "software_systems_software_id_fkey" FOREIGN KEY ("software_id") REFERENCES "software"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_systems" ADD CONSTRAINT "software_systems_system_id_fkey" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_platforms" ADD CONSTRAINT "software_platforms_software_id_fkey" FOREIGN KEY ("software_id") REFERENCES "software"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_platforms" ADD CONSTRAINT "software_platforms_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_hardware" ADD CONSTRAINT "software_hardware_software_id_fkey" FOREIGN KEY ("software_id") REFERENCES "software"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_hardware" ADD CONSTRAINT "software_hardware_hardware_id_fkey" FOREIGN KEY ("hardware_id") REFERENCES "hardware"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_tags" ADD CONSTRAINT "software_tags_software_id_fkey" FOREIGN KEY ("software_id") REFERENCES "software"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "software_tags" ADD CONSTRAINT "software_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_software_id_fkey" FOREIGN KEY ("software_id") REFERENCES "software"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_hardware_id_fkey" FOREIGN KEY ("hardware_id") REFERENCES "hardware"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
