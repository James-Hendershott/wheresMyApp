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
import { updateItemSlot } from "@/app/actions/itemActions";
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

type ItemContainer = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
};

type DraggableEntity = {
  id: string;
  displayName: string;
  type: "container" | "item";
  icon?: string | null;
  code?: string;
};

type Slot = {
  id: string;
  row: number;
  col: number;
  container: Container | null;
  item?: ItemContainer | null; // Item-containers can also occupy slots
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
  availableItemContainers?: ItemContainer[]; // NEW: Items that act as containers
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
  availableItemContainers = [],
  showUnassigned = true,
  cellSize = "md",
}: InteractiveRackGridProps) {
  const router = useRouter();
  const [draggedEntity, setDraggedEntity] = useState<DraggableEntity | null>(null);
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

  const handleDragStart = (e: React.DragEvent, entity: DraggableEntity) => {
    setDraggedEntity(entity);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("entityId", entity.id);
    e.dataTransfer.setData("entityType", entity.type);
    
    // Create custom drag image for better visual feedback
    if (dragImageRef.current) {
      e.dataTransfer.setDragImage(dragImageRef.current, 50, 25);
    }
  };

  const handleDragEnd = () => {
    setDraggedEntity(null);
    setIsDragging(false);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, slotId: string, slot: Slot) => {
    e.preventDefault();
    
    // Only allow drop on empty slots (no container AND no item)
    if (!slot.container && !slot.item) {
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

    if (!draggedEntity) return;

    // Don't allow dropping on occupied slots
    if (slot.container || slot.item) {
      toast.error("This slot is already occupied!");
      setDraggedEntity(null);
      return;
    }

    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("currentSlotId", slot.id);

      let result;
      if (draggedEntity.type === "container") {
        result = await updateContainer(draggedEntity.id, formData);
      } else {
        result = await updateItemSlot(draggedEntity.id, formData);
      }

      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        toast.success(`${draggedEntity.displayName} moved to ${formatSlotLabel(slot.row, slot.col)}!`);
        router.refresh();
      }
    } catch (error) {
      toast.error(`Failed to move ${draggedEntity.type}`);
      console.error(error);
    } finally {
      setIsUpdating(false);
      setDraggedEntity(null);
    }
  };

  const handleSlotClick = (entity: Container | ItemContainer | null, e: React.MouseEvent, entityType: "container" | "item" | null) => {
    // Don't navigate if we're in the middle of dragging
    if (isDragging) {
      e.preventDefault();
      return;
    }
    
    if (entity && entityType) {
      // Navigate to entity detail page
      if (entityType === "container") {
        router.push(`/containers/${entity.id}`);
      } else {
        router.push(`/items/${entity.id}`);
      }
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
          {draggedEntity?.displayName}
        </span>
      </div>

      {/* Unassigned containers and item-containers - drag source */}
      {showUnassigned && (availableContainers.length > 0 || availableItemContainers.length > 0) && (
        <div className="rounded-lg border bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <GripVertical className="h-4 w-4" />
            📦 Unassigned Containers & Items (Drag to Rack)
          </h3>
          <div className="flex flex-wrap gap-2">
            {/* Regular containers */}
            {availableContainers.map((container) => {
              const Icon = getContainerIcon(container.containerType?.iconKey);
              const entity: DraggableEntity = {
                id: container.id,
                displayName: container.label,
                type: "container",
                icon: container.containerType?.iconKey,
                code: container.code,
              };
              const isBeingDragged = draggedEntity?.id === container.id && draggedEntity?.type === "container";
              
              return (
                <div
                  key={container.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, entity)}
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
            
            {/* Item-containers */}
            {availableItemContainers.map((item) => {
              const entity: DraggableEntity = {
                id: item.id,
                displayName: item.name,
                type: "item",
              };
              const isBeingDragged = draggedEntity?.id === item.id && draggedEntity?.type === "item";
              
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, entity)}
                  onDragEnd={handleDragEnd}
                  className={`group flex cursor-move items-center gap-2 rounded-lg border-2 bg-white px-3 py-2 transition-all duration-200 ${
                    isBeingDragged
                      ? "border-purple-500 opacity-50 shadow-sm"
                      : "border-dashed border-purple-300 hover:border-purple-400 hover:shadow-md"
                  }`}
                  title={`Drag item-container ${item.name} to a slot`}
                >
                  <GripVertical className="h-4 w-4 text-gray-400 transition group-hover:text-purple-500" />
                  <Box className="h-4 w-4 text-purple-600 transition group-hover:text-purple-700" />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">Item</span>
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
            💡 Drop on an empty slot to place <strong>{draggedEntity?.displayName}</strong>
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

            const isOccupied = !!(slot.container || slot.item);
            const isDragTarget = dragOverSlot === slot.id && !isOccupied;
            const Icon = slot.container
              ? getContainerIcon(slot.container.containerType?.iconKey)
              : slot.item
                ? Box // Item-containers get a box icon
                : Package;

            // Determine entity type for display
            const entity = slot.container || slot.item || null;
            const entityType = slot.container ? "container" : slot.item ? "item" : null;
            const entityLabel = slot.container?.code || slot.item?.name || "";

            return (
              <div
                key={slot.id}
                onDragOver={(e) => handleDragOver(e, slot.id, slot)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot)}
                onClick={(e) => handleSlotClick(entity, e, entityType)}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                  isOccupied
                    ? entityType === "item"
                      ? "cursor-pointer border-purple-500 bg-purple-50 hover:scale-105 hover:border-purple-600 hover:shadow-lg active:scale-95"
                      : "cursor-pointer border-blue-500 bg-blue-50 hover:scale-105 hover:border-blue-600 hover:shadow-lg active:scale-95"
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
                    ? `${entityType === "item" ? "Item-container:" : ""} ${entityLabel} - Click for details`
                    : isDragging
                      ? `Drop ${draggedEntity?.displayName} here`
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
                    <Icon 
                      className={entityType === "item" ? "text-purple-600" : "text-blue-600"} 
                      style={{ width: config.iconSize, height: config.iconSize }} 
                    />
                    <span 
                      className={`mt-1 text-center font-semibold ${entityType === "item" ? "text-purple-900" : "text-blue-900"}`} 
                      style={{ fontSize: config.fontSize }}
                    >
                      {formatSlotLabel(row, col)}
                    </span>
                    <span 
                      className={`text-center ${entityType === "item" ? "text-purple-700" : "text-blue-700"}`} 
                      style={{ fontSize: `${parseFloat(config.fontSize) * 0.85}rem` }}
                    >
                      {entityLabel.length > 10 ? entityLabel.substring(0, 10) + "..." : entityLabel}
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
            <span>Container</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-purple-500 bg-purple-50"></div>
            <span>Item-Container</span>
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
