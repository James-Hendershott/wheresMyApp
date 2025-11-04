import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

const csvPath = path.join(
  __dirname,
  "..",
  "Obsidian_Notes",
  "files",
  "Tote Inventory Intake Form (Responses) - Form Responses 1.csv"
);
const csvContent = fs.readFileSync(csvPath, "utf-8");

const rows = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relaxColumnCount: true,
});

console.log("📄 CSV Analysis\n");
console.log(`Total rows in CSV: ${rows.length}\n`);

// Extract unique container names
const containerNames = new Set<string>();
const itemNames: string[] = [];

for (const row of rows) {
  const toteNumber = row["Tote Number"]?.trim();
  const itemName = row["Item Name"]?.trim();

  if (toteNumber) {
    containerNames.add(toteNumber);
  }

  if (itemName) {
    itemNames.push(itemName);
  }
}

console.log(`📦 Unique containers in CSV: ${containerNames.size}`);
console.log(`📝 Items with names in CSV: ${itemNames.length}\n`);

console.log("Container Names:");
console.log("─".repeat(40));
Array.from(containerNames)
  .sort()
  .forEach((name) => {
    console.log(`  ${name}`);
  });

// Check for rows without tote or item name
const rowsWithoutTote = rows.filter((r: any) => !r["Tote Number"]?.trim());
const rowsWithoutItem = rows.filter((r: any) => !r["Item Name"]?.trim());

console.log(`\n⚠️  Rows missing Tote Number: ${rowsWithoutTote.length}`);
console.log(`⚠️  Rows missing Item Name: ${rowsWithoutItem.length}`);

if (rowsWithoutTote.length > 0) {
  console.log("\nRows without Tote Number (will be skipped):");
  rowsWithoutTote.slice(0, 5).forEach((row: any, i: number) => {
    console.log(
      `  ${i + 1}. Item: "${row["Item Name"] || "NO NAME"}" - Location: "${row["Tote Location"] || "NO LOCATION"}"`
    );
  });
}
