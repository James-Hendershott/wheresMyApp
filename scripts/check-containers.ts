// Quick script to check container types for totes
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkContainers() {
  console.log("🔍 Checking container types...\n");

  // Get all container types
  const containerTypes = await prisma.containerType.findMany();
  console.log("📦 Available Container Types:");
  containerTypes.forEach((ct) => {
    console.log(`  - ${ct.name} (ID: ${ct.id}, Prefix: ${ct.codePrefix})`);
  });

  console.log("\n📦 Checking TOTE containers:");
  const totes = await prisma.container.findMany({
    where: {
      code: { startsWith: "TOTE" },
    },
    include: {
      containerType: true,
    },
    take: 10,
  });

  if (totes.length === 0) {
    console.log("  ⚠️  No totes found!");
  } else {
    totes.forEach((tote) => {
      console.log(
        `  ${tote.code} - ${tote.label} - Type: ${tote.type || "NONE"} - ContainerType: ${tote.containerType?.name || "NOT SET"}`
      );
    });
  }

  console.log("\n📦 Checking BIN containers:");
  const bins = await prisma.container.findMany({
    where: {
      code: { startsWith: "BIN" },
    },
    include: {
      containerType: true,
    },
    take: 5,
  });

  bins.forEach((bin) => {
    console.log(
      `  ${bin.code} - ${bin.label} - Type: ${bin.type || "NONE"} - ContainerType: ${bin.containerType?.name || "NOT SET"}`
    );
  });

  await prisma.$disconnect();
}

checkContainers().catch(console.error);
