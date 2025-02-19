/*
  Warnings:

  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gstNumber" VARCHAR(15),
ADD COLUMN     "phoneNumber" VARCHAR(10) NOT NULL;
