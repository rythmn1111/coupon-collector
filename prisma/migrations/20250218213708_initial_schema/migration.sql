/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `buyerRole` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BuyerRole" AS ENUM ('p1', 'p2', 'p3');

-- CreateEnum
CREATE TYPE "SellerRole" AS ENUM ('admin', 'p1', 'p2', 'p3');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "updatedAt",
ADD COLUMN     "buyerRole" "BuyerRole" NOT NULL,
ADD COLUMN     "total_reward" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Sales" (
    "id" INTEGER NOT NULL,
    "product_names_with_quantity" JSONB NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "sellerRole" "SellerRole" NOT NULL,
    "sellerId" INTEGER NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSellingBalance" (
    "id" INTEGER NOT NULL,
    "stock" JSONB NOT NULL,

    CONSTRAINT "UserSellingBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Products_product_name_key" ON "Products"("product_name");

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSellingBalance" ADD CONSTRAINT "UserSellingBalance_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
