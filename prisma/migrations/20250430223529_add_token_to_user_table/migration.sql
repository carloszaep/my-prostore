/*
  Warnings:

  - You are about to drop the column `resetToken` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "resetToken";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT;
