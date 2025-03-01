/*
  Warnings:

  - Added the required column `p1Reward` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `p2Reward` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `p3Reward` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "p1Reward" INTEGER NOT NULL,
ADD COLUMN     "p2Reward" INTEGER NOT NULL,
ADD COLUMN     "p3Reward" INTEGER NOT NULL;
