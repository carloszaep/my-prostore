-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "guestId" UUID;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "GuestUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
