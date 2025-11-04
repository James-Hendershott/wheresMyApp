// WHY: Production seed script to import real inventory data from Google Forms CSV
// WHAT: Parse CSV, extract container types/codes, map categories, handle conditions

import { PrismaClient } from '@prisma/client';
import type { ItemCategory, ItemCondition, Container } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Map CSV categories to ItemCategory enum
function mapCategory(csvCategory: string): ItemCategory | undefined {
  if (!csvCategory) return undefined;
  
  const normalized = csvCategory.toLowerCase().trim();
  
  if (normalized === 'books') return 'BOOKS';
  if (normalized === 'games & hobbies') return 'GAMES_HOBBIES';
  if (normalized.includes('camping') || normalized.includes('outdoor')) return 'CAMPING_OUTDOORS';
  if (normalized.includes('tools') || normalized === 'tool') return 'TOOLS_GEAR';
  if (normalized === 'cooking') return 'COOKING';
  if (normalized === 'cleaning') return 'CLEANING';
  if (normalized === 'electronics') return 'ELECTRONICS';
  if (normalized === 'lights') return 'LIGHTS';
  if (normalized === 'first aid') return 'FIRST_AID';
  if (normalized.includes('emergency')) return 'EMERGENCY';
  if (normalized === 'clothes') return 'CLOTHES';
  if (normalized === 'cordage') return 'CORDAGE';
  if (normalized.includes('tech') || normalized.includes('media')) return 'TECH_MEDIA';
  if (normalized === 'misc') return 'MISC';
  
  return 'MISC'; // Default fallback
}

// Map CSV condition strings to ItemCondition enum
function mapCondition(csvCondition: string): ItemCondition | undefined {
  if (!csvCondition) return undefined;
  
  const normalized = csvCondition.toLowerCase().trim();
  
  if (normalized === 'unopened') return 'UNOPENED';
  if (normalized.includes('opened - nothing missing')) return 'OPENED_COMPLETE';
  if (normalized.includes('opened - missing') || normalized.includes('opened but missing')) return 'OPENED_MISSING';
  if (normalized.includes('used')) return 'USED';
  if (normalized.includes('damaged')) return 'DAMAGED';
  if (normalized.includes('binder') || normalized.includes('loose leaf')) return 'USED';
  if (normalized.includes('opened complete')) return 'OPENED_COMPLETE';
  
  return undefined;
}

