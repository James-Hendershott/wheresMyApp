"use client";

import { useState, useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { ICON_OPTIONS } from "@/lib/iconKeys";

type FormResult = { success?: string; error?: string };

export function ContainerTypeRow({
  type,
  onUpdate,
  onDelete,
}: {
  type: {
    id: string;
    name: string;
    codePrefix: string;
    iconKey?: string | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
  };
  onUpdate: (id: string, formData: FormData) => Promise<FormResult>;
  onDelete: (id: string) => Promise<{ success?: boolean; error?: string }>;
}) {
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const actionWrapper = async (_prev: FormResult, formData: FormData) => {
    return onUpdate(type.id, formData);
  };
  const [state, formAction] = useFormState<FormResult, FormData>(
    actionWrapper,
    {}
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setEditing(false);
      formRef.current?.reset();
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  const handleDelete = async () => {
    if (!confirm(`Delete container type "${type.name}"?`)) return;
    const res = await onDelete(type.id);
    if (res.error) toast.error(res.error);
    else toast.success("Type deleted");
  };

  const cell = "p-2";
  const input =
    "w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring";
  const button =
    "rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700";
  const danger =
    "rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700";

  if (!editing) {
    return (
      <tr className="border-t">
        <td className={cell}>{type.name}</td>
        <td className={cell}>{type.codePrefix}</td>
        <td className={cell}>{type.iconKey || "—"}</td>
        <td className={cell}>
          {type.length || type.width || type.height
            ? `${type.length ?? "?"} × ${type.width ?? "?"} × ${type.height ?? "?"}`
            : "—"}
        </td>
        <td className={`${cell} text-right`}>
          <button className={button} onClick={() => setEditing(true)}>
            Edit
          </button>
          <button className={`${danger} ml-2`} onClick={handleDelete}>
            Delete
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t bg-blue-50/30">
      <td colSpan={5} className="p-2">
        <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          <input name="name" defaultValue={type.name} className={input} required />
          <input name="codePrefix" defaultValue={type.codePrefix} className={input} required />
          <select name="iconKey" defaultValue={type.iconKey ?? ""} className={input}>
            {ICON_OPTIONS.map((opt: typeof ICON_OPTIONS[number]) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input name="length" defaultValue={type.length ?? ""} className={input} type="number" min={1} />
            <input name="width" defaultValue={type.width ?? ""} className={input} type="number" min={1} />
            <input name="height" defaultValue={type.height ?? ""} className={input} type="number" min={1} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="rounded px-3 py-1 text-xs" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className={button}>
              Save
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}
