// WHY: List all containers grouped by type with item tracking
// WHAT: Server component showing containers organized by type with current/total item counts
// HOW: Fetches containers with items, groups by type, displays with type icons and checkout tracking

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureContainerTypesSchema } from "@/lib/dbEnsure";
import { ContainerTypeIcon } from "@/components/ContainerTypeIcon";
import { AddContainerModalButton } from "@/components/containers/AddContainerModalButton";
import { listContainerTypes } from "@/app/actions/containerTypeActions";
import { formatSlotLabel } from "@/lib/slotLabels";

// Force dynamic rendering - don't prerender at build time
export const dynamic = "force-dynamic";

export default async function ContainersPage() {
  // Defensive: ensure schema pieces exist to match current Prisma Client
  await ensureContainerTypesSchema();
  const [containers, slots, containerTypes] = await Promise.all([
    prisma.container.findMany({
      include: {
        currentSlot: {
          include: {
            rack: {
              include: {
                location: true,
              },
            },
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { label: "asc" },
    }),
    prisma.slot.findMany({
      include: { rack: true },
      orderBy: [{ rack: { name: "asc" } }, { row: "asc" }, { col: "asc" }],
    }),
    listContainerTypes(),
  ]);
  const slotOptions = slots.map((slot) => ({
    id: slot.id,
    label: `${slot.rack?.name || "Rack"} ${formatSlotLabel(slot.row, slot.col)}`,
  }));

  // Group containers by type
  type GroupedContainer = (typeof containers)[0] & {
    typeName: string;
    itemsInStorage: number;
    itemsCheckedOut: number;
    totalItems: number;
  };

  const grouped = new Map<string, GroupedContainer[]>();

  for (const container of containers) {
    const typeName = container.type || "Uncategorized";
    const itemsInStorage = container.items.filter(
      (i) => i.status === "IN_STORAGE"
    ).length;
    const itemsCheckedOut = container.items.filter(
      (i) => i.status === "CHECKED_OUT"
    ).length;
    const totalItems = container.items.length;

    const enhanced: GroupedContainer = {
      ...container,
      typeName,
      itemsInStorage,
      itemsCheckedOut,
      totalItems,
    };

    if (!grouped.has(typeName)) {
      grouped.set(typeName, []);
    }
    grouped.get(typeName)!.push(enhanced);
  }

  // Sort groups: types with containers first, then alphabetically
  const sortedGroups = Array.from(grouped.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold">All Containers</h1>
        <AddContainerModalButton
          slots={slotOptions}
          containerTypes={containerTypes.map((t) => ({
            id: t.id,
            name: t.name,
            codePrefix: t.codePrefix,
          }))}
          typeCounts={(() => {
            const counts: Record<string, number> = {};
            for (const t of containerTypes) counts[t.id] = 0;
            for (const c of containers) {
              const ctId =
                (c as { containerTypeId?: string | null }).containerTypeId ??
                null;
              if (ctId && counts[ctId] !== undefined) counts[ctId] += 1;
            }
            return counts;
          })()}
        />
      </div>

      {sortedGroups.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">
            No containers yet. Add one from the Racks page!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedGroups.map(([typeName, typeContainers]) => (
            <div
              key={typeName}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <ContainerTypeIcon
                  typeName={typeName}
                  className="h-6 w-6 text-gray-700"
                />
                <h2 className="text-2xl font-semibold">{typeName}</h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  {typeContainers.length} container
                  {typeContainers.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(240px, min(300px, 1fr)))",
                }}
              >
                {typeContainers.map((container) => {
                  const location =
                    container.currentSlot?.rack?.location?.name || "Unassigned";
                  const rack = container.currentSlot?.rack?.name || null;
                  const slot = container.currentSlot
                    ? formatSlotLabel(
                        container.currentSlot.row,
                        container.currentSlot.col
                      )
                    : null;

                  return (
                    <Link
                      key={container.id}
                      href={`/containers/${container.id}`}
                      className={`block rounded-lg border p-4 transition hover:border-blue-400 hover:bg-blue-50 ${
                        container.itemsCheckedOut > 0
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {container.label}
                            </span>
                          </div>
                          {container.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {container.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            container.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : container.status === "ARCHIVED"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {container.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div>
                          📍 {location}
                          {rack && ` → ${rack}`}
                          {slot && ` ${slot}`}
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                          <span className="font-medium text-gray-900">
                            {container.itemsInStorage}/{container.totalItems}
                          </span>
                          <span className="text-gray-500">items</span>
                          {container.itemsCheckedOut > 0 && (
                            <span className="ml-1 text-orange-600">
                              ({container.itemsCheckedOut} checked out)
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
