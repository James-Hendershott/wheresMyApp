// WHY: Add complete range of HDX tapered storage tote sizes to ContainerType table
// WHAT: Creates ContainerType records for all HDX tote sizes with accurate dimensions
// HOW: Upserts container types based on Home Depot HDX product specifications

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addHDXToteTypes() {
  console.log("🏗️  Adding HDX Tote Types with Dimensions...\n");

  try {
    // HDX Tapered Storage Tote Sizes
    // Source: Home Depot HDX product line
    // All dimensions in inches (L × W × H for top, bottom dimensions for tapered design)
    const hdxTotes = [
      {
        name: "12 Gallon HDX Tote",
        codePrefix: "TOTE12",
        iconKey: "tote",
        // 12 Gallon: Smallest HDX tote
        topLength: 23.875,
        topWidth: 15.875,
        bottomLength: 20.0,
        bottomWidth: 13.0,
        height: 13.375,
        description: "HDX 12-gallon tapered storage tote - ideal for smaller items, books, toys",
      },
      {
        name: "17 Gallon HDX Tote",
        codePrefix: "TOTE17",
        iconKey: "tote",
        // 17 Gallon: Small/medium tote
        topLength: 24.0,
        topWidth: 16.0,
        bottomLength: 20.5,
        bottomWidth: 13.5,
        height: 16.5,
        description: "HDX 17-gallon tapered storage tote - compact storage for seasonal items",
      },
      {
        name: "27 Gallon HDX Tote",
        codePrefix: "TOTE27",
        iconKey: "tote",
        // 27 Gallon: Most common/popular size
        topLength: 30.0,
        topWidth: 20.0,
        bottomLength: 26.0,
        bottomWidth: 16.5,
        height: 14.5,
        description: "HDX 27-gallon tapered storage tote - most popular size, general purpose storage",
      },
      {
        name: "35 Gallon HDX Tote",
        codePrefix: "TOTE35",
        iconKey: "tote",
        // 35 Gallon: Large tote
        topLength: 30.0,
        topWidth: 20.0,
        bottomLength: 26.0,
        bottomWidth: 16.5,
        height: 18.75,
        description: "HDX 35-gallon tapered storage tote - taller version of 27-gallon, great for bulky items",
      },
      {
        name: "45 Gallon HDX Tote",
        codePrefix: "TOTE45",
        iconKey: "tote",
        // 45 Gallon: Extra large
        topLength: 32.0,
        topWidth: 21.0,
        bottomLength: 27.5,
        bottomWidth: 17.5,
        height: 22.0,
        description: "HDX 45-gallon tapered storage tote - extra large for seasonal decorations, bedding",
      },
      {
        name: "55 Gallon HDX Tote",
        codePrefix: "TOTE55",
        iconKey: "tote",
        // 55 Gallon: Largest standard HDX tote
        topLength: 36.0,
        topWidth: 24.0,
        bottomLength: 31.0,
        bottomWidth: 20.0,
        height: 20.0,
        description: "HDX 55-gallon tapered storage tote - largest size, ideal for bulk storage, camping gear",
      },
    ];

    console.log("📦 Creating/Updating HDX Tote Types:\n");

    for (const tote of hdxTotes) {
      const result = await prisma.containerType.upsert({
        where: { name: tote.name },
        update: {
          codePrefix: tote.codePrefix,
          iconKey: tote.iconKey,
          topLength: tote.topLength,
          topWidth: tote.topWidth,
          bottomLength: tote.bottomLength,
          bottomWidth: tote.bottomWidth,
          height: tote.height,
        },
        create: {
          name: tote.name,
          codePrefix: tote.codePrefix,
          iconKey: tote.iconKey,
          topLength: tote.topLength,
          topWidth: tote.topWidth,
          bottomLength: tote.bottomLength,
          bottomWidth: tote.bottomWidth,
          height: tote.height,
        },
      });

      console.log(`  ✅ ${tote.name}`);
      console.log(`     Code Prefix: ${tote.codePrefix}`);
      console.log(`     Dimensions: ${tote.topLength}" × ${tote.topWidth}" × ${tote.height}"`);
      console.log(`     Top: ${tote.topLength}" × ${tote.topWidth}"`);
      console.log(`     Bottom: ${tote.bottomLength}" × ${tote.bottomWidth}"`);
      console.log(`     Volume: ${tote.name.split(" ")[0]} gallons`);
      console.log(`     ${tote.description}`);
      console.log();
    }

    console.log("✅ HDX Tote Types Added Successfully!\n");

    // Show summary
    const allTypes = await prisma.containerType.findMany({
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
      orderBy: { topLength: "asc" },
    });

    console.log("📊 HDX Tote Summary:");
    allTypes.forEach((type) => {
      console.log(
        `  ${type.name}: ${type.codePrefix} - ${type._count.containers} containers`
      );
    });

    // Note about existing containers
    console.log("\n⚠️  Note: Existing containers with 'TOTE27' prefix remain unchanged.");
    console.log("   Run update-container-types.ts to reassign containers to new types if needed.\n");

  } catch (error) {
    console.error("❌ Error adding HDX tote types:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addHDXToteTypes();
