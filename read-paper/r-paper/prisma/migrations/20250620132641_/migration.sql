/*
  Warnings:

  - Added the required column `userId` to the `NotionPageDB` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotionPageDB" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "NotionPageDB" ADD CONSTRAINT "NotionPageDB_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
