/*
  Warnings:

  - Added the required column `integrationId` to the `NotionPageDB` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotionPageDB" ADD COLUMN     "integrationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "NotionPageDB" ADD CONSTRAINT "NotionPageDB_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "NotionIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
