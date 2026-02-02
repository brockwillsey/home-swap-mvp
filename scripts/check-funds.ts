import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Xm6HwYhG9VlK@ep-autumn-violet-ahqiog8r-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function main() {
  const funds = await db.fund.findMany({
    include: { creator: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
  console.log('Funds:', JSON.stringify(funds, null, 2));
  await db.$disconnect();
}

main();
