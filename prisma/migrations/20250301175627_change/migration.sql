/*
  Warnings:

  - You are about to drop the `Sales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSellingBalance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_id_fkey";

-- DropForeignKey
ALTER TABLE "UserSellingBalance" DROP CONSTRAINT "UserSellingBalance_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sellingBalance" JSONB;

-- DropTable
DROP TABLE "Sales";

-- DropTable
DROP TABLE "UserSellingBalance";

-- CreateTable
CREATE TABLE "adminSales" (
    "id" SERIAL NOT NULL,
    "buyerPhoneNumber" VARCHAR(10) NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "productNamesWithQuantity" JSONB NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "buyerRole" "BuyerRole" NOT NULL,

    CONSTRAINT "adminSales_pkey" PRIMARY KEY ("id")
);
