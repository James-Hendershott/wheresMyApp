// WHY: Locations page showing all locations with interactive rack grids
// WHAT: Shows collapsible location cards with drag-and-drop rack visualization
// HOW: Server component fetches data, CollapsibleLocation uses InteractiveRackGrid

import { prisma } from "@/lib/prisma";
import { ensureContainerTypesSchema } from "@/lib/dbEnsure";
import { CollapsibleLocation } from "@/components/CollapsibleLocation";
import { AddLocationModalButton } from "@/components/locations/AddLocationModalButton";
import { AddRackModalButton } from "@/components/racks/AddRackModalButton";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  await ensureContainerTypesSchema();
  const [locations, unassignedContainers] = await Promise.all([
    prisma.location.findMany({
      include: {
        racks: {
          include: {
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
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
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

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="mt-2 text-gray-600">
            Visual overview of all storage locations and their racks. Click a
            rack to view details.
          </p>
        </div>
        <div className="flex gap-2">
          <AddRackModalButton
            locations={locations.map((l) => ({ id: l.id, name: l.name }))}
          />
          <AddLocationModalButton />
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">
            No locations yet. Create one using the admin forms!
          </p>
        </div>
      ) : (
        <>
          {/* Unassigned containers section */}
          {unassignedContainers.length > 0 && (
            <div className="mb-6 rounded-lg border-2 border-dashed border-orange-200 bg-orange-50 p-6">
              <h2 className="mb-3 text-lg font-semibold text-orange-900">
                📦 Unassigned Containers ({unassignedContainers.length})
              </h2>
              <p className="mb-4 text-sm text-orange-700">
                These containers are not assigned to any rack slot. Navigate to a rack page or drag them into rack grids below.
              </p>
              <div className="flex flex-wrap gap-2">
                {unassignedContainers.map((container) => (
                  <a
                    key={container.id}
                    href={`/containers/${container.id}`}
                    className="rounded-lg border-2 border-orange-300 bg-white px-3 py-2 text-sm font-medium transition hover:border-orange-500 hover:shadow-md"
                  >
                    {container.label} ({container.code})
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {locations.map((location) => (
              <CollapsibleLocation
                key={location.id}
                location={location}
                allLocations={locations.map((l) => ({
                  id: l.id,
                  name: l.name,
                }))}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
