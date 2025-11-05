// WHY: Racks overview page showing all racks organized by type
// WHAT: Lists all racks with card layout similar to Locations page
// HOW: Server component fetches racks, groups by location/type, displays with grid visualization

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureContainerTypesSchema } from "@/lib/dbEnsure";
import { AddRackModalButton } from "@/components/racks/AddRackModalButton";
import { EditRackModalButton } from "@/components/racks/EditRackModalButton";
import { formatSlotLabel } from "@/lib/slotLabels";

// Force dynamic rendering - don't prerender at build time
export const dynamic = "force-dynamic";

export default async function RacksPage() {
  // Defensive: ensure container types schema exists to avoid runtime errors
  await ensureContainerTypesSchema();

  const [racks, locations] = await Promise.all([
    prisma.rack.findMany({
      include: {
        location: true,
        slots: { include: { container: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Group racks by location for organization
  const racksByLocation = new Map<string, typeof racks>();
  for (const rack of racks) {
    const locationName = rack.location?.name || "Unassigned";
    if (!racksByLocation.has(locationName)) {
      racksByLocation.set(locationName, []);
    }
    racksByLocation.get(locationName)!.push(rack);
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Racks</h1>
          <p className="mt-2 text-gray-600">
            Visual overview of all storage racks. Click a rack to view details.
          </p>
        </div>
        <AddRackModalButton locations={locations} />
      </div>

      {racks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-lg text-gray-500">
            No racks yet. Create one using the button above!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(racksByLocation.entries()).map(
            ([locationName, locationRacks]) => (
              <div
                key={locationName}
                className="rounded-lg border bg-white p-6 shadow-sm"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{locationName}</h2>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {locationRacks.length} rack
                    {locationRacks.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {locationRacks.map((rack) => {
                    const filledSlots = rack.slots.filter(
                      (s) => s.container
                    ).length;
                    const totalSlots = rack.slots.length;
                    const fillPercentage =
                      totalSlots > 0
                        ? Math.round((filledSlots / totalSlots) * 100)
                        : 0;

                    // Calculate grid cell size - wider rectangles to fit better in card
                    // Using landscape orientation (wider than tall) for better space usage
                    const maxGridDimension = Math.max(rack.rows, rack.cols);
                    const baseCellWidth =
                      maxGridDimension <= 4
                        ? 75 // Wider cells for small grids
                        : maxGridDimension <= 6
                          ? 60 // Medium width
                          : maxGridDimension <= 10
                            ? 48 // Smaller for larger grids
                            : 36; // Compact for very large grids
                    const baseCellHeight =
                      maxGridDimension <= 4
                        ? 60 // Slightly shorter than width
                        : maxGridDimension <= 6
                          ? 50
                          : maxGridDimension <= 10
                            ? 40
                            : 30;
                    const cellWidth = `${baseCellWidth}px`;
                    const cellHeight = `${baseCellHeight}px`;
                    const gap = maxGridDimension <= 6 ? "6px" : "4px";

                    // Constrain to max 5x5 grid for display
                    const displayRows = Math.min(rack.rows, 5);
                    const displayCols = Math.min(rack.cols, 5);
                    const displaySlots = rack.slots.filter(
                      (s) => s.row < displayRows && s.col < displayCols
                    );

                    return (
                      <Link
                        key={rack.id}
                        href={`/racks/${rack.id}`}
                        className="group relative block rounded-lg border bg-gray-50 p-6 transition hover:border-blue-500 hover:shadow-lg"
                      >
                        <EditRackModalButton
                          rack={{
                            id: rack.id,
                            name: rack.name,
                            rows: rack.rows,
                            cols: rack.cols,
                            locationId: rack.locationId,
                          }}
                          locations={locations}
                        />

                        <div className="mb-3 flex items-start justify-between">
                          <div className="text-lg font-semibold text-gray-900">
                            {rack.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {rack.rows} × {rack.cols}
                            {(rack.rows > 5 || rack.cols > 5) && (
                              <span className="ml-1 text-xs text-orange-600">
                                (5×5 preview)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Larger, more interactive grid visualization - max 5x5 display */}
                        <div className="mb-4 flex min-h-[400px] items-center justify-center overflow-hidden rounded-lg bg-white p-4 shadow-inner">
                          <div
                            className="grid"
                            style={{
                              gridTemplateColumns: `repeat(${displayCols}, ${cellWidth})`,
                              gap: gap,
                            }}
                          >
                            {displaySlots.map((slot) => (
                              <div
                                key={slot.id}
                                className={`cursor-pointer rounded transition-all hover:scale-110 hover:shadow-md ${
                                  slot.container
                                    ? "bg-blue-500 hover:bg-blue-600"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                                style={{
                                  width: cellWidth,
                                  height: cellHeight,
                                }}
                                title={
                                  slot.container
                                    ? `${slot.container.label} ${formatSlotLabel(slot.row, slot.col)}`
                                    : `Empty ${formatSlotLabel(slot.row, slot.col)}`
                                }
                              />
                            ))}
                          </div>
                        </div>

                        {/* Fill Status */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>
                              {filledSlots} / {totalSlots} filled
                            </span>
                            <span>{fillPercentage}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}
