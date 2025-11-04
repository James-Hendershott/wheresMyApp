"use client";

import { useMemo } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthMenu() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const name = useMemo(
    () => session?.user?.name || session?.user?.email,
    [session]
  );

  return (
    <div className="flex items-center gap-3">
      {loading ? (
        <span className="text-xs text-gray-500">Loading…</span>
      ) : session ? (
        <>
          <Link
            href="/account"
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            {name ? `Hi, ${name}` : "Account"}
          </Link>
          <button
            onClick={() => signOut()}
            className="rounded border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <Link
            href="/register"
            className="rounded border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
          >
            Register
          </Link>
          <button
            onClick={() => signIn()}
            className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            Sign in
          </button>
        </>
      )}
    </div>
  );
}
