import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: Fetch all active restaurants
  if (req.method === 'GET') {
    try {
      const restaurants = await prisma.restaurant.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
      });
      // Parse menu JSON for each restaurant
      const parsed = restaurants.map(r => ({
        ...r,
        menu: typeof r.menu === 'string' ? JSON.parse(r.menu as string) : r.menu,
      }));
      return res.status(200).json(parsed);
    } catch (err: any) {
      console.error('Failed to fetch restaurants:', err);
      return res.status(500).json({ error: 'Failed to fetch restaurants', detail: err.message });
    }
  }

  // POST: Create a new restaurant (called when admin approves an owner)
  if (req.method === 'POST') {
    try {
      const { id, ownerId, name, cuisine, rating, reviewCount, deliveryTime, deliveryFee, imageUrl, menu, status } = req.body;
      const restaurant = await prisma.restaurant.create({
        data: {
          id,
          ownerId: ownerId || null,
          name,
          cuisine: cuisine || 'Multi-cuisine',
          rating: rating || 4.5,
          reviewCount: reviewCount || 0,
          deliveryTime: deliveryTime || '25-35 min',
          deliveryFee: deliveryFee || 'Free',
          imageUrl: imageUrl || '',
          menu: JSON.stringify(menu || []),
          status: status || 'active',
        },
      });
      return res.status(201).json(restaurant);
    } catch (err: any) {
      console.error('Failed to create restaurant:', err);
      return res.status(500).json({ error: 'Failed to create restaurant', detail: err.message });
    }
  }

  // PATCH: Update restaurant (menu items, status, etc.)
  if (req.method === 'PATCH') {
    try {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing restaurant id' });
      
      // If menu is being updated, stringify it
      if (updates.menu) {
        updates.menu = JSON.stringify(updates.menu);
      }

      const restaurant = await prisma.restaurant.update({
        where: { id },
        data: updates,
      });
      return res.status(200).json(restaurant);
    } catch (err: any) {
      console.error('Failed to update restaurant:', err);
      return res.status(500).json({ error: 'Failed to update restaurant', detail: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
