-- CreateTable
CREATE TABLE "transferSale" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "productNamesWithQuantity" JSONB NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "sellerRole" "SellerRole" NOT NULL,
    "buyerRole" "BuyerRole" NOT NULL,

    CONSTRAINT "transferSale_pkey" PRIMARY KEY ("id")
);
