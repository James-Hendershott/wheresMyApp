// WHY: Allow containers to be stored inside other containers (e.g., book boxes inside totes)
// WHAT: Modal button showing list of available containers for nesting
// HOW: Displays containers that can accept this one, prevents circular nesting

"use client";

import { useState } from "react";
import { Package } from "lucide-react";
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

type Container = {
  id: string;
  code: string;
  label: string;
  currentSlot?: {
    id: string;
    rack: {
      name: string;
      location: {
        name: string;
      };
    };
  } | null;
};

interface AssignToContainerButtonProps {
  containerId: string;
  containerLabel: string;
  currentParentId: string | null;
  availableContainers: Container[];
  iconOnly?: boolean;
}

export function AssignToContainerButton({
  containerId,
  containerLabel,
  currentParentId,
  availableContainers,
  iconOnly = false,
}: AssignToContainerButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContainerClick = async (parentId: string | null) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("label", containerLabel); // Required field
      if (parentId) {
        formData.append("parentContainerId", parentId);
      }
      // Clear slot when moving into container
      formData.append("currentSlotId", "");

      const result = await updateContainer(containerId, formData);

      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        if (parentId) {
          const parent = availableContainers.find((c) => c.id === parentId);
          toast.success(`Moved into ${parent?.label || "container"}!`);
        } else {
          toast.success("Removed from parent container!");
        }
        setOpen(false);
        window.location.reload();
      }
    } catch (error) {
      toast.error("An error occurred while moving container");
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
      <Package className="h-4 w-4" />
      {!iconOnly && "Store In Container"}
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
                <p>Store in Another Container</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          button
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Store Container Inside Another</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select a container to store <strong>{containerLabel}</strong> inside, or
            choose "Remove from Container" to place it back on a rack.
          </p>

          {/* Option to remove from parent */}
          {currentParentId && (
            <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
              <button
                onClick={() => handleContainerClick(null)}
                disabled={isSubmitting}
                className="w-full text-left hover:bg-orange-100 transition-colors rounded p-2"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-semibold text-orange-900">
                      ❌ Remove from Parent Container
                    </div>
                    <div className="text-sm text-orange-700">
                      Place back on a rack (use "Assign to Rack" button)
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* List of available containers */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-700">
              Available Containers:
            </h3>

            {availableContainers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No other containers available. Create more containers first.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableContainers.map((container) => {
                  const isCurrent = container.id === currentParentId;

                  return (
                    <button
                      key={container.id}
                      onClick={() => handleContainerClick(container.id)}
                      disabled={isSubmitting || isCurrent}
                      className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${
                        isCurrent
                          ? "border-blue-500 bg-blue-50 cursor-default"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Package
                            className={`h-6 w-6 flex-shrink-0 ${
                              isCurrent ? "text-blue-600" : "text-gray-600"
                            }`}
                          />
                          <div>
                            <div
                              className={`font-semibold ${
                                isCurrent ? "text-blue-900" : "text-gray-900"
                              }`}
                            >
                              {container.label}
                            </div>
                            <div className="text-sm text-gray-600">
                              Code: {container.code}
                            </div>
                            {container.currentSlot && (
                              <div className="text-xs text-gray-500 mt-1">
                                📍 {container.currentSlot.rack.location.name} →{" "}
                                {container.currentSlot.rack.name}
                              </div>
                            )}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                            Current Parent
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>💡 Note:</strong> A container can be stored{" "}
            <strong>either</strong> on a rack slot <strong>OR</strong> inside
            another container, not both. When you assign this to a parent
            container, it will be removed from its rack slot.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
