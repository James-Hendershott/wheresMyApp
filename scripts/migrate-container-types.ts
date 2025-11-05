// WHY: Create ContainerType records and link existing containers to them
// WHAT: Creates standard container types (27 Gallon Tote, Bin, Suitcase, Book Box) and updates all containers
// HOW: Upsert container types, then match containers by code prefix and link them

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateContainerTypes() {
  console.log("🔄 Starting container type migration...\n");

  // Step 1: Create standard ContainerType records
  console.log("📦 Creating ContainerType records...");

  const toteType = await prisma.containerType.upsert({
    where: { name: "27 Gallon Tote" },
    update: {},
    create: {
      name: "27 Gallon Tote",
      codePrefix: "TOTE",
      iconKey: "tote",
      length: 27, // inches
      width: 16,
      height: 12,
    },
  });
  console.log(`  ✓ Created: ${toteType.name} (${toteType.id})`);

  const binType = await prisma.containerType.upsert({
    where: { name: "Storage Bin" },
    update: {},
    create: {
      name: "Storage Bin",
      codePrefix: "BIN",
      iconKey: "bin",
      length: 18,
      width: 12,
      height: 8,
    },
  });
  console.log(`  ✓ Created: ${binType.name} (${binType.id})`);

  const suitcaseType = await prisma.containerType.upsert({
    where: { name: "Suitcase" },
    update: {},
    create: {
      name: "Suitcase",
      codePrefix: "SUITCASE",
      iconKey: "suitcase",
      length: 28,
      width: 18,
      height: 10,
    },
  });
  console.log(`  ✓ Created: ${suitcaseType.name} (${suitcaseType.id})`);

  const bookBoxType = await prisma.containerType.upsert({
    where: { name: "Book Box" },
    update: {},
    create: {
      name: "Book Box",
      codePrefix: "BOOKBOX",
      iconKey: "box",
      length: 18,
      width: 18,
      height: 16,
    },
  });
  console.log(`  ✓ Created: ${bookBoxType.name} (${bookBoxType.id})`);

  // Step 2: Link existing containers to ContainerTypes
  console.log("\n🔗 Linking containers to ContainerTypes...");

  // Link all TOTE containers to 27 Gallon Tote type
  const toteUpdate = await prisma.container.updateMany({
    where: {
      code: { startsWith: "TOTE" },
    },
    data: {
      containerTypeId: toteType.id,
      type: "27 Gallon Tote", // Also update legacy type field
    },
  });
  console.log(`  ✓ Linked ${toteUpdate.count} totes to "27 Gallon Tote"`);

  // Link all BIN containers to Storage Bin type
  const binUpdate = await prisma.container.updateMany({
    where: {
      code: { startsWith: "BIN" },
    },
    data: {
      containerTypeId: binType.id,
      type: "Storage Bin",
    },
  });
  console.log(`  ✓ Linked ${binUpdate.count} bins to "Storage Bin"`);

  // Link all SUITCASE containers to Suitcase type
  const suitcaseUpdate = await prisma.container.updateMany({
    where: {
      code: { startsWith: "SUITCASE" },
    },
    data: {
      containerTypeId: suitcaseType.id,
      type: "Suitcase",
    },
  });
  console.log(
    `  ✓ Linked ${suitcaseUpdate.count} suitcases to "Suitcase"`
  );

  // Link all BOOKBOX containers to Book Box type
  const bookBoxUpdate = await prisma.container.updateMany({
    where: {
      code: { startsWith: "BOOKBOX" },
    },
    data: {
      containerTypeId: bookBoxType.id,
      type: "Book Box",
    },
  });
  console.log(
    `  ✓ Linked ${bookBoxUpdate.count} book boxes to "Book Box"`
  );

  // Step 3: Verify results
  console.log("\n✅ Verification:");
  const allContainers = await prisma.container.findMany({
    include: { containerType: true },
  });

  const linked = allContainers.filter((c) => c.containerTypeId !== null).length;
  const unlinked = allContainers.filter((c) => c.containerTypeId === null)
    .length;

  console.log(`  Total containers: ${allContainers.length}`);
  console.log(`  Linked to ContainerType: ${linked}`);
  console.log(`  Not linked: ${unlinked}`);

  if (unlinked > 0) {
    console.log("\n⚠️  Unlinked containers:");
    allContainers
      .filter((c) => c.containerTypeId === null)
      .forEach((c) => {
        console.log(`    - ${c.code}: ${c.label}`);
      });
  }

  console.log("\n🎉 Container type migration complete!");

  await prisma.$disconnect();
}

migrateContainerTypes().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
