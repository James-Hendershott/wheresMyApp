// WHY: Interactive drag-and-drop rack grid for visual container management
// WHAT: Displays rack slots with containers, allows drag-and-drop assignment, click to view details
// HOW: Uses HTML5 drag-and-drop API, server actions for updates, visual feedback for filled/empty slots

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Box, Briefcase, Archive } from "lucide-react";
import { formatSlotLabel } from "@/lib/slotLabels";
import { updateContainer } from "@/app/actions/containerActions";
import { toast } from "sonner";

type Container = {
  id: string;
  code: string;
  label: string;
  containerType?: {
    name: string;
    iconKey: string | null;
  } | null;
};

type Slot = {
  id: string;
  row: number;
  col: number;
  container: Container | null;
};

type Rack = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  slots: Slot[];
};

interface InteractiveRackGridProps {
  rack: Rack;
  availableContainers?: Container[];
  showUnassigned?: boolean;
  cellSize?: "sm" | "md" | "lg";
}

// Get icon for container type
function getContainerIcon(iconKey: string | null | undefined) {
  switch (iconKey) {
    case "tote":
      return Package;
    case "box":
      return Box;
    case "suitcase":
    case "carry-on":
      return Briefcase;
    case "bin":
      return Archive;
    default:
      return Package;
  }
}

export function InteractiveRackGrid({
  rack,
  availableContainers = [],
  showUnassigned = true,
  cellSize = "md",
}: InteractiveRackGridProps) {
  const router = useRouter();
  const [draggedContainer, setDraggedContainer] = useState<Container | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cell size configurations
  const sizeConfig = {
    sm: { width: 48, height: 40, gap: 4, fontSize: "0.65rem", iconSize: 16 },
    md: { width: 80, height: 70, gap: 6, fontSize: "0.75rem", iconSize: 24 },
    lg: { width: 100, height: 90, gap: 8, fontSize: "0.875rem", iconSize: 32 },
  };

  const config = sizeConfig[cellSize];

  const handleDragStart = (e: React.DragEvent, container: Container) => {
    setDraggedContainer(container);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("containerId", container.id);
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSlot(slotId);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, slot: Slot) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!draggedContainer) return;

    // Don't allow dropping on occupied slots
    if (slot.container) {
      toast.error("This slot is already occupied!");
      setDraggedContainer(null);
      return;
    }

    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("currentSlotId", slot.id);

      const result = await updateContainer(draggedContainer.id, formData);

      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        toast.success(`${draggedContainer.label} moved to ${formatSlotLabel(slot.row, slot.col)}!`);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to move container");
      console.error(error);
    } finally {
      setIsUpdating(false);
      setDraggedContainer(null);
    }
  };

  const handleSlotClick = (container: Container | null) => {
    if (container) {
      // Navigate to container detail
      router.push(`/containers/${container.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Unassigned containers - drag source */}
      {showUnassigned && availableContainers.length > 0 && (
        <div className="rounded-lg border bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            📦 Unassigned Containers (Drag to Rack)
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableContainers.map((container) => {
              const Icon = getContainerIcon(container.containerType?.iconKey);
              return (
                <div
                  key={container.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, container)}
                  className="flex cursor-move items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-3 py-2 transition hover:border-blue-500 hover:shadow-md"
                  title={`Drag ${container.label} to a slot`}
                >
                  <Icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{container.label}</span>
                  <span className="text-xs text-gray-500">({container.code})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rack Grid */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{rack.name}</h3>
            <p className="text-sm text-gray-500">
              {rack.rows} rows × {rack.cols} columns
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {rack.slots.filter((s) => s.container).length} / {rack.slots.length} filled
          </div>
        </div>

        {/* Grid */}
        <div
          className="inline-grid"
          style={{
            gridTemplateColumns: `repeat(${rack.cols}, ${config.width}px)`,
            gap: `${config.gap}px`,
          }}
        >
          {Array.from({ length: rack.rows * rack.cols }).map((_, index) => {
            const row = Math.floor(index / rack.cols);
            const col = index % rack.cols;
            const slot = rack.slots.find((s) => s.row === row && s.col === col);

            if (!slot) return null;

            const isOccupied = !!slot.container;
            const isDragTarget = dragOverSlot === slot.id;
            const Icon = slot.container
              ? getContainerIcon(slot.container.containerType?.iconKey)
              : Package;

            return (
              <div
                key={slot.id}
                onDragOver={(e) => handleDragOver(e, slot.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot)}
                onClick={() => handleSlotClick(slot.container)}
                className={`flex flex-col items-center justify-center rounded-lg border-2 transition-all ${
                  isOccupied
                    ? "cursor-pointer border-blue-500 bg-blue-50 hover:scale-105 hover:border-blue-600 hover:shadow-lg"
                    : isDragTarget
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                } ${isUpdating ? "pointer-events-none opacity-50" : ""}`}
                style={{
                  width: `${config.width}px`,
                  height: `${config.height}px`,
                }}
                title={
                  isOccupied
                    ? `${slot.container!.label} - Click for details`
                    : `Empty slot ${formatSlotLabel(row, col)} - Drop container here`
                }
              >
                {isOccupied ? (
                  <>
                    <Icon className="text-blue-600" style={{ width: config.iconSize, height: config.iconSize }} />
                    <span className="mt-1 text-center font-semibold text-blue-900" style={{ fontSize: config.fontSize }}>
                      {formatSlotLabel(row, col)}
                    </span>
                    <span className="text-center text-blue-700" style={{ fontSize: `${parseFloat(config.fontSize) * 0.85}rem` }}>
                      {slot.container!.code}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-gray-400" style={{ fontSize: config.fontSize }}>
                      {formatSlotLabel(row, col)}
                    </span>
                    <span className="text-gray-300" style={{ fontSize: `${parseFloat(config.fontSize) * 0.85}rem` }}>
                      Empty
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-gray-200 bg-gray-50"></div>
            <span>Empty - Drop here</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-blue-500 bg-blue-50"></div>
            <span>Occupied - Click for details</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-green-500 bg-green-50"></div>
            <span>Drop target</span>
          </div>
        </div>
      </div>
    </div>
  );
}
