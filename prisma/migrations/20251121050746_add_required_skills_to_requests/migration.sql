-- AlterTable
ALTER TABLE "service_requests" ADD COLUMN     "required_skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
