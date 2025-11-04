// WHY: Verify Prisma Client types are correctly generated and exported
// WHAT: Test script to check enum imports and type definitions

import {
  PrismaClient,
  ItemCategory,
  ItemCondition,
  ContainerStatus,
} from "@prisma/client";

console.log("✅ Prisma Client imported successfully");
console.log(
  "✅ ItemCategory enum:",
  Object.keys(ItemCategory).length,
  "values"
);
console.log(
  "✅ ItemCondition enum:",
  Object.keys(ItemCondition).length,
  "values"
);
console.log(
  "✅ ContainerStatus enum:",
  Object.keys(ContainerStatus).length,
  "values"
);

const prisma = new PrismaClient();

// Test type inference
type TestContainer = {
  type?: string | null;
  code: string;
  label: string;
  description?: string | null;
  locationName?: string | null;
  status: ContainerStatus;
};

const testData: TestContainer = {
  type: "Tote",
  code: "TEST-01",
  label: "Test Tote",
  description: "Test description",
  locationName: "Test Location",
  status: "ACTIVE",
};

console.log("✅ Container type definition works:", testData);

// Test Item type with category
type TestItem = {
  name: string;
  category?: ItemCategory | null;
  condition?: ItemCondition | null;
  quantity: number;
};

const testItem: TestItem = {
  name: "Test Item",
  category: "BOOKS",
  condition: "UNOPENED",
  quantity: 1,
};

console.log("✅ Item type definition works:", testItem);

console.log("\n🎉 All Prisma types are working correctly!");

prisma.$disconnect();
