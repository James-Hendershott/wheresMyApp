// WHY: Locations page that hosts the Inventory Map previously on /racks
// WHAT: Mirrors the racks overview with rack visualization and quick forms; will later trim rack-specific forms

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureContainerTypesSchema } from "@/lib/dbEnsure";
import {
  AddLocationForm,
  AddRackForm,
  AddContainerForm,
  AddItemForm,
} from "@/components/CrudFormsClient";
import { listContainerTypes } from "@/app/actions/containerTypeActions";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  await ensureContainerTypesSchema();
  const [locations, containers, slots, containerTypes] = await Promise.all([
    prisma.location.findMany({
      include: {
        racks: {
          include: { slots: { include: { container: true } } },
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
    listContainerTypes(),
  ]);

  const slotOptions = slots.map((slot) => ({
    id: slot.id,
    label: `${slot.rack?.name || "Rack"} [${slot.row},${slot.col}]`,
  }));
  const containerOptions = containers.map((c) => ({ id: c.id, label: c.label }));

  const typeCounts: Record<string, number> = {};
  for (const t of containerTypes) typeCounts[t.id] = 0;
  for (const c of containers as { containerTypeId?: string | null }[]) {
    if (c.containerTypeId && typeCounts[c.containerTypeId] !== undefined) {
      typeCounts[c.containerTypeId] += 1;
    }
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Locations</h1>
      <p className="mb-8 text-gray-600">
        Visual overview of all storage locations and their racks. Click a rack
        to view details.
      </p>

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
              <div key={location.id} className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{location.name}</h3>
                    {location.notes && (
                      <p className="text-sm text-gray-500">{location.notes}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {location.racks.length} rack{location.racks.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {location.racks.length === 0 ? (
                  <p className="text-sm text-gray-400">No racks in this location yet.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {location.racks.map((rack) => {
                      const filledSlots = rack.slots.filter((s) => s.container).length;
                      const totalSlots = rack.slots.length;
                      const fillPercentage = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

                      return (
                        <Link
                          key={rack.id}
                          href={`/racks/${rack.id}`}
                          className="block rounded-lg border bg-gray-50 p-4 transition hover:border-blue-500 hover:shadow-md"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div className="font-semibold text-gray-900">{rack.name}</div>
                            <div className="text-xs text-gray-500">
                              {rack.rows} × {rack.cols}
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(rack.cols, 8)}, minmax(0, 1fr))` }}>
                              {rack.slots
                                .slice(0, Math.min(32, rack.rows * rack.cols))
                                .map((slot) => (
                                  <div
                                    key={slot.id}
                                    className={`aspect-square rounded ${slot.container ? "bg-blue-500" : "bg-gray-200"}`}
                                    title={slot.container ? `${slot.container.label} [${slot.row},${slot.col}]` : `Empty [${slot.row},${slot.col}]`}
                                  />
                                ))}
                              {rack.slots.length > 32 && (
                                <div className="flex items-center justify-center text-xs text-gray-400">+{rack.slots.length - 32}</div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>
                                {filledSlots} / {totalSlots} filled
                              </span>
                              <span>{fillPercentage}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                              <div className="h-full bg-blue-500 transition-all" style={{ width: `${fillPercentage}%` }} />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
          <AddContainerForm slots={slotOptions} containerTypes={containerTypes} typeCounts={typeCounts} />
          <AddItemForm containers={containerOptions} />
        </div>
      </div>
    </main>
  );
}
