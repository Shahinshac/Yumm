import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { type, ...data } = req.body;

  if (type === 'owner') {
    const app = await prisma.pendingOwner.create({ data });
    return res.status(201).json(app);
  }

  if (type === 'partner') {
    const app = await prisma.pendingPartner.create({ data });
    return res.status(201).json(app);
  }

  return res.status(400).json({ error: 'Invalid registration type' });
}
