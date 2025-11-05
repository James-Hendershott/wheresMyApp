// WHY: Allow editing rack details (name, location, dimensions) from anywhere
// WHAT: Modal button that opens a form to edit rack information
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
import { updateRackWithData } from "@/app/actions/rackActions";
import { toast } from "sonner";

type Location = {
  id: string;
  name: string;
};

type Rack = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  locationId: string;
};

interface EditRackModalButtonProps {
  rack: Rack;
  locations: Location[];
}

export function EditRackModalButton({
  rack,
  locations,
}: EditRackModalButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(rack.name);
  const [rows, setRows] = useState(rack.rows);
  const [cols, setCols] = useState(rack.cols);
  const [locationId, setLocationId] = useState(rack.locationId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateRackWithData(rack.id, {
        name,
        rows,
        cols,
        locationId,
      });

      if (result.success) {
        toast.success("Rack updated successfully!");
        setOpen(false);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update rack");
      }
    } catch (error) {
      toast.error("An error occurred while updating the rack");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Rack</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Rack Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <select
              id="location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="rows"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Rows
              </label>
              <input
                type="number"
                id="rows"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                min="1"
                max="20"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="cols"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Columns
              </label>
              <input
                type="number"
                id="cols"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                min="1"
                max="20"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <strong>Note:</strong> Changing dimensions will adjust the slot
            grid. Existing containers will remain in their current slots if they
            still exist in the new grid.
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
