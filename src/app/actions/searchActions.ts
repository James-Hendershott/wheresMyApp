// WHY: Users need to quickly find items, containers, and locations across the entire inventory
// WHAT: Server action for global search with fuzzy matching across multiple models
// HOW: Searches containers (by label/code), items (by name/description), and locations (by name)
// GOTCHA: Case-insensitive search, limits results per category to prevent overwhelming results

"use server";

import { prisma } from "@/lib/prisma";

export interface SearchResults {
  containers: Array<{
    id: string;
    label: string;
    code: string;
    type: string | null;
    locationName: string;
    rackName: string | null;
  }>;
  items: Array<{
    id: string;
    name: string;
    description: string | null;
    containerLabel: string | null;
    containerId: string | null;
    status: string;
  }>;
  locations: Array<{
    id: string;
    name: string;
    rackCount: number;
  }>;
}

export async function globalSearch(query: string): Promise<SearchResults> {
  if (!query || query.trim().length < 2) {
    return { containers: [], items: [], locations: [] };
  }

  const searchTerm = query.trim().toLowerCase();

  // Search containers by label or code
  const containers = await prisma.container.findMany({
    where: {
      OR: [
        { label: { contains: searchTerm, mode: "insensitive" } },
        { code: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
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
    take: 10,
  });

  // Search items by name or description
  const items = await prisma.item.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { notes: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    include: {
      container: {
        select: {
          id: true,
          label: true,
        },
      },
    },
    take: 20,
  });

  // Search locations by name
  const locations = await prisma.location.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { notes: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    include: {
      _count: {
        select: { racks: true },
      },
    },
    take: 5,
  });

  return {
    containers: containers.map((c) => ({
      id: c.id,
      label: c.label,
      code: c.code,
      type: c.type,
      locationName: c.currentSlot?.rack?.location?.name || "Unassigned",
      rackName: c.currentSlot?.rack?.name || null,
    })),
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      containerLabel: i.container?.label || null,
      containerId: i.container?.id || null,
      status: i.status,
    })),
    locations: locations.map((l) => ({
      id: l.id,
      name: l.name,
      rackCount: l._count.racks,
    })),
  };
}
