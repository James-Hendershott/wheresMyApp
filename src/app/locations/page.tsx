// WHY: Locations page that hosts the Inventory Map previously on /racks
// WHAT: Shows collapsible location cards with rack visualization

import { prisma } from "@/lib/prisma";
import { ensureContainerTypesSchema } from "@/lib/dbEnsure";
import { CollapsibleLocation } from "@/components/CollapsibleLocation";
import { AddLocationModalButton } from "@/components/locations/AddLocationModalButton";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  await ensureContainerTypesSchema();
  const [locations] = await Promise.all([
    prisma.location.findMany({
      include: {
        racks: {
          include: { slots: { include: { container: true } } },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
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
        <div className="space-y-6">
          {locations.map((location) => (
            <CollapsibleLocation key={location.id} location={location} />
          ))}
        </div>
      )}
    </main>
  );
}
