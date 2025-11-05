// WHY: Present a single Location card with its racks and interactive drag-and-drop grids
// WHAT: Client component with collapsible sections showing InteractiveRackGrid for each rack
// HOW: Uses InteractiveRackGrid for full drag-and-drop functionality directly on locations page

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { EditRackModalButton } from "@/components/racks/EditRackModalButton";
import { InteractiveRackGrid } from "@/components/racks/InteractiveRackGrid";

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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {location.racks.map((rack) => {
                const filledSlots = rack.slots.filter(
                  (s) => s.container
                ).length;
                const totalSlots = rack.slots.length;
                const fillPercentage =
                  totalSlots > 0
                    ? Math.round((filledSlots / totalSlots) * 100)
                    : 0;

                return (
                  <div
                    key={rack.id}
                    className="relative rounded-lg border-2 bg-white p-4 shadow-sm"
                  >
                    {/* Header with edit button */}
                    <div className="absolute right-2 top-2 z-10">
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
                    </div>

                    <div className="mb-3">
                      <div className="pr-10 text-lg font-semibold text-gray-900">
                        {rack.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rack.rows} × {rack.cols} • Drag containers to slots
                      </div>
                    </div>

                    {/* Interactive Grid */}
                    <InteractiveRackGrid
                      rack={{
                        id: rack.id,
                        name: rack.name,
                        rows: rack.rows,
                        cols: rack.cols,
                        slots: rack.slots,
                      }}
                      showUnassigned={false}
                      cellSize="sm"
                    />

                    {/* Fill Status */}
                    <div className="mt-3 space-y-1">
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
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
