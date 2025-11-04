"use client";

// WHY: Client form to edit user profile
// WHAT: Update name and avatar URL; uses formState and toasts

import { useFormState } from "react-dom";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profileActions";

type FormResult = { success?: string; error?: string };
type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function ProfileForm({ user }: { user: User }) {
  const actionWrapper = async (_prev: FormResult, formData: FormData) => {
    return updateProfile(formData);
  };
  const [state, formAction] = useFormState<FormResult, FormData>(
    actionWrapper,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  const inputClass =
    "w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring";
  const button =
    "rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700";

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          name="name"
          defaultValue={user.name || ""}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          value={user.email || ""}
          disabled
          className={`${inputClass} cursor-not-allowed bg-gray-100`}
        />
        <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          Avatar URL (optional)
        </label>
        <input
          name="image"
          defaultValue={user.image || ""}
          type="url"
          className={inputClass}
        />
      </div>
      <button type="submit" className={button}>
        Save Changes
      </button>
    </form>
  );
}
