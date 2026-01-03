require('dotenv/config');

async function seed() {
  const { PrismaClient } = await import('../app/generated/prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { Pool } = await import('pg');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Create a simple product for testing
    await prisma.product.create({
      data: {
        name: "Test Product",
        company: "Test Company", 
        description: "Test description",
        featured: true,
        price: 1999,
        clerkId: process.env.ADMIN_USER_ID || "test-user"
      }
    });
    
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();