// /api/checkproduct.ts (or .js)
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { productName } = req.body;

    if (!productName) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    // Check if a product with the given name already exists
    const existingProduct = await prisma.products.findUnique({
      where: {
        productName: productName,
      },
    });

    return res.status(200).json({
      exists: !!existingProduct,
    });
  } catch (error) {
    console.error('Error checking product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}