// pages/api/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, phoneNumber, gstNumber, aadharCard, panCard } = req.body;

    // Validate required fields
    if (!name || !phoneNumber) {
      return res.status(400).json({ message: 'Name and phone number are required' });
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email: email || '',
        phoneNumber,
        gstNumber: gstNumber || null,
        adharNumber: aadharCard || null,
        panNumber: panCard || null,
        buyerRole: 'p1', // Default role for new users
        totalReward: 0,
      },
    });

    return res.status(201).json({ 
      message: 'User created successfully', 
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber
      } 
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ 
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}