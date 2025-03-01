// /api/products.ts (or .js)
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { productName, price, p1Reward, p2Reward, p3Reward } = req.body;

    // Validate required fields
    if (!productName) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }

    // Ensure rewards are integers
    const parsedP1Reward = parseInt(p1Reward, 10);
    const parsedP2Reward = parseInt(p2Reward, 10);
    const parsedP3Reward = parseInt(p3Reward, 10);

    if (isNaN(parsedP1Reward) || isNaN(parsedP2Reward) || isNaN(parsedP3Reward)) {
      return res.status(400).json({ message: 'Rewards must be valid integers' });
    }

    // Create the new product
    const newProduct = await prisma.products.create({
      data: {
        productName,
        price,
        p1Reward: parsedP1Reward,
        p2Reward: parsedP2Reward,
        p3Reward: parsedP3Reward,
      },
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Check for unique constraint violation
    if ((error as { code?: string }).code === 'P2002') {
      return res.status(409).json({ message: 'A product with this name already exists' });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}