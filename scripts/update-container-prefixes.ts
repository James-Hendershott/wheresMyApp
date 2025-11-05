// WHY: Update container code prefixes to include size for better identification
// WHAT: Updates ContainerType.codePrefix from generic (TOTE) to size-specific (TOTE27)
// HOW: Updates container type records and regenerates container codes with new prefixes

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateContainerPrefixes() {
  console.log("🔄 Starting container prefix update...\n");

  try {
    // 1. Check current container types
    const types = await prisma.containerType.findMany({
      include: {
        containers: {
          select: {
            id: true,
            code: true,
            label: true,
          },
        },
      },
    });

    console.log("📦 Current Container Types:");
    types.forEach((type) => {
      console.log(`  - ${type.name}`);
      console.log(`    Current Prefix: ${type.codePrefix}`);
      console.log(`    Containers: ${type.containers.length}`);
      console.log();
    });

    // 2. Define new prefixes based on HDX tote sizing
    // HDX 27 Gallon Tote: Common tapered storage tote
    // HDX 17 Gallon Tote: Smaller tapered tote
    const prefixUpdates = [
      {
        oldName: "27 Gallon Tote",
        newPrefix: "TOTE27",
        description: "27 gallon HDX-style tapered tote",
      },
      {
        oldName: "17 Gallon Tote",
        newPrefix: "TOTE17",
        description: "17 gallon HDX-style tapered tote",
      },
      {
        oldName: "Storage Bin",
        newPrefix: "BIN",
        description: "Generic storage bin (update with size if known)",
      },
      {
        oldName: "Suitcase",
        newPrefix: "CASE",
        description: "Suitcase container",
      },
      {
        oldName: "Book Box",
        newPrefix: "BOOKBOX",
        description: "Book storage box",
      },
    ];

    // 3. Update container types
    console.log("✏️  Updating ContainerType prefixes...\n");
    for (const update of prefixUpdates) {
      const type = types.find((t) => t.name === update.oldName);
      if (type) {
        await prisma.containerType.update({
          where: { id: type.id },
          data: { codePrefix: update.newPrefix },
        });
        console.log(`  ✅ ${update.oldName}: ${type.codePrefix} → ${update.newPrefix}`);
      } else {
        console.log(`  ⚠️  ${update.oldName}: Not found, skipping`);
      }
    }

    // 4. Update container codes
    console.log("\n🏷️  Updating container codes...\n");
    const updatedTypes = await prisma.containerType.findMany({
      include: {
        containers: {
          orderBy: { number: "asc" },
        },
      },
    });

    for (const type of updatedTypes) {
      if (type.containers.length === 0) continue;

      console.log(`  ${type.name} (${type.codePrefix}):`);
      
      // First, assign numbers to containers that don't have them
      let nextNumber = 1;
      const existingNumbers = type.containers
        .filter(c => c.number !== null)
        .map(c => c.number);
      
      for (const container of type.containers) {
        if (container.number === null) {
          // Find next available number
          while (existingNumbers.includes(nextNumber)) {
            nextNumber++;
          }
          
          await prisma.container.update({
            where: { id: container.id },
            data: { number: nextNumber },
          });
          
          console.log(`    🔢 ${container.label}: Assigned number ${nextNumber}`);
          existingNumbers.push(nextNumber);
          container.number = nextNumber; // Update in memory
          nextNumber++;
        }
      }
      
      // Now update codes
      for (const container of type.containers) {
        const newCode = `${type.codePrefix}-${String(container.number).padStart(2, "0")}`;
        
        if (container.code !== newCode) {
          await prisma.container.update({
            where: { id: container.id },
            data: { code: newCode },
          });
          console.log(`    ✅ ${container.label}: ${container.code} → ${newCode}`);
        } else {
          console.log(`    ℹ️  ${container.label}: ${container.code} (no change)`);
        }
      }
      console.log();
    }

    console.log("✅ Container prefix update complete!\n");

    // 5. Summary
    const summary = await prisma.containerType.findMany({
      include: {
        _count: {
          select: { containers: true },
        },
      },
    });

    console.log("📊 Summary:");
    summary.forEach((type) => {
      console.log(`  ${type.name}: ${type.codePrefix} (${type._count.containers} containers)`);
    });

  } catch (error) {
    console.error("❌ Error updating container prefixes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateContainerPrefixes();
