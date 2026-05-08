import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(orders);
  }

  if (req.method === 'POST') {
    const order = await prisma.order.create({
      data: req.body
    });
    return res.status(201).json(order);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
