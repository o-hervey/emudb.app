/*
  Warnings:

  - The values [SCRAPER] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('EMULATOR', 'FRONTEND', 'OPERATING_SYSTEM', 'COMPATIBILITY_LAYER', 'ROM_MANAGER', 'MEDIA_SCRAPER', 'GAME_STATE_TOOL', 'STREAMING', 'NETPLAY', 'INPUT_CONTROLLERS', 'SHADER', 'COMPANION_APP', 'UTILITY');
ALTER TABLE "software" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "public"."Category_old";
COMMIT;

-- AlterEnum
ALTER TYPE "HardwareType" ADD VALUE 'FPGA';

-- AlterEnum
ALTER TYPE "PlatformGroup" ADD VALUE 'CONSOLE';

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_super_admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "hardware_platforms" (
    "hardware_id" UUID NOT NULL,
    "platform_id" UUID NOT NULL,

    CONSTRAINT "hardware_platforms_pkey" PRIMARY KEY ("hardware_id","platform_id")
);

-- CreateTable
CREATE TABLE "UserList" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "cloned_from" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserListEntry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "list_id" UUID NOT NULL,
    "software_id" UUID NOT NULL,
    "hardware_id" UUID,
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserListEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserListSave" (
    "user_id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserListSave_pkey" PRIMARY KEY ("user_id","list_id")
);

-- AddForeignKey
ALTER TABLE "hardware_platforms" ADD CONSTRAINT "hardware_platforms_hardware_id_fkey" FOREIGN KEY ("hardware_id") REFERENCES "hardware"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hardware_platforms" ADD CONSTRAINT "hardware_platforms_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_cloned_from_fkey" FOREIGN KEY ("cloned_from") REFERENCES "UserList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListEntry" ADD CONSTRAINT "UserListEntry_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "UserList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListEntry" ADD CONSTRAINT "UserListEntry_software_id_fkey" FOREIGN KEY ("software_id") REFERENCES "software"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListEntry" ADD CONSTRAINT "UserListEntry_hardware_id_fkey" FOREIGN KEY ("hardware_id") REFERENCES "hardware"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListSave" ADD CONSTRAINT "UserListSave_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListSave" ADD CONSTRAINT "UserListSave_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "UserList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
