// WHY: Client-side CRUD forms with user feedback via toast notifications
// WHAT: Forms that show success/error messages when creating locations, racks, containers, items
// HOW: Use useFormState hook to get server action responses and display them with sonner toast

"use client";

import { useFormState } from "react-dom";
import { useEffect, useRef } from "react";
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
          defaultValue={3}
          placeholder="Rows"
          className={inputClass}
          required
        />
        <input
          name="cols"
          type="number"
          min={1}
          defaultValue={4}
          placeholder="Columns"
          className={inputClass}
          required
        />
      </div>
      <button type="submit" className={buttonClass}>
        Add Rack
      </button>
    </form>
  );
}

export function AddContainerForm({
  slots,
}: {
  slots: { id: string; label: string }[];
}) {
  const [state, formAction] = useFormState<FormResult, FormData>(
    createContainerWrapper,
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
      <h2 className="mb-2 font-bold">Add Container (Tote)</h2>
      <input
        name="code"
        placeholder="Tote code (e.g. TOTE-11)"
        className={inputClass}
        required
      />
      <input
        name="label"
        placeholder="Label (e.g. Red Tote)"
        className={inputClass}
        required
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
