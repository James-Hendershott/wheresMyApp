// WHY: Admin page to migrate legacy containers to ContainerType system
// WHAT: Dry-run preview + apply migration

import { MigrateContainersButton } from "@/components/admin/MigrateContainersButton";

export const dynamic = "force-dynamic";

export default async function MigrateContainersPage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Migrate Containers to Types</h1>

      <section className="mb-6 rounded border bg-blue-50 p-4">
        <h2 className="mb-2 text-lg font-semibold">About This Tool</h2>
        <p className="mb-2 text-sm text-gray-700">
          This tool migrates existing containers from the legacy{" "}
          <code>type</code> string field to the new <code>ContainerType</code>{" "}
          system with <code>containerTypeId</code> references.
        </p>
        <p className="text-sm text-gray-700">
          <strong>How it works:</strong> The tool matches containers by name
          (e.g., "27 Gallon Tote") or by code prefix (e.g., "TOTE27-1" → TOTE27
          type). Unmatched containers are listed for manual review.
        </p>
      </section>

      <section className="rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Run Migration</h2>
        <MigrateContainersButton />
      </section>
    </main>
  );
}
