// WHY: Inventory overview page showing all racks and a visual map of containers
// WHAT: Lists all racks; clicking a rack shows its SVG grid (rows × cols) with containers placed
// HOW: Server component fetches racks and containers from the DB; placeholder for now

import { prisma } from "@/lib/prisma";
import {
  AddLocationForm,
  AddRackForm,
  AddContainerForm,
  AddItemForm,
} from "@/components/CrudFormsClient";
import { CollapsibleLocation } from "@/components/CollapsibleLocation";

// Force dynamic rendering - don't prerender at build time
export const dynamic = "force-dynamic";

export default async function RacksPage() {
  // Fetch all locations with their racks, and containers/slots for CRUD forms
  const [locations, containers, slots] = await Promise.all([
    prisma.location.findMany({
      include: {
        racks: {
          include: {
            slots: { include: { container: true } },
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.container.findMany({ orderBy: { label: "asc" } }),
    prisma.slot.findMany({
      include: { rack: true },
      orderBy: [{ rack: { name: "asc" } }, { row: "asc" }, { col: "asc" }],
    }),
  ]);

  // For slot/containers dropdowns
  const slotOptions = slots.map((slot) => ({
    id: slot.id,
    label: `${slot.rack?.name || "Rack"} [${slot.row},${slot.col}]`,
  }));
  const containerOptions = containers.map((c) => ({
    id: c.id,
    label: c.label,
  }));

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Inventory Map</h1>
      <p className="mb-8 text-gray-600">
        Visual overview of all storage locations and their racks. Click a rack
        to view details.
      </p>

      {/* Rack Map organized by Location */}
      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Storage Locations</h2>
        {locations.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">
              No locations yet. Create one using the forms below!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {locations.map((location) => (
              <CollapsibleLocation key={location.id} location={location} />
            ))}
          </div>
        )}
      </div>

      {/* CRUD Forms Section */}
      <div className="rounded-lg border-t-4 border-blue-500 bg-gray-50 p-6">
        <h2 className="mb-6 text-2xl font-semibold">Quick Add Forms</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <AddLocationForm />
          <AddRackForm locations={locations} />
          <AddContainerForm slots={slotOptions} />
          <AddItemForm containers={containerOptions} />
        </div>
      </div>
    </main>
  );
}
