// WHY: Simplified form to add items directly to a specific container
// WHAT: Client form with Server Action for adding items with tags and description
// HOW: Pre-fills containerId, calls createItem action

"use client";
import { createItem } from "@/app/actions/itemActions";

export function AddItemToContainerForm({
  containerId,
}: {
  containerId: string;
}) {
  const handleSubmit = async (formData: FormData) => {
    formData.set("containerId", containerId);
    formData.set("status", "IN_STORAGE");
    await createItem(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="containerId" value={containerId} />
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
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Add Item
      </button>
    </form>
  );
}
