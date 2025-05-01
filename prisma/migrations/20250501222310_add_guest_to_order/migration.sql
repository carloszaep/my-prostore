-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "guestId" UUID,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "GuestUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
