/*
  Warnings:

  - You are about to drop the column `sieze` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "sieze",
ADD COLUMN     "size" TEXT;
