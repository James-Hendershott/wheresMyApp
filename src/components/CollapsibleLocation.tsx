// WHY: Present a single Location card with its racks and a mini grid visualization
// WHAT: Client component with collapsible sections to manage screen space

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatSlotLabel } from "@/lib/slotLabels";

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
}: {
  location: LocationWithRacks;
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
            <div
              className="grid justify-items-start gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              }}
            >
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
                  <a
                    key={rack.id}
                    href={`/racks/${rack.id}`}
                    className="block max-w-sm justify-self-start rounded-lg border bg-gray-50 p-4 transition hover:border-blue-500 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="font-semibold text-gray-900">
                        {rack.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {rack.rows} × {rack.cols}
                      </div>
                    </div>

                    {/* Mini Grid Visualization */}
                    <div className="mb-3">
                      <div
                        className="grid gap-1"
                        style={{
                          gridTemplateColumns: `repeat(${Math.min(
                            rack.cols,
                            8
                          )}, minmax(0, 1fr))`,
                        }}
                      >
                        {rack.slots
                          .slice(0, Math.min(32, rack.rows * rack.cols))
                          .map((slot) => (
                            <div
                              key={slot.id}
                              className={`aspect-square rounded ${
                                slot.container ? "bg-blue-500" : "bg-gray-200"
                              }`}
                              title={
                                slot.container
                                  ? `${slot.container.label} ${formatSlotLabel(slot.row, slot.col)}`
                                  : `Empty ${formatSlotLabel(slot.row, slot.col)}`
                              }
                            />
                          ))}
                        {rack.slots.length > 32 && (
                          <div className="flex items-center justify-center text-xs text-gray-400">
                            +{rack.slots.length - 32}
                          </div>
                        )}
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
