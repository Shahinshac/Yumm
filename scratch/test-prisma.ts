import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const orders = await prisma.order.findMany();
    console.log('Orders found:', orders.length);
    process.exit(0);
  } catch (err) {
    console.error('Prisma connection failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
