// WHY: Central inventory page showing all items across all containers with filtering and management
// WHAT: Server component with comprehensive item list, filters, search, and actions
// HOW: Fetches all items with relations, provides client-side filtering UI

import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [items, containers] = await Promise.all([
    prisma.item.findMany({
      include: {
        container: {
          include: {
            currentSlot: {
              include: {
                rack: {
                  include: {
                    location: true,
                  },
                },
              },
            },
          },
        },
        photos: {
          select: {
            url: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.container.findMany({
      select: {
        id: true,
        code: true,
        label: true,
      },
      orderBy: { label: "asc" },
    }),
  ]);

  return <InventoryClient items={items} containers={containers} />;
}
