/*
  Warnings:

  - The `audioTracks` column on the `Band` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Band" DROP COLUMN "audioTracks",
ADD COLUMN     "audioTracks" JSONB;
