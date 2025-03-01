// pages/api/users/check.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { phoneNumber } = req.query;
      
      if (!phoneNumber || typeof phoneNumber !== 'string') {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      
      const user = await prisma.user.findUnique({
        where: { phoneNumber }
      });
      
      if (user) {
        return res.status(200).json({ exists: true, userId: user.id });
      } else {
        return res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error('Error checking user:', error);
      return res.status(500).json({ message: 'Failed to check user', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}