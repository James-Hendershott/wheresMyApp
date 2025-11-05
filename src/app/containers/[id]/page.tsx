// WHY: Container detail page showing all items, QR code, and add/edit capabilities
// WHAT: Displays container info, QR for printing, items list, and add item form
// HOW: Server component with client-side QR display component

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { AddItemToContainerForm } from "./AddItemToContainerForm";
import { EditContainerModalButton } from "@/components/containers/EditContainerModalButton";
import { formatSlotLabel } from "@/lib/slotLabels";

interface ContainerPageProps {
  params: { id: string };
}

export default async function ContainerPage({ params }: ContainerPageProps) {
  const [container, slots] = await Promise.all([
    prisma.container.findUnique({
      where: { id: params.id },
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
          include: {
            photos: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.slot.findMany({
      include: { rack: { include: { location: true } } },
      orderBy: [
        { rack: { location: { name: "asc" } } },
        { rack: { name: "asc" } },
        { row: "asc" },
        { col: "asc" },
      ],
    }),
  ]);

  if (!container) return notFound();

  const location = container.currentSlot?.rack?.location?.name || "Unassigned";
  const rack = container.currentSlot?.rack?.name || null;
  const slot = container.currentSlot
    ? formatSlotLabel(container.currentSlot.row, container.currentSlot.col)
    : null;

  // Format slots for dropdown
  const slotOptions = slots.map((s) => ({
    id: s.id,
    label: `${s.rack?.location?.name || "Unknown"} → ${s.rack?.name || "Unknown"} ${formatSlotLabel(s.row, s.col)}`,
  }));

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Link
          href="/containers"
          className="mb-2 inline-block text-blue-600 hover:underline"
        >
          ← Back to Containers
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-3xl font-bold">{container.label}</h1>
              <EditContainerModalButton
                container={{
                  id: container.id,
                  label: container.label,
                  description: container.description,
                  currentSlotId: container.currentSlotId,
                }}
                slots={slotOptions}
              />
            </div>
            <div className="text-gray-600">
              <div>
                Code:{" "}
                <span className="font-mono font-semibold">
                  {container.code}
                </span>
              </div>
              <div>
                Location: {location}
                {rack && ` → ${rack}`}
                {slot && ` ${slot}`}
              </div>
              {container.description && (
                <div className="mt-2 text-sm">{container.description}</div>
              )}
            </div>
          </div>
          <QRCodeDisplay code={container.code} label={container.label} />
        </div>
      </div>

      {/* Items List */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          Items ({container.items.length})
        </h2>
        {container.items.length === 0 ? (
          <p className="text-gray-500">No items yet. Add one below!</p>
        ) : (
          <div className="space-y-3">
            {container.items.map((item) => (
              <div key={item.id} className="rounded border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    {item.description && (
                      <div className="mt-1 text-sm text-gray-600">
                        {item.description}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      item.status === "IN_STORAGE"
                        ? "bg-blue-100 text-blue-700"
                        : item.status === "CHECKED_OUT"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                {item.photos.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {item.photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={item.name}
                        className="h-16 w-16 rounded object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Form */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <h3 className="mb-3 text-lg font-semibold">Add New Item</h3>
        <AddItemToContainerForm containerId={container.id} />
      </div>
    </main>
  );
}
