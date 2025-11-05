// WHY: Provide item management actions (check-out/in, move, edit, remove)
// WHAT: Dropdown menu with action buttons for each item
// HOW: Client component using Dialog for confirmations and server actions

"use client";

import { useState } from "react";
import { MoreVertical, LogOut, LogIn, Move, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  checkOutItem,
  checkInItem,
  moveItemToContainer,
  removeItemPermanently,
  editItemDetails,
} from "@/app/actions/itemActions";
import { toast } from "sonner";

type Container = {
  id: string;
  label: string;
};

type Item = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  quantity: number;
  condition: string | null;
  category: string | null;
  containerId: string | null;
};

interface ItemActionsMenuProps {
  item: Item;
  containers: Container[];
  onSuccess?: () => void;
}

export function ItemActionsMenu({
  item,
  containers,
  onSuccess,
}: ItemActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckOut = async () => {
    setIsSubmitting(true);
    const result = await checkOutItem(item.id);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Item checked out successfully");
      setIsOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error || "Failed to check out item");
    }
  };

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    const result = await checkInItem(item.id);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Item checked in successfully");
      setIsOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error || "Failed to check in item");
    }
  };

  const handleMove = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await moveItemToContainer(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Item moved successfully");
      setShowMoveDialog(false);
      setIsOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error || "Failed to move item");
    }
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await editItemDetails(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Item updated successfully");
      setShowEditDialog(false);
      setIsOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error || "Failed to update item");
    }
  };

  const handleRemove = async () => {
    setIsSubmitting(true);
    const result = await removeItemPermanently(item.id);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Item removed permanently");
      setShowRemoveDialog(false);
      setIsOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error || "Failed to remove item");
    }
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 p-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border bg-white shadow-lg">
            <div className="py-1">
              {item.status === "IN_STORAGE" ? (
                <button
                  onClick={handleCheckOut}
                  disabled={isSubmitting}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  Check Out
                </button>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={isSubmitting}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <LogIn className="h-4 w-4" />
                  Check In
                </button>
              )}

              <button
                onClick={() => {
                  setShowMoveDialog(true);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Move className="h-4 w-4" />
                Move to Container
              </button>

              <button
                onClick={() => {
                  setShowEditDialog(true);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="h-4 w-4" />
                Edit Item
              </button>

              <button
                onClick={() => {
                  setShowRemoveDialog(true);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Item to Different Container</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMove} className="space-y-4">
            <input type="hidden" name="itemId" value={item.id} />
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Target Container
              </label>
              <select
                name="targetContainerId"
                required
                className="mt-1 w-full rounded border px-3 py-2"
              >
                <option value="">Select container...</option>
                {containers
                  .filter((c) => c.id !== item.containerId)
                  .map((container) => (
                    <option key={container.id} value={container.id}>
                      {container.label}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMoveDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Moving..." : "Move Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <input type="hidden" name="itemId" value={item.id} />
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={item.name}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={item.description || ""}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                defaultValue={item.quantity}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Condition
              </label>
              <select
                name="condition"
                defaultValue={item.condition || ""}
                className="mt-1 w-full rounded border px-3 py-2"
              >
                <option value="">Select...</option>
                <option value="UNOPENED">Unopened</option>
                <option value="OPENED_COMPLETE">Opened - Complete</option>
                <option value="OPENED_MISSING">Opened - Missing Parts</option>
                <option value="USED">Used</option>
                <option value="DAMAGED">Damaged</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                defaultValue={item.category || ""}
                className="mt-1 w-full rounded border px-3 py-2"
              >
                <option value="">Select...</option>
                <option value="BOOKS">Books</option>
                <option value="GAMES_HOBBIES">Games & Hobbies</option>
                <option value="CAMPING_OUTDOORS">Camping & Outdoors</option>
                <option value="TOOLS_GEAR">Tools & Gear</option>
                <option value="COOKING">Cooking</option>
                <option value="CLEANING">Cleaning</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="LIGHTS">Lights</option>
                <option value="FIRST_AID">First Aid</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="CLOTHES">Clothes</option>
                <option value="CORDAGE">Cordage</option>
                <option value="TECH_MEDIA">Tech & Media</option>
                <option value="MISC">Miscellaneous</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
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

      {/* Remove Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Item Permanently</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently remove{" "}
              <strong>{item.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRemoveDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemove}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? "Removing..." : "Remove Permanently"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
