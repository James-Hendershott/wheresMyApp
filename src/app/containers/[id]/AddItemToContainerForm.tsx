// WHY: Simplified form to add items directly to a specific container
// WHAT: Client form with Server Action for adding items with tags, description, and volume
// HOW: Pre-fills containerId, calls createItem action, supports items as containers

"use client";
import { createItem } from "@/app/actions/itemActions";
import { useState } from "react";

export function AddItemToContainerForm({
  containerId,
}: {
  containerId: string;
}) {
  const [isContainer, setIsContainer] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    if (!isContainer) {
      formData.set("containerId", containerId);
    }
    formData.set("status", "IN_STORAGE");
    formData.set("isContainer", isContainer.toString());
    await createItem(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-3">
      {!isContainer && (
        <>
          <input type="hidden" name="containerId" value={containerId} />
        </>
      )}
      <input type="hidden" name="status" value="IN_STORAGE" />
      <div>
        <input
          name="name"
          placeholder="Item name (e.g., Winter Jacket)"
          className="w-full rounded border p-2"
          required
        />
      </div>
      <div>
        <textarea
          name="description"
          placeholder="Description, ISBN, or notes (optional)"
          className="w-full rounded border p-2"
          rows={3}
        />
      </div>
      <div>
        <input
          name="tags"
          placeholder="Tags (comma-separated: books, clothing, etc.)"
          className="w-full rounded border p-2"
        />
      </div>
      <div>
        <input
          name="volume"
          type="number"
          step="0.1"
          placeholder="Volume in cubic inches (optional)"
          className="w-full rounded border p-2"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isContainer"
          checked={isContainer}
          onChange={(e) => setIsContainer(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="isContainer" className="text-sm">
          This item acts as its own container
        </label>
      </div>
      {isContainer && (
        <div className="rounded bg-blue-50 p-3 text-sm text-blue-700">
          ℹ️ This item will be added as a standalone container item. Assign it
          to a rack slot from the locations or racks page.
        </div>
      )}
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Add Item
      </button>
    </form>
  );
}