// Parse container name to extract type and code
// Examples:
//   "Bin #01" -> { type: "Bin", code: "BIN-01", label: "Bin #01" }
//   "Tote #05" -> { type: "Tote", code: "TOTE-05", label: "Tote #05" }
//   "Book Box #1" -> { type: "Book Box", code: "BOOKBOX-1", label: "Book Box #1" }
function parseContainerName(name: string) {
  const match = name.match(/^(.*?)\s*#(\d+)/i);
  
  if (match) {
    const type = match[1].trim();
    const number = match[2];
    const normalizedType = type.toUpperCase().replace(/\s+/g, '');
    const code = `${normalizedType}-${number.padStart(2, '0')}`;
    
    return {
      type,
      code,
      label: name.trim()
    };
  }
  
  // Fallback for containers without # pattern
  const normalized = name.trim().toUpperCase().replace(/\s+/g, '-');
  return {
    type: 'Container',
    code: normalized,
    label: name.trim()
  };
}

// Parse quantity string (handles "~10", "1", empty string)
function parseQuantity(qtyStr: string): number {
  if (!qtyStr || qtyStr.trim() === '') return 1;
  
  // Remove ~ and other non-numeric chars except digits
  const cleaned = qtyStr.replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  
  return isNaN(parsed) ? 1 : parsed;
}

// Parse date string from CSV (handles various formats)
function parseDate(dateStr: string): Date | undefined {
  if (!dateStr || dateStr.trim() === '') return undefined;
  
  try {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  } catch {
    return undefined;
  }
}

interface CSVRow {
  Timestamp: string;
  'Tote Number': string;
  'Tote Description': string;
  'Tote Location': string;
  'Item Name': string;
  Category: string;
  'Condition or Status': string;
  ISBN: string;
  Notes: string;
  'Item Photo': string;
  QTY: string;
  'Expiration Date if One': string;
}

async function main() {
  console.log('🌱 Starting production seed...');
  
  // Step 1: Clear existing data
  console.log('🧹 Clearing old data...');
  await prisma.movement.deleteMany({});
  await prisma.itemPhoto.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.container.deleteMany({});
  await prisma.slot.deleteMany({});
  await prisma.rack.deleteMany({});
  await prisma.location.deleteMany({});
  
  console.log('✅ Old data cleared');
  
  // Step 2: Read and parse CSV
  const csvPath = path.join(__dirname, '..', 'Obsidian_Notes', 'files', 'Tote Inventory Intake Form (Responses) - Form Responses 1 (1).csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relaxColumnCount: true // Handle rows with missing columns
  }) as CSVRow[];
  
  console.log(`📄 Loaded ${rows.length} items from CSV`);
  
  // Step 3: Extract unique containers and locations
  const containerMap = new Map<string, {
    type: string;
    code: string;
    label: string;
    description: string;
    locationName: string;
  }>();
  
  const locationSet = new Set<string>();
  
  for (const row of rows) {
    const toteNumber = row['Tote Number']?.trim();
    const toteDescription = row['Tote Description']?.trim();
    const toteLocation = row['Tote Location']?.trim();
    
    if (!toteNumber) continue; // Skip rows without container info
    
    const parsed = parseContainerName(toteNumber);
    
    if (!containerMap.has(parsed.code)) {
      containerMap.set(parsed.code, {
        type: parsed.type,
        code: parsed.code,
        label: parsed.label,
        description: toteDescription || '',
        locationName: toteLocation || ''
      });
    }
    
    if (toteLocation) {
      locationSet.add(toteLocation);
    }
  }
  
  console.log(`📦 Found ${containerMap.size} unique containers`);
  console.log(`📍 Found ${locationSet.size} unique locations`);
  
  // Step 4: Create containers
  console.log('📦 Creating containers...');
  const containerRecords = new Map<string, Container>();
  
  for (const [code, data] of containerMap.entries()) {
    try {
      const container = await prisma.container.create({
        data: {
          type: data.type,
          code: data.code,
          label: data.label,
          description: data.description,
          locationName: data.locationName,
          status: 'ACTIVE'
        }
      });
      containerRecords.set(code, container);
      console.log(`  ✓ ${data.label} (${data.code})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`  ✗ Failed to create ${data.label}: ${errorMessage}`);
    }
  }
  
  // Step 5: Create items
  console.log('📝 Creating items...');
  let itemCount = 0;
  let photoCount = 0;
  
  for (const row of rows) {
    const toteNumber = row['Tote Number']?.trim();
    const itemName = row['Item Name']?.trim();
    
    if (!toteNumber || !itemName) {
      console.log(`  ⚠️  Skipping row with missing tote or item name`);
      continue;
    }
    
    const parsed = parseContainerName(toteNumber);
    const container = containerRecords.get(parsed.code);
    
    if (!container) {
      console.log(`  ⚠️  Container not found for ${toteNumber}`);
      continue;
    }
    
    try {
      const category = mapCategory(row.Category);
      const condition = mapCondition(row['Condition or Status']);
      const quantity = parseQuantity(row.QTY);
      const expirationDate = parseDate(row['Expiration Date if One']);
      
      const item = await prisma.item.create({
        data: {
          name: itemName,
          description: row.Notes?.trim() || null,
          category,
          condition,
          isbn: row.ISBN?.trim() || null,
          notes: row.Notes?.trim() || null,
          quantity,
          expirationDate,
          containerId: container.id,
          status: 'IN_STORAGE'
        }
      });
      
      itemCount++;
      
      // Create photo if URL exists
      const photoUrl = row['Item Photo']?.trim();
      if (photoUrl && photoUrl.startsWith('http')) {
        await prisma.itemPhoto.create({
          data: {
            itemId: item.id,
            url: photoUrl
          }
        });
        photoCount++;
      }
      
      if (itemCount % 50 === 0) {
        console.log(`  ... ${itemCount} items created so far`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`  ✗ Failed to create item "${itemName}": ${errorMessage}`);
    }
  }
  
  console.log(`\n✅ Seed completed successfully!`);
  console.log(`📦 Created ${containerMap.size} containers`);
  console.log(`📝 Created ${itemCount} items`);
  console.log(`📷 Created ${photoCount} photos`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
