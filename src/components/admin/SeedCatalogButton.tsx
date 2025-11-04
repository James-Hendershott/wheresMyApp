"use client";

import { useFormState } from "react-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { seedContainerTypes } from "@/app/actions/containerTypeSeed";

type Result = { success?: string; error?: string };

export function SeedCatalogButton() {
  const action = async (_prev: Result, _fd: FormData) => {
    return await seedContainerTypes();
  };
  const [state, formAction] = useFormState<Result, FormData>(action, {});

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <button
        type="submit"
        className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        title="Seeds the standard catalog (idempotent)"
      >
        Seed Standard Types
      </button>
    </form>
  );
}
