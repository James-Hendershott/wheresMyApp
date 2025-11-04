// WHY: Seed the database from the real Tote Intake CSV to bootstrap real data
// WHAT: Parses CSV rows → creates Locations, Containers, Items, and ItemPhotos
// HOW: Idempotent upserts by using stable container codes derived from Tote Number

import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient, ContainerStatus, ItemStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ───────────────────── Helpers ─────────────────────

function slugify(input: string): string {
  // WHY: Stable codes for containers and tags
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sanitizeCode(input: string): string {
  // WHAT: Convert Tote Number like "Bin #01" → "BIN-01" (canonical, stable)
  return slugify(input).toUpperCase();
}

function parseQuantity(qtyRaw: string | undefined): number {
  if (!qtyRaw) return 1;
  const m = qtyRaw.match(/\d+/);
  const n = m ? parseInt(m[0], 10) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function parseTimestamp(ts: string | undefined): Date {
  if (!ts) return new Date();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? new Date() : d;
}

function normalizeTag(prefix: string, value?: string): string | null {
  if (!value) return null;
  return `${prefix}:${value.trim()}`;
}

function normalizeItemStatus(cond?: string | null): ItemStatus {
  // WHAT: Map free-form condition/status to ItemStatus enum; default to IN_STORAGE
  const v = (cond || "").toLowerCase();
  if (v.includes("discard")) return ItemStatus.DISCARDED;
  if (v.includes("checked out") || v.includes("check out"))
    return ItemStatus.CHECKED_OUT;
  return ItemStatus.IN_STORAGE;
}

// ───────────────────── Seed ─────────────────────

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Create a .env with DATABASE_URL pointing to your Postgres instance (see .env.example)."
    );
  }

  const csvPath = path.resolve(
    process.cwd(),
    "Obsidian_Notes/files/Tote Inventory Intake Form (Responses) - Form Responses 1.csv"
  );

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found at ${csvPath}`);
  }

  const content = fs.readFileSync(csvPath, "utf8");

  type Row = {
    Timestamp: string;
    "Tote Number": string;
    "Tote Description": string;
    "Tote Location": string;
    "Item Name": string;
    Category: string;
    "Condition or Status": string;
    ISBN: string;
    Notes: string;
    "Item Photo": string;
    QTY: string;
    "Expiration Date if One": string;
  };

  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Row[];

  if (!rows.length) {
    console.warn("CSV parsed, but no rows found. Nothing to seed.");
    return;
  }

  // Track created Locations to avoid duplicates
  const locationCache = new Map<string, string>(); // name -> id
  const containerCache = new Map<string, string>(); // code -> id

  // First pass: collect unique locations and containers
  for (const r of rows) {
    const toteNumber = (
      r["Tote Number"] ||
      r["Tote Description"] ||
      "Unknown Tote"
    ).trim();
    const toteCode = sanitizeCode(toteNumber || "tote-unknown");
    const toteDesc = (r["Tote Description"] || "").trim();
    const locName = (r["Tote Location"] || "Unassigned").trim();

    // Upsert Location by name
    if (locName && !locationCache.has(locName)) {
      const existing = await prisma.location.findFirst({
        where: { name: locName },
      });
      if (existing) {
        locationCache.set(locName, existing.id);
      } else {
        const loc = await prisma.location.create({ data: { name: locName } });
        locationCache.set(locName, loc.id);
      }
    }

    // Upsert Container by code
    if (!containerCache.has(toteCode)) {
      const tags: string[] = [];
      const locTag = normalizeTag("loc", locName);
      if (locTag) tags.push(locTag);
      tags.push("source:csv");

      const label = toteDesc ? `${toteNumber} — ${toteDesc}` : toteNumber;

      const c = await prisma.container.upsert({
        where: { code: toteCode },
        update: {
          label,
          description: toteDesc || null,
          status: ContainerStatus.ACTIVE,
          tags,
        },
        create: {
          code: toteCode, // keep consistent with where clause for idempotency
          label,
          description: toteDesc || null,
          status: ContainerStatus.ACTIVE,
          tags,
        },
      });
      containerCache.set(toteCode, c.id);
    }
  }

  // Second pass: create items and photos
  for (const r of rows) {
    const itemName = (r["Item Name"] || "").trim();
    if (!itemName) continue; // skip rows without an item

    const toteNumber = (
      r["Tote Number"] ||
      r["Tote Description"] ||
      "Unknown Tote"
    ).trim();
    const toteCode = sanitizeCode(toteNumber || "tote-unknown");
    const containerId = containerCache.get(toteCode);
    if (!containerId) continue;

    const qty = parseQuantity(r["QTY"]);
    const ts = parseTimestamp(r["Timestamp"]);
    const category = (r["Category"] || "").trim();
    const cond = (r["Condition or Status"] || "").trim();
    const isbn = (r["ISBN"] || "").trim();
    const notes = (r["Notes"] || "").trim();
    const photo = (r["Item Photo"] || "").trim();

    // Build tags array for the item
    const tags: string[] = ["source:csv"];
    const catTag = normalizeTag("cat", category);
    if (catTag) tags.push(catTag);
    const condTag = normalizeTag("cond", cond);
    if (condTag) tags.push(condTag);
    const isbnTag = normalizeTag("isbn", isbn);
    if (isbnTag) tags.push(isbnTag);

    const descriptionParts = [] as string[];
    if (notes) descriptionParts.push(notes);
    if (isbn && !isbnTag) descriptionParts.push(`ISBN: ${isbn}`);
    const description = descriptionParts.join("\n");

    const status = normalizeItemStatus(cond);

    for (let i = 0; i < qty; i++) {
      // Idempotency: skip if an identical item already exists (containerId + name + description + createdAt)
      const existingItem = await prisma.item.findFirst({
        where: {
          containerId,
          name: itemName,
          createdAt: ts,
          ...(description ? { description } : { description: null }),
        },
      });

      const item =
        existingItem ||
        (await prisma.item.create({
          data: {
            name: itemName,
            description: description || null,
            status,
            containerId,
            tags,
            createdAt: ts,
          },
        }));

      if (photo && /^https?:\/\//i.test(photo)) {
        const existingPhoto = await prisma.itemPhoto.findFirst({
          where: { itemId: item.id, url: photo },
        });
        if (!existingPhoto) {
          await prisma.itemPhoto.create({
            data: {
              itemId: item.id,
              url: photo,
            },
          });
        }
      }
    }
  }

  // Optional: Log counts
  const [containers, items, photos, locations] = await Promise.all([
    prisma.container.count(),
    prisma.item.count(),
    prisma.itemPhoto.count(),
    prisma.location.count(),
  ]);

  console.log(
    `Seed complete → Containers: ${containers}, Items: ${items}, Photos: ${photos}, Locations: ${locations}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
