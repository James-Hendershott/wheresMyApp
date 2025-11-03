// WHY: Inventory overview page showing all racks and a visual map of containers
// WHAT: Lists all racks; clicking a rack shows its SVG grid (rows × cols) with containers placed
// HOW: Server component fetches racks and containers from the DB; placeholder for now


import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AddLocationForm, AddRackForm, AddContainerForm, AddItemForm } from "../components/CrudForms";



export default async function RacksPage() {
  // Fetch all locations, racks, slots, containers for CRUD forms
  const [locations, racks, containers, slots] = await Promise.all([
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.rack.findMany({
      include: {
        location: true,
        slots: { include: { container: true } },
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
  const containerOptions = containers.map((c) => ({ id: c.id, label: c.label }));

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Map</h1>
      <p className="mb-8 text-gray-600">See all racks and where each container is located. Click a rack to view its grid.</p>

      {/* CRUD Forms */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <AddLocationForm />
        <AddRackForm locations={locations} />
        <AddContainerForm slots={slotOptions} />
        <AddItemForm containers={containerOptions} />
      </div>

      {/* Racks List */}
      <div className="grid gap-6 md:grid-cols-2">
        {racks.map((rack) => (
          <Link key={rack.id} href={`/racks/${rack.id}`} className="block rounded-lg border p-4 shadow-sm hover:shadow-md transition">
            <div className="font-semibold text-lg mb-1">{rack.name}</div>
            <div className="text-sm text-gray-500 mb-2">Location: {rack.location?.name || "Unknown"}</div>
            <div className="flex flex-wrap gap-2">
              {rack.slots.map((slot) =>
                slot.container ? (
                  <span key={slot.id} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {slot.container.label}
                  </span>
                ) : (
                  <span key={slot.id} className="inline-block bg-gray-100 text-gray-400 px-2 py-1 rounded text-xs">Empty</span>
                )
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
