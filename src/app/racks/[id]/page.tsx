// WHY: Interactive drag-and-drop rack grid for visual container management
// WHAT: Fetches rack by id, displays interactive grid with drag-and-drop, click to view container details
// HOW: Server component fetches data, InteractiveRackGrid handles all interactions

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InteractiveRackGrid } from "@/components/racks/InteractiveRackGrid";
import Link from "next/link";

interface RackPageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function RackPage({ params }: RackPageProps) {
  const [rack, unassignedContainers] = await Promise.all([
    prisma.rack.findUnique({
      where: { id: params.id },
      include: {
        location: true,
        slots: {
          include: {
            container: {
              include: {
                containerType: {
                  select: {
                    name: true,
                    iconKey: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    // Get containers without a slot assignment
    prisma.container.findMany({
      where: {
        currentSlotId: null,
        status: "ACTIVE",
      },
      include: {
        containerType: {
          select: {
            name: true,
            iconKey: true,
          },
        },
      },
      orderBy: { code: "asc" },
    }),
  ]);

  if (!rack) return notFound();

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <Link
          href="/locations"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Locations
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{rack.name}</h1>
        <p className="mt-2 text-gray-600">
          📍 {rack.location?.name || "Unknown Location"} • {rack.rows} rows × {rack.cols} columns
        </p>
        <p className="mt-1 text-sm text-gray-500">
          💡 Drag containers from the unassigned list below to empty slots. Click occupied slots to view container details.
        </p>
      </div>

      <InteractiveRackGrid
        rack={rack}
        availableContainers={unassignedContainers}
        showUnassigned={true}
        cellSize="lg"
      />
    </main>
  );
}
