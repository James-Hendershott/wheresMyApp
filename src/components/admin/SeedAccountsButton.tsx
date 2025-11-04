"use client";

// WHY: Client button to seed test accounts
// WHAT: Calls server action to upsert test admin and user; shows toasts

import { useState } from "react";
import { toast } from "sonner";
import { seedTestAccounts } from "@/app/actions/seedAccounts";

export function SeedAccountsButton() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    const res = await seedTestAccounts();
    if (res.error) toast.error(res.error);
    else toast.success(res.success || "Accounts seeded");
    setLoading(false);
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Seeding…" : "Seed Test Accounts"}
    </button>
  );
}
