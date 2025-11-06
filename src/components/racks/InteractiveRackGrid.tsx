// WHY: Interactive drag-and-drop rack grid for visual container management
// WHAT: Displays rack slots with containers, allows drag-and-drop assignment, click to view details
// HOW: Uses HTML5 drag-and-drop API, server actions for updates, visual feedback for filled/empty slots
// GOTCHA: Touch events require preventDefault to avoid default mobile behavior

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Package, Box, Briefcase, Archive, GripVertical } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);
  const dragImageRef = useRef<HTMLDivElement>(null);

  // Cell size configurations
  const sizeConfig = {
    sm: { width: 48, height: 40, gap: 4, fontSize: "0.65rem", iconSize: 16 },
    md: { width: 80, height: 70, gap: 6, fontSize: "0.75rem", iconSize: 24 },
    lg: { width: 100, height: 90, gap: 8, fontSize: "0.875rem", iconSize: 32 },
  };

  const config = sizeConfig[cellSize];

  const handleDragStart = (e: React.DragEvent, container: Container) => {
    setDraggedContainer(container);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("containerId", container.id);
    
    // Create custom drag image for better visual feedback
    if (dragImageRef.current) {
      e.dataTransfer.setDragImage(dragImageRef.current, 50, 25);
    }
  };

  const handleDragEnd = () => {
    setDraggedContainer(null);
    setIsDragging(false);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, slotId: string, slot: Slot) => {
    e.preventDefault();
    
    // Only allow drop on empty slots
    if (!slot.container) {
      e.dataTransfer.dropEffect = "move";
      setDragOverSlot(slotId);
    } else {
      e.dataTransfer.dropEffect = "none";
      setDragOverSlot(null);
    }
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, slot: Slot) => {
    e.preventDefault();
    setDragOverSlot(null);
    setIsDragging(false);

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

  const handleSlotClick = (container: Container | null, e: React.MouseEvent) => {
    // Don't navigate if we're in the middle of dragging
    if (isDragging) {
      e.preventDefault();
      return;
    }
    
    if (container) {
      // Navigate to container detail
      router.push(`/containers/${container.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden drag image for custom drag preview */}
      <div
        ref={dragImageRef}
        className="pointer-events-none fixed -left-[9999px] top-0 flex items-center gap-2 rounded-lg border-2 border-blue-500 bg-blue-50 px-4 py-2 shadow-lg"
      >
        <GripVertical className="h-4 w-4 text-blue-600" />
        <Package className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-blue-900">
          {draggedContainer?.label}
        </span>
      </div>

      {/* Unassigned containers - drag source */}
      {showUnassigned && availableContainers.length > 0 && (
        <div className="rounded-lg border bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <GripVertical className="h-4 w-4" />
            📦 Unassigned Containers (Drag to Rack)
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableContainers.map((container) => {
              const Icon = getContainerIcon(container.containerType?.iconKey);
              const isBeingDragged = draggedContainer?.id === container.id;
              
              return (
                <div
                  key={container.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, container)}
                  onDragEnd={handleDragEnd}
                  className={`group flex cursor-move items-center gap-2 rounded-lg border-2 bg-white px-3 py-2 transition-all duration-200 ${
                    isBeingDragged
                      ? "border-blue-500 opacity-50 shadow-sm"
                      : "border-dashed border-gray-300 hover:border-blue-400 hover:shadow-md"
                  }`}
                  title={`Drag ${container.label} to a slot`}
                >
                  <GripVertical className="h-4 w-4 text-gray-400 transition group-hover:text-blue-500" />
                  <Icon className="h-4 w-4 text-gray-600 transition group-hover:text-blue-600" />
                  <span className="text-sm font-medium">{container.label}</span>
                  <span className="text-xs text-gray-500">({container.code})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rack Grid */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{rack.name}</h3>
            <p className="text-sm text-gray-500">
              {rack.rows} rows × {rack.cols} columns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">
                {rack.slots.filter((s) => s.container).length}
              </span>
              {" / "}
              <span className="text-gray-500">{rack.slots.length}</span>
              {" filled"}
            </div>
          </div>
        </div>

        {isDragging && (
          <div className="mb-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            💡 Drop on an empty slot to place <strong>{draggedContainer?.label}</strong>
          </div>
        )}

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
            const isDragTarget = dragOverSlot === slot.id && !isOccupied;
            const Icon = slot.container
              ? getContainerIcon(slot.container.containerType?.iconKey)
              : Package;

            return (
              <div
                key={slot.id}
                onDragOver={(e) => handleDragOver(e, slot.id, slot)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot)}
                onClick={(e) => handleSlotClick(slot.container, e)}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                  isOccupied
                    ? "cursor-pointer border-blue-500 bg-blue-50 hover:scale-105 hover:border-blue-600 hover:shadow-lg active:scale-95"
                    : isDragTarget
                      ? "animate-pulse border-green-500 bg-green-100 shadow-lg"
                      : isDragging
                        ? "border-dashed border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                } ${isUpdating ? "pointer-events-none opacity-50" : ""}`}
                style={{
                  width: `${config.width}px`,
                  height: `${config.height}px`,
                }}
                title={
                  isOccupied
                    ? `${slot.container!.label} - Click for details`
                    : isDragging
                      ? `Drop ${draggedContainer?.label} here`
                      : `Empty slot ${formatSlotLabel(row, col)}`
                }
              >
                {/* Drop indicator */}
                {isDragTarget && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-green-500 bg-opacity-20">
                    <span className="text-2xl">📦</span>
                  </div>
                )}

                {isOccupied ? (
                  <>
                    <Icon className="text-blue-600 transition-transform group-hover:scale-110" style={{ width: config.iconSize, height: config.iconSize }} />
                    <span className="mt-1 text-center font-semibold text-blue-900" style={{ fontSize: config.fontSize }}>
                      {formatSlotLabel(row, col)}
                    </span>
                    <span className="text-center text-blue-700" style={{ fontSize: `${parseFloat(config.fontSize) * 0.85}rem` }}>
                      {slot.container!.code}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-gray-400 transition-colors" style={{ fontSize: config.fontSize }}>
                      {formatSlotLabel(row, col)}
                    </span>
                    {isDragging ? (
                      <span className="mt-1 text-green-500" style={{ fontSize: `${parseFloat(config.fontSize) * 0.85}rem` }}>
                        Drop here
                      </span>
                    ) : (
                      <span className="text-gray-300" style={{ fontSize: `${parseFloat(config.fontSize) * 0.85}rem` }}>
                        Empty
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Enhanced Legend */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-gray-600 md:flex md:flex-wrap md:gap-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-gray-200 bg-gray-50"></div>
            <span>Empty slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-blue-500 bg-blue-50"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded border-2 border-green-500 bg-green-100"></div>
            <span>Drop target</span>
          </div>
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <span>Draggable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
