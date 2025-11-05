// WHY: Provide item management actions (check-out/in, move, edit, remove)
// WHAT: Dropdown menu with action buttons for each item
// HOW: Client component using Dialog for confirmations and server actions

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  subcategory: string | null;
  containerId: string | null;
};

interface ItemActionsMenuProps {
  item: Item;
  containers: Container[];
  onSuccess?: () => void;
  layout?: "menu" | "buttons"; // menu: kebab dropdown, buttons: inline toolbar
  quickMove?: boolean; // when true, show a compact inline select to move immediately
  iconOnly?: boolean; // when true, render icon-only buttons (use title for a11y)
}

export function ItemActionsMenu({
  item,
  containers,
  onSuccess,
  layout = "menu",
  quickMove = false,
  iconOnly = false,
}: ItemActionsMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickMoving, setIsQuickMoving] = useState(false);

  const handleQuickMoveChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const targetContainerId = event.target.value;
    if (!targetContainerId) return;

    setIsQuickMoving(true);
    const formData = new FormData();
    formData.append("itemId", item.id);
    formData.append("targetContainerId", targetContainerId);
    const result = await moveItemToContainer(formData);
    setIsQuickMoving(false);

    if (result.success) {
      toast.success("Item moved successfully");
      onSuccess?.();
      router.refresh();
    } else {
      toast.error(result.error || "Failed to move item");
    }

    // reset select back to placeholder
    event.currentTarget.value = "";
  };

  const handleCheckOut = async () => {
    setIsSubmitting(true);
    const result = await checkOutItem(item.id);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Item checked out successfully");
      setIsOpen(false);
      onSuccess?.();
      router.refresh();
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
      router.refresh();
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
      router.refresh();
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
      router.refresh();
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
      router.refresh();
    } else {
      toast.error(result.error || "Failed to remove item");
    }
  };

  return (
    <>
      {layout === "menu" ? (
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
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={
              item.status === "IN_STORAGE" ? handleCheckOut : handleCheckIn
            }
            disabled={isSubmitting}
            className={iconOnly ? "p-2" : "gap-1"}
            title={item.status === "IN_STORAGE" ? "Check Out" : "Check In"}
            aria-label={item.status === "IN_STORAGE" ? "Check Out" : "Check In"}
          >
            {item.status === "IN_STORAGE" ? (
              <LogOut className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {!iconOnly &&
              (item.status === "IN_STORAGE" ? "Check Out" : "Check In")}
          </Button>

          {quickMove && (
            <select
              onChange={handleQuickMoveChange}
              disabled={isQuickMoving}
              className="h-8 rounded border px-2 text-sm"
              title="Quick move to container"
              aria-label="Quick move to container"
              defaultValue=""
            >
              <option value="" disabled>
                Move…
              </option>
              {containers
                .filter((c) => c.id !== item.containerId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
            </select>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMoveDialog(true)}
            className={iconOnly ? "p-2" : "gap-1"}
            title="Move (advanced)"
            aria-label="Move (advanced)"
          >
            <Move className="h-4 w-4" />
            {!iconOnly && "Move"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowEditDialog(true)}
            className={iconOnly ? "p-2" : "gap-1"}
            title="Edit item"
            aria-label="Edit item"
          >
            <Edit className="h-4 w-4" />
            {!iconOnly && "Edit"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowRemoveDialog(true)}
            className={iconOnly ? "p-2" : "gap-1"}
            title="Remove item"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
            {!iconOnly && "Remove"}
          </Button>
        </div>
      )}

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
                <option value="BOOKS_MEDIA">Books & Media</option>
                <option value="GAMES_HOBBIES">Games & Hobbies</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="HOBBIES">Hobbies & Crafts</option>
                <option value="CAMPING_OUTDOORS">Camping & Outdoors</option>
                <option value="OUTDOOR">Outdoor Gear</option>
                <option value="TOOLS_GEAR">Tools & Gear</option>
                <option value="TOOLS_HARDWARE">Tools & Hardware</option>
                <option value="COOKING">Cooking</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="CLEANING">Cleaning</option>
                <option value="HOUSEHOLD">Household</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="COMPUTING">Computing</option>
                <option value="AUDIO">Audio</option>
                <option value="LIGHTS">Lights</option>
                <option value="LIGHTING">Lighting</option>
                <option value="FIRST_AID">First Aid</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="SAFETY">Safety</option>
                <option value="CLOTHES">Clothes</option>
                <option value="CLOTHING_TEXTILES">Clothing & Textiles</option>
                <option value="CORDAGE">Cordage</option>
                <option value="ROPES">Ropes & Cordage</option>
                <option value="TECH_MEDIA">Tech & Media</option>
                <option value="SPORTS_FITNESS">Sports & Fitness</option>
                <option value="OFFICE">Office</option>
                <option value="SEASONAL">Seasonal</option>
                <option value="AUTOMOTIVE">Automotive</option>
                <option value="GARDEN">Garden</option>
                <option value="TOYS">Toys</option>
                <option value="HOME_GOODS">Home Goods</option>
                <option value="MISC">Miscellaneous</option>
                <option value="MISCELLANEOUS">Miscellaneous (alt)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subcategory (optional)
              </label>
              <select
                name="subcategory"
                defaultValue={item.subcategory || ""}
                className="mt-1 w-full rounded border px-3 py-2"
              >
                <option value="">Select...</option>
                <optgroup label="Books & Media">
                  <option value="BOOKS_NOVELS">Books - Novels</option>
                  <option value="BOOKS_REFERENCE">Books - Reference</option>
                  <option value="MEDIA_DVDS">Media - DVDs</option>
                  <option value="MEDIA_MUSIC">Media - Music</option>
                </optgroup>
                <optgroup label="Games & Hobbies">
                  <option value="GAMES_BOARD">Games - Board</option>
                  <option value="GAMES_VIDEO">Games - Video</option>
                  <option value="HOBBIES_CRAFTS">Hobbies & Crafts</option>
                </optgroup>
                <optgroup label="Camping & Outdoors">
                  <option value="CAMPING_TENTS">Camping - Tents</option>
                  <option value="CAMPING_SLEEPING">Camping - Sleeping</option>
                  <option value="CAMPING_COOKING">Camping - Cooking</option>
                </optgroup>
                <optgroup label="Tools">
                  <option value="TOOLS_HAND">Tools - Hand</option>
                  <option value="TOOLS_POWER">Tools - Power</option>
                  <option value="TOOLS_FASTENERS">Tools - Fasteners</option>
                </optgroup>
                <optgroup label="Electronics">
                  <option value="ELECTRONICS_COMPUTING">
                    Electronics - Computing
                  </option>
                  <option value="ELECTRONICS_AUDIO">Electronics - Audio</option>
                  <option value="ELECTRONICS_ACCESSORIES">
                    Electronics - Accessories
                  </option>
                </optgroup>
                <optgroup label="Kitchen & Household">
                  <option value="KITCHEN_APPLIANCES">
                    Kitchen - Appliances
                  </option>
                  <option value="KITCHEN_UTENSILS">Kitchen - Utensils</option>
                  <option value="CLEANING_SUPPLIES">Cleaning - Supplies</option>
                </optgroup>
                <optgroup label="Safety & Medical">
                  <option value="MEDICAL_FIRST_AID">Medical - First Aid</option>
                  <option value="SAFETY_EMERGENCY">Safety - Emergency</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="MISC_OTHER">Other</option>
                </optgroup>
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
