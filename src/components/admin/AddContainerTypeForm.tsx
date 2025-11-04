"use client";

// WHY: Client form to create a Container Type with toasts
import { useFormState } from "react-dom";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ICON_OPTIONS } from "@/lib/iconKeys";

type FormResult = { success?: string; error?: string };

export function AddContainerTypeForm({
  action,
}: {
  action: (formData: FormData) => Promise<FormResult>;
}) {
  const actionWrapper = async (_prev: FormResult, formData: FormData) => {
    return action(formData);
  };
  const [state, formAction] = useFormState<FormResult, FormData>(actionWrapper, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      formRef.current?.reset();
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  const inputClass =
    "w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring";
  const buttonClass =
    "rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700";

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="name"
          placeholder="Name (e.g., 27 Gallon Tote)"
          required
          className={inputClass}
        />
        <input
          name="codePrefix"
          placeholder="Prefix (e.g., TOTE)"
          required
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="length" placeholder="Length" type="number" min={1} className={inputClass} />
        <input name="width" placeholder="Width" type="number" min={1} className={inputClass} />
        <input name="height" placeholder="Height" type="number" min={1} className={inputClass} />
      </div>
      <select name="iconKey" className={inputClass} defaultValue="">
        {ICON_OPTIONS.map((opt: typeof ICON_OPTIONS[number]) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button type="submit" className={buttonClass}>
        Add Type
      </button>
    </form>
  );
}
