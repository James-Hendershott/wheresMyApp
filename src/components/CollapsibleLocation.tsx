// WHY: Present a single Location card with its racks and interactive grid previews
// WHAT: Client component with collapsible sections, click-through to rack detail pages
// HOW: Shows mini grids with visual feedback, links to full interactive rack pages

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { formatSlotLabel } from "@/lib/slotLabels";
import { EditRackModalButton } from "@/components/racks/EditRackModalButton";
import Link from "next/link";

type Container = {
  id: string;
  code: string;
  label: string;
  containerType?: {
    name: string;
    iconKey: string | null;
  } | null;
};

type SlotWithContainer = {
  id: string;
  row: number;
  col: number;
  container: Container | null;
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
                    className="group relative block rounded-lg border-2 bg-gray-50 p-6 transition hover:border-blue-500 hover:shadow-lg"
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
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {rack.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Click for interactive drag-and-drop
                        </div>
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

                    {/* Static mini grid visualization - max 5x5 display */}
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
                            className={`flex cursor-pointer items-center justify-center rounded transition-all hover:scale-110 hover:shadow-md ${
                              slot.container
                                ? "bg-blue-500 font-semibold text-white hover:bg-blue-600"
                                : "bg-gray-200 font-medium text-gray-600 hover:bg-gray-300"
                            }`}
                            style={{
                              width: cellWidth,
                              height: cellHeight,
                              fontSize: "0.75rem",
                            }}
                            title={
                              slot.container
                                ? `${slot.container.label} - ${formatSlotLabel(slot.row, slot.col)}`
                                : `Empty - ${formatSlotLabel(slot.row, slot.col)}`
                            }
                          >
                            {slot.container ? (
                              <span className="text-center">
                                {formatSlotLabel(slot.row, slot.col)}
                              </span>
                            ) : (
                              formatSlotLabel(slot.row, slot.col)
                            )}
                          </div>
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
          )}
        </>
      )}
    </div>
  );
}
