// WHY: HDX tote types need capacity field populated for capacity tracking
// WHAT: Calculate and update capacity for all HDX tote container types
// HOW: Use tapered volume formula with existing dimension data
// GOTCHA: Run after add-hdx-tote-types.ts, uses calculateTaperedVolume utility

import { PrismaClient } from "@prisma/client";
import { calculateTaperedVolume } from "../src/lib/volumeCalculations";

const prisma = new PrismaClient();

async function main() {
  console.log("🧮 Calculating capacities for HDX tote types...\n");

  // Get all container types with tapered dimensions
  const containerTypes = await prisma.containerType.findMany({
    where: {
      AND: [
        { topLength: { not: null } },
        { topWidth: { not: null } },
        { bottomLength: { not: null } },
        { bottomWidth: { not: null } },
        { height: { not: null } },
      ],
    },
  });

  console.log(`Found ${containerTypes.length} container types with tapered dimensions\n`);

  let updated = 0;

  for (const type of containerTypes) {
    if (
      !type.topLength ||
      !type.topWidth ||
      !type.bottomLength ||
      !type.bottomWidth ||
      !type.height
    ) {
      console.log(`⚠️  Skipping ${type.name} - missing dimensions`);
      continue;
    }

    const capacity = calculateTaperedVolume(
      type.topLength,
      type.topWidth,
      type.bottomLength,
      type.bottomWidth,
      type.height
    );

    await prisma.containerType.update({
      where: { id: type.id },
      data: { capacity },
    });

    console.log(
      `✅ Updated ${type.name}: ${capacity.toFixed(1)} cubic inches (${(capacity / 231).toFixed(1)} gallons)`
    );
    updated++;
  }

  // Also update rectangular containers (boxes/suitcases)
  const rectangularTypes = await prisma.containerType.findMany({
    where: {
      AND: [
        { length: { not: null } },
        { width: { not: null } },
        { height: { not: null } },
        { topLength: null }, // Not tapered
      ],
    },
  });

  console.log(`\nFound ${rectangularTypes.length} rectangular container types\n`);

  for (const type of rectangularTypes) {
    if (!type.length || !type.width || !type.height) {
      console.log(`⚠️  Skipping ${type.name} - missing dimensions`);
      continue;
    }

    const capacity = type.length * type.width * type.height;

    await prisma.containerType.update({
      where: { id: type.id },
      data: { capacity },
    });

    console.log(
      `✅ Updated ${type.name}: ${capacity.toFixed(1)} cubic inches`
    );
    updated++;
  }

  console.log(`\n✨ Updated ${updated} container types with capacity calculations`);
}

main()
  .catch((e) => {
    console.error("❌ Error calculating capacities:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
