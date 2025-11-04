"use client";

// WHY: Client button to run container migration (dry-run + apply)
// WHAT: Calls migrateContainersToTypes action and displays results

import { useState } from "react";
import { toast } from "sonner";
import {
  migrateContainersToTypes,
  type MigrationResult,
} from "@/app/actions/containerMigration";

export function MigrateContainersButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const handleDryRun = async () => {
    setLoading(true);
    try {
      const res = await migrateContainersToTypes(true);
      setResult(res);
      toast.info(
        `Dry-run complete: ${res.matched} matched, ${res.unmatched} unmatched`
      );
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Dry-run failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (
      !window.confirm(
        "Apply migration? This will update containerTypeId for matched containers."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await migrateContainersToTypes(false);
      setResult(res);
      toast.success(`Migration applied: ${res.matched} containers updated`);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Migration failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const buttonClass =
    "rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50";
  const dangerClass =
    "rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleDryRun}
          disabled={loading}
          className={buttonClass}
        >
          {loading ? "Running..." : "Dry-Run (Preview)"}
        </button>
        <button
          onClick={handleApply}
          disabled={loading || !result || result.matched === 0}
          className={dangerClass}
        >
          Apply Migration
        </button>
      </div>

      {result && (
        <div className="rounded border bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold">
            {result.dryRun ? "Dry-Run Results" : "Migration Results"}
          </h3>
          <div className="mb-3 text-sm">
            <p>
              <strong>Total Containers:</strong> {result.totalContainers}
            </p>
            <p className="text-green-600">
              <strong>Matched:</strong> {result.matched}
            </p>
            <p className="text-orange-600">
              <strong>Unmatched:</strong> {result.unmatched}
            </p>
          </div>

          {result.details.length > 0 && (
            <div className="max-h-96 overflow-y-auto rounded border bg-white">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-100">
                  <tr className="text-left">
                    <th className="p-2">Container Code</th>
                    <th className="p-2">Legacy Type</th>
                    <th className="p-2">Matched Type</th>
                  </tr>
                </thead>
                <tbody>
                  {result.details.map((d, idx) => (
                    <tr
                      key={idx}
                      className={`border-t ${d.matchedTypeName ? "bg-green-50" : "bg-orange-50"}`}
                    >
                      <td className="p-2">{d.containerCode}</td>
                      <td className="p-2">{d.legacyType || "—"}</td>
                      <td className="p-2">
                        {d.matchedTypeName || (
                          <em className="text-gray-500">No match</em>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
