"use client";

// WHY: Client form for new users to request account creation
// WHAT: Captures name, email, optional reason; submits to server action for admin approval

import { useFormState } from "react-dom";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { createRegistrationRequest } from "@/app/actions/userActions";

type FormResult = { success?: string; error?: string };

export function RegisterForm() {
  const actionWrapper = async (_prev: FormResult, formData: FormData) => {
    return createRegistrationRequest(formData);
  };
  const [state, formAction] = useFormState<FormResult, FormData>(
    actionWrapper,
    {}
  );
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
  const button =
    "rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 w-full";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded border bg-white p-6 shadow"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input name="name" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          Reason (optional)
        </label>
        <textarea name="reason" className={inputClass} rows={3} />
      </div>
      <button type="submit" className={button}>
        Submit Request
      </button>
    </form>
  );
}
