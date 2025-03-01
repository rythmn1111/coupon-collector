// pages/api/bills.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sellerId } = req.query;
    
    if (!sellerId || Array.isArray(sellerId)) {
      return res.status(400).json({ message: 'Invalid seller ID' });
    }

    const sellerIdNumber = parseInt(sellerId, 10);
    
    if (isNaN(sellerIdNumber)) {
      return res.status(400).json({ message: 'Seller ID must be a number' });
    }

    // Query the transferSale table for records matching the seller ID
    const bills = await prisma.transferSale.findMany({
      where: {
        sellerId: sellerIdNumber,
      },
      orderBy: {
        id: 'desc', // Most recent bills first
      },
    });

    return res.status(200).json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}