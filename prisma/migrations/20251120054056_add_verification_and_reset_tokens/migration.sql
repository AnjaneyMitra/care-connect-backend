/*
  Warnings:

  - You are about to drop the column `reset_password_expires` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "reset_password_expires",
ADD COLUMN     "reset_password_token_expires" TIMESTAMPTZ(6),
ADD COLUMN     "verification_token_expires" TIMESTAMPTZ(6);
