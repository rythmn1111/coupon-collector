/*
  Warnings:

  - You are about to drop the column `product_name` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `product_names_with_quantity` on the `Sales` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `Sales` table. All the data in the column will be lost.
  - You are about to drop the column `total_reward` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productName]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productName` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productNamesWithQuantity` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Products_product_name_key";

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "product_name",
ADD COLUMN     "productName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sales" DROP COLUMN "product_names_with_quantity",
DROP COLUMN "total_price",
ADD COLUMN     "productNamesWithQuantity" JSONB NOT NULL,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "total_reward",
ADD COLUMN     "totalReward" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Products_productName_key" ON "Products"("productName");
