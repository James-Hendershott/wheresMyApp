// WHY: Allow quick assignment of container to rack slot with visual grid selection
// WHAT: Modal button showing rack grid for visual slot selection instead of dropdown
// HOW: Displays all racks with their slot grids, allows clicking empty slots to assign

"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateContainer } from "@/app/actions/containerActions";
import { toast } from "sonner";
import { formatSlotLabel } from "@/lib/slotLabels";

type Rack = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  location: {
    name: string;
  };
  slots: {
    id: string;
    row: number;
    col: number;
    containerId: string | null;
  }[];
};

interface AssignToRackButtonProps {
  containerId: string;
  currentSlotId: string | null;
  racks: Rack[];
  iconOnly?: boolean;
}

export function AssignToRackButton({
  containerId,
  currentSlotId,
  racks,
  iconOnly = false,
}: AssignToRackButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSlotClick = async (slotId: string) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("currentSlotId", slotId);

      const result = await updateContainer(containerId, formData);

      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        toast.success("Container assigned to slot!");
        setOpen(false);
        window.location.reload();
      }
    } catch (error) {
      toast.error("An error occurred while assigning container");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const button = (
    <Button
      variant="outline"
      size={iconOnly ? "icon" : "sm"}
      className={iconOnly ? "h-8 w-8" : "gap-2"}
    >
      <MapPin className="h-4 w-4" />
      {!iconOnly && "Assign to Rack"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {iconOnly ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent>
                <p>Assign to Rack</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          button
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Container to Rack Slot</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {racks.length === 0 ? (
            <p className="text-center text-gray-500">
              No racks available. Create a rack first.
            </p>
          ) : (
            racks.map((rack) => (
              <div key={rack.id} className="rounded-lg border p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">{rack.name}</h3>
                  <p className="text-sm text-gray-600">
                    📍 {rack.location.name}
                  </p>
                </div>

                {/* Rack Grid */}
                <div className="overflow-x-auto">
                  <div
                    className="inline-grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${rack.cols}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: rack.rows * rack.cols }).map(
                      (_, index) => {
                        const row = Math.floor(index / rack.cols);
                        const col = index % rack.cols;
                        const slot = rack.slots.find(
                          (s) => s.row === row && s.col === col
                        );

                        const isEmpty = !slot?.containerId;
                        const isCurrent = slot?.id === currentSlotId;

                        return (
                          <button
                            key={`${row}-${col}`}
                            onClick={() =>
                              slot && isEmpty && handleSlotClick(slot.id)
                            }
                            disabled={!slot || !isEmpty || isSubmitting}
                            className={`flex h-16 w-16 flex-col items-center justify-center rounded border text-xs font-medium transition-colors ${
                              isCurrent
                                ? "border-blue-500 bg-blue-100 text-blue-700"
                                : isEmpty
                                  ? "border-gray-300 bg-white hover:border-green-500 hover:bg-green-50"
                                  : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                            }`}
                          >
                            <span className="font-semibold">
                              {formatSlotLabel(row, col)}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px]">Current</span>
                            )}
                            {!isEmpty && !isCurrent && (
                              <span className="text-[10px]">Occupied</span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-3 flex gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded border border-gray-300 bg-white"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded border border-gray-200 bg-gray-100"></div>
                    <span>Occupied</span>
                  </div>
                  {currentSlotId && (
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded border border-blue-500 bg-blue-100"></div>
                      <span>Current</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
