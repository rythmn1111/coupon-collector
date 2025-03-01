// pages/api/admin-sales.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Get all admin sales records
      const salesData = await prisma.adminSales.findMany({
        orderBy: {
          id: 'desc', // Most recent sales first
        },
      });
      
      // Collect all buyer IDs to fetch their names
      const buyerIds = salesData.map(sale => sale.buyerId);
      
      // Get user information for all buyers
      const users = await prisma.user.findMany({
        where: {
          id: {
            in: buyerIds,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      
      // Create a map of user IDs to user names for quicker lookup
      const userMap = users.reduce((map, user) => {
        map[user.id] = user.name;
        return map;
      }, {} as Record<number, string>);
      
      // Add user names to the sales data
      const enrichedSalesData = salesData.map(sale => ({
        ...sale,
        buyerName: userMap[sale.buyerId] || 'Unknown User',
      }));
      
      return res.status(200).json(enrichedSalesData);
    } catch (error) {
      console.error('Error fetching admin sales:', error);
      return res.status(500).json({ error: 'Failed to fetch sales data' });
    }
  } else if (req.method === 'POST') {
    // Handle POST request (existing implementation from your code)
    // ...
    
    return res.status(405).json({ error: 'Method not allowed' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}