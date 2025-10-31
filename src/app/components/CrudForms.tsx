// WHY: Unified CRUD forms for Location, Rack, Container, and Item
// WHAT: Exports React components for create/update forms for each entity
// HOW: Uses server actions, Zod validation, and minimal UI for demo

import { useState } from "react";

export function AddLocationForm({ onCreated }: { onCreated?: () => void }) {
  return (
    <form action="/actions/locationActions.createLocation" className="mb-4 p-4 border rounded">
      <h2 className="font-bold mb-2">Add Location</h2>
      <input name="name" placeholder="Location name" className="input input-bordered mb-2 w-full" required />
      <input name="notes" placeholder="Notes (optional)" className="input input-bordered mb-2 w-full" />
      <button type="submit" className="btn btn-primary">Add Location</button>
    </form>
  );
}

export function AddRackForm({ locations, onCreated }: { locations: { id: string; name: string }[]; onCreated?: () => void }) {
  return (
    <form action="/actions/rackActions.createRack" className="mb-4 p-4 border rounded">
      <h2 className="font-bold mb-2">Add Rack</h2>
      <input name="name" placeholder="Rack name" className="input input-bordered mb-2 w-full" required />
      <select name="locationId" className="input input-bordered mb-2 w-full" required>
        <option value="">Select location</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>{loc.name}</option>
        ))}
      </select>
      <input name="rows" type="number" min={1} placeholder="Rows" className="input input-bordered mb-2 w-full" required />
      <input name="cols" type="number" min={1} placeholder="Columns" className="input input-bordered mb-2 w-full" required />
      <button type="submit" className="btn btn-primary">Add Rack</button>
    </form>
  );
}

export function AddContainerForm({ slots, onCreated }: { slots: { id: string; label: string }[]; onCreated?: () => void }) {
  return (
    <form action="/actions/containerActions.createContainer" className="mb-4 p-4 border rounded">
      <h2 className="font-bold mb-2">Add Container (Tote)</h2>
      <input name="code" placeholder="Tote code (e.g. tote-11)" className="input input-bordered mb-2 w-full" required />
      <input name="label" placeholder="Label (e.g. Red Tote)" className="input input-bordered mb-2 w-full" required />
      <input name="description" placeholder="Description (optional)" className="input input-bordered mb-2 w-full" />
      <select name="slotId" className="input input-bordered mb-2 w-full">
        <option value="">Assign to slot (optional)</option>
        {slots.map((slot) => (
          <option key={slot.id} value={slot.id}>{slot.label}</option>
        ))}
      </select>
      <button type="submit" className="btn btn-primary">Add Container</button>
    </form>
  );
}

export function AddItemForm({ containers, onCreated }: { containers: { id: string; label: string }[]; onCreated?: () => void }) {
  return (
    <form action="/actions/itemActions.createItem" className="mb-4 p-4 border rounded">
      <h2 className="font-bold mb-2">Add Item</h2>
      <input name="name" placeholder="Item name" className="input input-bordered mb-2 w-full" required />
      <input name="description" placeholder="Description (optional)" className="input input-bordered mb-2 w-full" />
      <select name="containerId" className="input input-bordered mb-2 w-full">
        <option value="">Assign to container (optional)</option>
        {containers.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>
      <button type="submit" className="btn btn-primary">Add Item</button>
    </form>
  );
}
