// pages/api/transfer-sale.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, SellerRole, BuyerRole } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { sellerId, buyerId, productNamesWithQuantity, totalPrice, sellerRole, buyerRole } = req.body as {
    sellerId: number;
    buyerId: number;
    productNamesWithQuantity: { [key: string]: number };
    totalPrice: number;
    sellerRole: string;
    buyerRole: string;
  };

  if (!sellerId || !buyerId || !productNamesWithQuantity || !totalPrice || !sellerRole || !buyerRole) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Get the seller and buyer data
    const seller = await prisma.user.findUnique({
      where: { id: sellerId }
    });

    const buyer = await prisma.user.findUnique({
      where: { id: buyerId }
    });

    if (!seller || !buyer) {
      return res.status(404).json({ message: "Seller or buyer not found" });
    }

    // Check if seller has enough inventory
    const sellerBalance: { [key: string]: number } = (seller.sellingBalance as { [key: string]: number }) || {};
    
    // Check stock for each product
    for (const [productName, quantity] of Object.entries(productNamesWithQuantity)) {
      const availableStock = sellerBalance[productName] || 0;
      if (availableStock < quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${productName}. Available: ${availableStock}, Requested: ${quantity}` 
        });
      }
    }

    // Fetch products data to calculate rewards
    const productNames = Object.keys(productNamesWithQuantity);
    const productData = await prisma.products.findMany({
      where: {
        productName: {
          in: productNames
        }
      }
    });

    // Calculate reward based on seller role
    let rewardPoints = 0;
    for (const product of productData) {
      const quantity = productNamesWithQuantity[product.productName];
      
      if (sellerRole === "p1") {
        rewardPoints += product.p1Reward * quantity;
      } else if (sellerRole === "p2") {
        rewardPoints += product.p2Reward * quantity;
      }
    }

    // Transaction to ensure all operations complete together
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Create transfer sale record
      const sale = await prisma.transferSale.create({
        data: {
          sellerId,
          buyerId,
          productNamesWithQuantity,
          totalPrice,
          sellerRole: sellerRole as SellerRole,
          buyerRole: buyerRole as BuyerRole
        }
      });

      // 2. Update seller's selling balance (reduce stock)
      const updatedSellerBalance = { ...sellerBalance };
      for (const [productName, quantity] of Object.entries(productNamesWithQuantity)) {
        updatedSellerBalance[productName] = (updatedSellerBalance[productName] || 0) - quantity;
        
        // Remove product from balance if quantity becomes 0
        if (updatedSellerBalance[productName] <= 0) {
          delete updatedSellerBalance[productName];
        }
      }

      await prisma.user.update({
        where: { id: sellerId },
        data: {
          sellingBalance: updatedSellerBalance,
          totalReward: {
            increment: rewardPoints
          }
        }
      });

      // 3. Update buyer's selling balance (increase stock)
      const buyerBalance = (buyer.sellingBalance as { [key: string]: number }) || {};
      const updatedBuyerBalance = { ...buyerBalance };
      
      for (const [productName, quantity] of Object.entries(productNamesWithQuantity)) {
        updatedBuyerBalance[productName] = (updatedBuyerBalance[productName] || 0) + quantity;
      }

      await prisma.user.update({
        where: { id: buyerId },
        data: {
          sellingBalance: updatedBuyerBalance
        }
      });

      return { sale, rewardPoints };
    });

    return res.status(200).json({ 
      success: true, 
      sale: result.sale,
      rewardPoints: result.rewardPoints
    });
  } catch (error) {
    console.error("Error creating transfer sale:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}