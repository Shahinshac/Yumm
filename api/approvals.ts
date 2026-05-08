import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: Fetch all pending owners and partners
  if (req.method === 'GET') {
    try {
      const [owners, partners] = await Promise.all([
        prisma.pendingOwner.findMany({ orderBy: { registeredAt: 'desc' } }),
        prisma.pendingPartner.findMany({ orderBy: { registeredAt: 'desc' } }),
      ]);
      return res.status(200).json({ owners, partners });
    } catch (err: any) {
      console.error('Failed to fetch approvals:', err);
      return res.status(500).json({ error: 'Failed to fetch approvals', detail: err.message });
    }
  }

  // PATCH: Update status of an owner or partner
  if (req.method === 'PATCH') {
    const { id, type, status } = req.body;

    if (!id || !type || !status) {
      return res.status(400).json({ error: 'Missing id, type, or status' });
    }

    try {
      if (type === 'owner') {
        const updated = await prisma.pendingOwner.update({
          where: { id },
          data: { status },
        });
        return res.status(200).json(updated);
      }

      if (type === 'partner') {
        const updated = await prisma.pendingPartner.update({
          where: { id },
          data: { status },
        });
        return res.status(200).json(updated);
      }

      return res.status(400).json({ error: 'Invalid type' });
    } catch (err: any) {
      console.error('Failed to update approval:', err);
      return res.status(500).json({ error: 'Failed to update approval status', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
