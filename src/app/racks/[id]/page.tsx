// WHY: Visual SVG grid for a single rack, showing where each container is placed
// WHAT: Fetches rack by id, renders SVG grid (rows × cols), shows containers in slots
// HOW: Server component, ready for future drag/drop and actions

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ContainerTypeIcon } from "@/components/ContainerTypeIcon";

interface RackPageProps {
  params: { id: string };
}

export default async function RackPage({ params }: RackPageProps) {
  const rack = await prisma.rack.findUnique({
    where: { id: params.id },
    include: {
      location: true,
      slots: {
        include: {
          container: true,
        },
      },
    },
  });
  if (!rack) return notFound();

  // SVG grid dimensions
  const cellSize = 60;
  const width = rack.cols * cellSize;
  const height = rack.rows * cellSize;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-bold">{rack.name}</h1>
      <div className="mb-4 text-gray-500">
        Location: {rack.location?.name || "Unknown"}
      </div>
      <svg width={width} height={height} className="rounded border bg-gray-50">
        {/* Draw grid */}
        {[...Array(rack.rows)].map((_, row) =>
          [...Array(rack.cols)].map((_, col) => {
            const slot = rack.slots.find((s) => s.row === row && s.col === col);
            const hasContainer = slot && slot.container;
            return (
              <g key={`${row}-${col}`}>
                <rect
                  x={col * cellSize}
                  y={row * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={hasContainer ? "#dbeafe" : "#fff"}
                  stroke="#94a3b8"
                  strokeWidth={1}
                  rx={8}
                />
                {hasContainer && (
                  <text
                    x={col * cellSize + cellSize / 2}
                    y={row * cellSize + cellSize / 2}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize={14}
                    fill="#2563eb"
                  >
                    {slot!.container!.label}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
      {/* Legend with icons */}
      <div className="mt-6 rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Containers in this rack</h2>
        {rack.slots.filter((s) => s.container).length === 0 ? (
          <p className="text-sm text-gray-500">No containers placed yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {rack.slots
              .filter((s) => s.container)
              .map((s) => (
                <li key={s!.id} className="flex items-center gap-2">
                  <ContainerTypeIcon typeName={s!.container!.type as string | undefined} />
                  <span className="font-medium">{s!.container!.label}</span>
                  <span className="text-gray-500">[row {s!.row}, col {s!.col}]</span>
                </li>
              ))}
          </ul>
        )}
      </div>
      <div className="mt-6">
        <a href="/racks" className="text-blue-600 hover:underline">
          ← Back to Inventory Map
        </a>
      </div>
    </main>
  );
}
