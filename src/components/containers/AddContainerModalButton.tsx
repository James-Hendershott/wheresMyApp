"use client";

// WHY: Button that opens a modal with AddContainerForm without leaving the page
// WHAT: Simple CSS modal overlay/dialog; uses existing AddContainerForm

import { useState } from "react";
import { AddContainerForm } from "@/components/CrudFormsClient";

export function AddContainerModalButton({
  slots,
  containerTypes,
  typeCounts,
}: {
  slots: { id: string; label: string }[];
  containerTypes?: { id: string; name: string; codePrefix: string }[];
  typeCounts?: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        + Add Container
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-md bg-white p-4 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Container</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <AddContainerForm
              slots={slots}
              containerTypes={containerTypes}
              typeCounts={typeCounts}
            />
          </div>
        </div>
      )}
    </>
  );
}
