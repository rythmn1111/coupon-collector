// pages/api/admin-sales.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { buyerPhoneNumber, buyerId, productNamesWithQuantity, totalPrice } = req.body;
      
      // 1. Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: buyerId }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // 2. Create the sale record
      const sale = await prisma.adminSales.create({
        data: {
          buyerPhoneNumber,
          buyerId,
          productNamesWithQuantity,
          totalPrice,
          buyerRole: 'p1' // Default to p1 as specified
        }
      });
      
      // 3. Update user's selling balance
      const currentSellingBalance = user.sellingBalance as Record<string, number> || {};
      
      // Process each product in the order
      Object.entries(productNamesWithQuantity).forEach(([productName, quantity]) => {
        if (currentSellingBalance[productName]) {
          // If product already exists in selling balance, add to it
          currentSellingBalance[productName] += quantity as number;
        } else {
          // If product doesn't exist yet, create it
          currentSellingBalance[productName] = quantity as number;
        }
      });
      
      // Update the user with the new selling balance
      await prisma.user.update({
        where: { id: buyerId },
        data: { sellingBalance: currentSellingBalance }
      });
      
      return res.status(201).json({ 
        message: 'Sale created successfully', 
        saleId: sale.id 
      });
    } catch (error) {
      console.error('Error creating sale:', error);
      return res.status(500).json({ message: 'Failed to create sale', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}