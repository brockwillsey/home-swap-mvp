import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Xm6HwYhG9VlK@ep-autumn-violet-ahqiog8r-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function main() {
  const tokens = await db.verificationToken.findMany();
  console.log('Tokens:', JSON.stringify(tokens, null, 2));
  await db.$disconnect();
}

main();
