// pages/api/users1.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // GET request - fetch user by phone number
    if (req.method === "GET") {
      const { phoneNumber } = req.query;

      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      try {
        const user = await prisma.user.findUnique({
          where: {
            phoneNumber: phoneNumber as string,
          },
        });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
    
    // POST request - create new user
    else if (req.method === "POST") {
      const { 
        name, 
        phoneNumber, 
        buyerRole, 
        email, 
        gstNumber, 
        adharNumber, 
        panNumber,
        sellingBalance
      } = req.body;

      // Validate required fields
      if (!name || !phoneNumber || !buyerRole || !email) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      try {
        // Check if user with phone number already exists
        const existingUser = await prisma.user.findUnique({
          where: { phoneNumber },
        });

        if (existingUser) {
          return res.status(409).json({ message: "User with this phone number already exists" });
        }

        // Create new user
        const user = await prisma.user.create({
          data: {
            name,
            phoneNumber,
            buyerRole,
            email,
            gstNumber,
            adharNumber,
            panNumber,
            sellingBalance,
            totalReward: 0
          },
        });

        return res.status(201).json(user);
      } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    } 
    
    else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } finally {
    await prisma.$disconnect();
  }
}