// WHY: List all containers with search and quick actions
// WHAT: Server component showing all containers with links to detail pages
// HOW: Fetches containers from DB, displays in grid with status badges

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Package } from "lucide-react";

// Force dynamic rendering - don't prerender at build time
export const dynamic = "force-dynamic";

export default async function ContainersPage() {
  const containers = await prisma.container.findMany({
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
      _count: {
        select: { items: true },
      },
    },
    orderBy: { label: "asc" },
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Containers</h1>
        <Link
          href="/racks"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Add Container
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {containers.map((container) => {
          const location =
            container.currentSlot?.rack?.location?.name || "Unassigned";
          const rack = container.currentSlot?.rack?.name || null;
          const slot = container.currentSlot
            ? `[${container.currentSlot.row},${container.currentSlot.col}]`
            : null;
          return (
            <Link
              key={container.id}
              href={`/containers/${container.id}`}
              className="block rounded-lg border p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">{container.label}</span>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs ${
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
              <div className="mb-1 text-sm text-gray-500">
                Code: {container.code}
              </div>
              <div className="mb-1 text-sm text-gray-600">
                Location: {location}
                {rack && ` → ${rack}`}
                {slot && ` ${slot}`}
              </div>
              <div className="text-sm text-gray-500">
                {container._count.items} items
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
