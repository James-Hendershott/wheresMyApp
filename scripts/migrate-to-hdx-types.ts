// WHY: Update existing containers to use new HDX tote types
// WHAT: Links existing containers to proper HDX tote types based on their size
// HOW: Updates containerTypeId for existing containers

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateToHDXTypes() {
  console.log("🔄 Migrating Existing Containers to HDX Types...\n");

  try {
    // Get all container types
    const allTypes = await prisma.containerType.findMany();
    
    console.log("📦 Current Container Types:");
    allTypes.forEach(t => {
      console.log(`  - ${t.name} (${t.codePrefix})`);
    });
    console.log();

    // Find the old "27 Gallon Tote" and new "27 Gallon HDX Tote"
    const oldType = await prisma.containerType.findFirst({
      where: { name: "27 Gallon Tote" },
      include: { containers: true },
    });

    const newType = await prisma.containerType.findFirst({
      where: { name: "27 Gallon HDX Tote" },
    });

    if (!oldType || !newType) {
      console.log("⚠️  Old or new type not found. Types available:");
      allTypes.forEach(t => console.log(`   - ${t.name}`));
      return;
    }

    console.log(`📋 Found ${oldType.containers.length} containers to migrate`);
    console.log(`   From: ${oldType.name}`);
    console.log(`   To: ${newType.name}\n`);

    if (oldType.containers.length > 0) {
      // Update all containers to use new HDX type
      const updateResult = await prisma.container.updateMany({
        where: { containerTypeId: oldType.id },
        data: { containerTypeId: newType.id },
      });

      console.log(`✅ Migrated ${updateResult.count} containers to ${newType.name}\n`);

      // Delete the old type
      await prisma.containerType.delete({
        where: { id: oldType.id },
      });

      console.log(`🗑️  Deleted old type: ${oldType.name}\n`);
    }

    // Show final summary
    const hdxTypes = await prisma.containerType.findMany({
      where: {
        name: {
          contains: "HDX",
        },
      },
      include: {
        _count: {
          select: { containers: true },
        },
      },
      orderBy: { name: "asc" },
    });

    console.log("📊 Final HDX Tote Summary:");
    hdxTypes.forEach((type) => {
      console.log(
        `  ${type.name}: ${type.codePrefix} - ${type._count.containers} containers`
      );
    });

  } catch (error) {
    console.error("❌ Error migrating to HDX types:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateToHDXTypes();
