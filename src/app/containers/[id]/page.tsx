// WHY: Container detail page showing all items, QR code, and add/edit capabilities
// WHAT: Displays container info, QR for printing, items list, and add item form
// HOW: Server component with client-side QR display component

import { ItemActionsMenu } from "@/components/items/ItemActionsMenu";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { AddItemToContainerForm } from "./AddItemToContainerForm";

interface ContainerPageProps {
  params: { id: string };
}

export default async function ContainerPage({ params }: ContainerPageProps) {
  const [container, allContainers] = await Promise.all([
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
    prisma.container.findMany({
      select: { id: true, label: true },
      orderBy: { label: "asc" },
    }),
  ]);

  if (!container) return notFound();

  const location = container.currentSlot?.rack?.location?.name || "Unassigned";
  const rack = container.currentSlot?.rack?.name || null;
  const slot = container.currentSlot
    ? `${String.fromCharCode(65 + container.currentSlot.row)}${container.currentSlot.col + 1}`
    : null;

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
            <h1 className="mb-3 text-3xl font-bold">{container.label}</h1>
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
              <div
                key={item.id}
                className={`rounded border p-4 ${
                  item.status === "CHECKED_OUT"
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  {item.photos.length > 0 && (
                    <div className="flex shrink-0 gap-2">
                      {item.photos.slice(0, 2).map((photo) => (
                        <Image
                          key={photo.id}
                          src={photo.url}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {/* Item details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${
                          item.status === "IN_STORAGE"
                            ? "bg-green-100 text-green-700"
                            : item.status === "CHECKED_OUT"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status === "IN_STORAGE"
                          ? "In Storage"
                          : item.status === "CHECKED_OUT"
                            ? "Checked Out"
                            : item.status}
                      </span>
                    </div>

                    {/* Metadata row */}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span>Qty: {item.quantity}</span>
                      {item.condition && (
                        <span>
                          Condition: {item.condition.replace(/_/g, " ")}
                        </span>
                      )}
                      {item.category && (
                        <span>
                          Category: {item.category.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
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
                    )}

                    {/* Actions */}
                    <div className="mt-3">
                      <ItemActionsMenu
                        item={{
                          id: item.id,
                          name: item.name,
                          description: item.description,
                          status: item.status,
                          quantity: item.quantity,
                          condition: item.condition,
                          category: item.category,
                          subcategory: null,
                          containerId: item.containerId,
                        }}
                        containers={allContainers}
                        layout="buttons"
                        iconOnly
                      />
                    </div>
                  </div>
                </div>
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
