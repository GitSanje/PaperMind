-- CreateEnum
CREATE TYPE "RoleUser" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "RoleUser" NOT NULL DEFAULT 'user';
