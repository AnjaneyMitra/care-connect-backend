-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "request_id" UUID;

-- AlterTable
ALTER TABLE "service_requests" ADD COLUMN     "required_skills" TEXT[];

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
