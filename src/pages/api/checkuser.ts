import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req:NextApiRequest, res:NextApiResponse){
    if(req.method!== 'POST'){
        return res.status(405).json({message: 'Method not allowed'});
    }
    try{
        const {phoneNumber} = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {
              phoneNumber: phoneNumber
            }
          });
          // Return whether the phone number exists
    return res.status(200).json({ 
        exists: !!existingUser,
        userId: existingUser?.id || null
      });
      
    }catch (error) {
        console.error('Error checking phone number:', error);
        return res.status(500).json({ 
          message: 'Failed to check phone number',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        await prisma.$disconnect();
      }
}