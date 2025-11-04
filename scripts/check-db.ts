import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('📊 Checking database contents...\n');
  
  const containerCount = await prisma.container.count();
  const itemCount = await prisma.item.count();
  const photoCount = await prisma.itemPhoto.count();
  
  console.log(`📦 Containers: ${containerCount}`);
  console.log(`📝 Items: ${itemCount}`);
  console.log(`📷 Photos: ${photoCount}\n`);
  
  // Get all containers with their item counts
  const containers = await prisma.container.findMany({
    include: {
      _count: {
        select: { items: true }
      }
    },
    orderBy: { code: 'asc' }
  });
  
  console.log('Container Details:');
  console.log('─'.repeat(60));
  
  for (const container of containers) {
    console.log(`${container.code.padEnd(15)} | ${container.label.padEnd(25)} | ${container._count.items} items`);
  }
  
  await prisma.$disconnect();
}

checkDatabase().catch(console.error);
