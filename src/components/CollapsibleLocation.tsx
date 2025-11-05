// WHY: Present a single Location card with its racks and a mini grid visualization
// WHAT: Client component with collapsible sections to manage screen space

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatSlotLabel } from "@/lib/slotLabels";
import { EditRackModalButton } from "@/components/racks/EditRackModalButton";

type SlotWithContainer = {
  id: string;
  row: number;
  col: number;
  container: { label: string } | null;
};

type RackWithSlots = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  slots: SlotWithContainer[];
};

type LocationWithRacks = {
  id: string;
  name: string;
  notes?: string | null;
  racks: RackWithSlots[];
};

export function CollapsibleLocation({
  location,
  allLocations,
}: {
  location: LocationWithRacks;
  allLocations: { id: string; name: string }[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-4 flex w-full items-center justify-between text-left transition hover:opacity-80"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
          <div>
            <h3 className="text-xl font-semibold">{location.name}</h3>
            {location.notes && (
              <p className="text-sm text-gray-500">{location.notes}</p>
            )}
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          {location.racks.length} rack{location.racks.length !== 1 ? "s" : ""}
        </span>
      </button>

      {isExpanded && (
        <>
          {location.racks.length === 0 ? (
            <p className="text-sm text-gray-400">
              No racks in this location yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {location.racks.map((rack) => {
                const filledSlots = rack.slots.filter(
                  (s) => s.container
                ).length;
                const totalSlots = rack.slots.length;
                const fillPercentage =
                  totalSlots > 0
                    ? Math.round((filledSlots / totalSlots) * 100)
                    : 0;

                // Calculate grid cell size for larger, more interactive cards
                // Additional 50% increase + max grid 5x5 constraint to prevent overflow
                const maxGridDimension = Math.max(rack.rows, rack.cols);
                const baseCellSize =
                  maxGridDimension <= 4
                    ? 90 // 150% of 60 (50% additional increase)
                    : maxGridDimension <= 6
                      ? 72 // 150% of 48
                      : maxGridDimension <= 10
                        ? 54 // 150% of 36
                        : 40; // 150% of 27
                const cellSize = `${baseCellSize}px`;
                const gap = maxGridDimension <= 6 ? "8px" : "6px"; // Proportionally increased

                // Constrain to max 5x5 grid for display
                const displayRows = Math.min(rack.rows, 5);
                const displayCols = Math.min(rack.cols, 5);
                const displaySlots = rack.slots.filter(
                  (s) => s.row < displayRows && s.col < displayCols
                );

                return (
                  <a
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
                        locationId: location.id,
                      }}
                      locations={allLocations}
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
                    <div className="mb-4 flex min-h-[450px] items-center justify-center overflow-hidden rounded-lg bg-white p-4 shadow-inner">
                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: `repeat(${displayCols}, ${cellSize})`,
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
                              width: cellSize,
                              height: cellSize,
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
                  </a>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
