// WHY: Client-side CRUD forms with user feedback via toast notifications
// WHAT: Forms that show success/error messages when creating locations, racks, containers, items
// HOW: Use useFormState hook to get server action responses and display them with sonner toast

"use client";

import { useFormState } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createLocation } from "@/app/actions/locationActions";
import { createRack } from "@/app/actions/rackActions";
import { createContainer } from "@/app/actions/containerActions";
import { createItem } from "@/app/actions/itemActions";

const inputClass = "mb-2 w-full rounded border p-2";
const buttonClass =
  "inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50";

type FormResult = {
  success?: string;
  error?: string;
};

// Wrapper functions to match useFormState signature (state, formData) => result
async function createLocationWrapper(
  _prevState: FormResult,
  formData: FormData
): Promise<FormResult> {
  return await createLocation(formData);
}

async function createRackWrapper(
  _prevState: FormResult,
  formData: FormData
): Promise<FormResult> {
  return await createRack(formData);
}

async function createContainerWrapper(
  _prevState: FormResult,
  formData: FormData
): Promise<FormResult> {
  return await createContainer(formData);
}

async function createItemWrapper(
  _prevState: FormResult,
  formData: FormData
): Promise<FormResult> {
  return await createItem(formData);
}

export function AddLocationForm() {
  const [state, formAction] = useFormState<FormResult, FormData>(
    createLocationWrapper,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      formRef.current?.reset();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mb-4 rounded border p-4">
      <h2 className="mb-2 font-bold">Add Location</h2>
      <input
        name="name"
        placeholder="Location name"
        className={inputClass}
        required
      />
      <input
        name="notes"
        placeholder="Notes (optional)"
        className={inputClass}
      />
      <button type="submit" className={buttonClass}>
        Add Location
      </button>
    </form>
  );
}

export function AddRackForm({
  locations,
}: {
  locations: { id: string; name: string }[];
}) {
  const [state, formAction] = useFormState<FormResult, FormData>(
    createRackWrapper,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      formRef.current?.reset();
      setRows(3);
      setCols(4);
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  // Generate slot labels (A1, A2, B1, B2, etc.)
  const generateSlotLabel = (rowIndex: number, colIndex: number) => {
    const rowLabel = String.fromCharCode(65 + rowIndex); // A, B, C, ...
    return `${rowLabel}${colIndex + 1}`;
  };

  return (
    <form ref={formRef} action={formAction} className="mb-4 rounded border p-4">
      <h2 className="mb-2 font-bold">Add Rack</h2>
      <input
        name="name"
        placeholder="Rack name"
        className={inputClass}
        required
      />
      <select name="locationId" className={inputClass} required>
        <option value="">Select location</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input
          name="rows"
          type="number"
          min={1}
          max={26}
          value={rows}
          onChange={(e) => setRows(Math.max(1, Math.min(26, parseInt(e.target.value) || 1)))}
          placeholder="Rows"
          className={inputClass}
          required
        />
        <input
          name="cols"
          type="number"
          min={1}
          max={20}
          value={cols}
          onChange={(e) => setCols(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
          placeholder="Columns"
          className={inputClass}
          required
        />
      </div>
      
      {/* Visual Preview */}
      <div className="my-4 rounded-md bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          Preview: {rows} rows × {cols} columns ({rows * cols} slots)
        </h3>
        <div 
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: rows }, (_, rowIndex) =>
            Array.from({ length: cols }, (_, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="flex aspect-square items-center justify-center rounded border border-gray-300 bg-white text-xs font-medium text-gray-600 shadow-sm"
              >
                {generateSlotLabel(rowIndex, colIndex)}
              </div>
            ))
          )}
        </div>
      </div>

      <button type="submit" className={buttonClass}>
        Add Rack
      </button>
    </form>
  );
}

export function AddContainerForm({
  slots,
  containerTypes,
  typeCounts,
}: {
  slots: { id: string; label: string }[];
  containerTypes?: { id: string; name: string; codePrefix: string }[];
  typeCounts?: Record<string, number>;
}) {
  const [state, formAction] = useFormState<FormResult, FormData>(
    createContainerWrapper,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const codeRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);
  const selectedType = selectedTypeId
    ? containerTypes?.find((t) => t.id === selectedTypeId)
    : undefined;

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      formRef.current?.reset();
      setSelectedTypeId("");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mb-4 rounded border p-4">
      <h2 className="mb-2 font-bold">Add Container (Tote)</h2>
      {containerTypes && containerTypes.length > 0 ? (
        <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select container type (optional)</option>
            {containerTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.codePrefix})
              </option>
            ))}
          </select>
          {selectedTypeId && typeCounts && (
            <div className="flex items-center text-sm text-gray-600">
              Next number: {(typeCounts[selectedTypeId] ?? 0) + 1}
            </div>
          )}
          {selectedTypeId && typeCounts && (
            <button
              type="button"
              onClick={() => {
                const t = containerTypes?.find((x) => x.id === selectedTypeId);
                if (!t) return;
                const next = (typeCounts[selectedTypeId] ?? 0) + 1;
                const suggestedCode = `${t.codePrefix}-${next}`;
                const suggestedLabel = `${t.name} #${next}`;
                if (codeRef.current) codeRef.current.value = suggestedCode;
                if (labelRef.current) labelRef.current.value = suggestedLabel;
              }}
              className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Autofill code/label
            </button>
          )}
        </div>
      ) : (
        <p className="mb-2 text-sm text-gray-500">
          No container types yet. Add some under Admin → Container Types.
        </p>
      )}
      {/* Hidden fields to carry type info to server for legacy string storage and possible code fallback */}
      {selectedType && (
        <>
          <input type="hidden" name="typeName" value={selectedType.name} />
          <input type="hidden" name="codePrefix" value={selectedType.codePrefix} />
          <input
            type="hidden"
            name="suggestedNextNumber"
            value={((typeCounts?.[selectedType.id] ?? 0) + 1).toString()}
          />
        </>
      )}
      <input
        name="code"
        placeholder="Tote code (e.g. TOTE-11)"
        className={inputClass}
        required
        ref={codeRef}
      />
      <input
        name="label"
        placeholder="Label (e.g. Red Tote)"
        className={inputClass}
        required
        ref={labelRef}
      />
      <input
        name="description"
        placeholder="Description (optional)"
        className={inputClass}
      />
      <select name="slotId" className={inputClass}>
        <option value="">Assign to slot (optional)</option>
        {slots.map((slot) => (
          <option key={slot.id} value={slot.id}>
            {slot.label}
          </option>
        ))}
      </select>
      <button type="submit" className={buttonClass}>
        Add Container
      </button>
    </form>
  );
}

export function AddItemForm({
  containers,
}: {
  containers: { id: string; label: string }[];
}) {
  const [state, formAction] = useFormState<FormResult, FormData>(
    createItemWrapper,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      formRef.current?.reset();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mb-4 rounded border p-4">
      <h2 className="mb-2 font-bold">Add Item</h2>
      <input
        name="name"
        placeholder="Item name"
        className={inputClass}
        required
      />
      <input
        name="description"
        placeholder="Description (optional)"
        className={inputClass}
      />
      <select name="containerId" className={inputClass}>
        <option value="">Assign to container (optional)</option>
        {containers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <button type="submit" className={buttonClass}>
        Add Item
      </button>
    </form>
  );
}
