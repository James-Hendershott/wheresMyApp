// WHY: Allow editing container details (label, description, location/slot assignment)
// WHAT: Modal button that opens a form to edit container information
// HOW: Uses Dialog from shadcn/ui, server action for updates

"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateContainer } from "@/app/actions/containerActions";
import { toast } from "sonner";

type Slot = {
  id: string;
  label: string;
};

type Container = {
  id: string;
  label: string;
  description: string | null;
  currentSlotId: string | null;
};

interface EditContainerModalButtonProps {
  container: Container;
  slots: Slot[];
}

export function EditContainerModalButton({
  container,
  slots,
}: EditContainerModalButtonProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(container.label);
  const [description, setDescription] = useState(container.description || "");
  const [slotId, setSlotId] = useState(container.currentSlotId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("label", label);
      formData.append("description", description);
      formData.append("currentSlotId", slotId);

      const result = await updateContainer(container.id, formData);

      if ("error" in result) {
        toast.error(result.error as string);
      } else {
        toast.success("Container updated successfully!");
        setOpen(false);
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      toast.error("An error occurred while updating the container");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Container
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Container</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label */}
          <div>
            <label
              htmlFor="label"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Container Label
            </label>
            <input
              type="text"
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Location/Slot */}
          <div>
            <label
              htmlFor="slot"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Location & Slot
            </label>
            <select
              id="slot"
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
