// Migration script: map existing Item.category values to new ItemCategory and ItemSubcategory
// Usage: node ./scripts/migrate-categories.ts [--apply]
// --apply will write changes; otherwise it's a dry-run.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mapping from current category to desired category + subcategory
const mapping: Record<
  string,
  { category: string; subcategory?: string | null }
> = {
  BOOKS: { category: "BOOKS_MEDIA", subcategory: "BOOKS_NOVELS" },
  GAMES_HOBBIES: { category: "GAMES_HOBBIES" },
  CAMPING_OUTDOORS: { category: "CAMPING_OUTDOORS" },
  TOOLS_GEAR: { category: "TOOLS_HARDWARE" },
  COOKING: { category: "KITCHEN" },
  CLEANING: { category: "CLEANING" },
  ELECTRONICS: {
    category: "ELECTRONICS",
    subcategory: "ELECTRONICS_ACCESSORIES",
  },
  LIGHTS: { category: "LIGHTING", subcategory: "LIGHTING_FLASHLIGHTS" },
  FIRST_AID: { category: "SAFETY", subcategory: "MEDICAL_FIRST_AID" },
  EMERGENCY: { category: "SAFETY", subcategory: "SAFETY_EMERGENCY" },
  CLOTHES: { category: "APPAREL" },
  CORDAGE: { category: "ROPES", subcategory: "CORDAGE_ROPE" },
  TECH_MEDIA: { category: "BOOKS_MEDIA", subcategory: "MEDIA_MUSIC" },
  MISC: { category: "MISCELLANEOUS" },
};

async function run() {
  const apply = process.argv.includes("--apply");
  console.log("Category migration script");
  console.log("Dry run mode (no DB writes) unless --apply is passed.");

  const items = await prisma.item.findMany({
    select: { id: true, category: true, subcategory: true, name: true },
  });
  console.log(`Found ${items.length} items`);

  const toUpdate: Array<{
    id: string;
    oldCategory: string | null;
    newCategory?: string;
    newSubcategory?: string | null;
  }> = [];

  for (const it of items) {
    const oldCat = it.category;
    if (!oldCat) continue;

    const map = mapping[oldCat];
    if (!map) {
      // If category is already one of the expanded ones, skip
      toUpdate.push({
        id: it.id,
        oldCategory: oldCat,
        newCategory: undefined,
        newSubcategory: undefined,
      });
      continue;
    }

    toUpdate.push({
      id: it.id,
      oldCategory: oldCat,
      newCategory: map.category,
      newSubcategory: map.subcategory ?? null,
    });
  }

  console.log(
    `Planned updates: ${toUpdate.filter((u) => u.newCategory).length}`
  );
  if (toUpdate.length === 0) {
    console.log("No updates necessary.");
    await prisma.$disconnect();
    return;
  }

  for (const u of toUpdate) {
    const it = items.find((x) => x.id === u.id)!;
    console.log(
      `Item: ${it.name} (${u.id}) - old: ${u.oldCategory} -> new: ${u.newCategory}/${u.newSubcategory}`
    );
    if (apply && u.newCategory) {
      try {
        await prisma.item.update({
          where: { id: u.id },
          data: {
            category: u.newCategory as any,
            subcategory: u.newSubcategory as any,
          },
        });
      } catch (err) {
        console.error("Failed to update item", u.id, err);
      }
    }
  }

  if (!apply)
    console.log("\nDry run complete. Rerun with --apply to perform updates.");
  else console.log("\nUpdates applied.");

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
