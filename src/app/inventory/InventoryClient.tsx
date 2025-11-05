// WHY: Client-side filtering, search, and export for inventory items
// WHAT: Interactive UI with filters, search bar, status management, and CSV export
// HOW: useState for filters, client-side filtering, download CSV functionality

"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Download, Filter, Search, Package, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatSlotLabel } from "@/lib/slotLabels";
import { ItemActionsMenu } from "@/components/items/ItemActionsMenu";

type ItemWithRelations = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  category: string | null;
  condition: string | null;
  status: string;
  tags: string[];
  createdAt: Date;
  container: {
    id: string;
    code: string;
    label: string;
    currentSlot: {
      row: number;
      col: number;
      rack: {
        name: string;
        location: {
          name: string;
        };
      };
    } | null;
  } | null;
  photos: {
    url: string;
  }[];
};

type Container = {
  id: string;
  code: string;
  label: string;
};

interface InventoryClientProps {
  items: ItemWithRelations[];
  containers: Container[];
}

export function InventoryClient({ items, containers }: InventoryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [containerFilter, setContainerFilter] = useState<string>("all");

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(search);
        const matchesDescription = item.description
          ?.toLowerCase()
          .includes(search);
        const matchesTags = item.tags.some((tag) =>
          tag.toLowerCase().includes(search)
        );
        if (!matchesName && !matchesDescription && !matchesTags) return false;
      }

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter)
        return false;

      // Container filter
      if (containerFilter !== "all" && item.container?.id !== containerFilter)
        return false;

      return true;
    });
  }, [items, searchTerm, statusFilter, categoryFilter, containerFilter]);

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "Name",
      "Description",
      "Quantity",
      "Category",
      "Condition",
      "Status",
      "Container",
      "Location",
      "Rack",
      "Slot",
      "Tags",
      "Photos",
      "Created",
    ];

    const rows = filteredItems.map((item) => {
      const location =
        item.container?.currentSlot?.rack.location.name || "Unassigned";
      const rack = item.container?.currentSlot?.rack.name || "";
      const slot = item.container?.currentSlot
        ? formatSlotLabel(
            item.container.currentSlot.row,
            item.container.currentSlot.col
          )
        : "";

      return [
        item.name,
        item.description || "",
        item.quantity.toString(),
        item.category || "",
        item.condition || "",
        item.status,
        item.container?.label || "None",
        location,
        rack,
        slot,
        item.tags.join("; "),
        item.photos.length.toString(),
        new Date(item.createdAt).toLocaleDateString(),
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Inventory</h1>
          <p className="mt-1 text-gray-600">
            {filteredItems.length} of {items.length} items
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="IN_STORAGE">In Storage</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="IN_USE">In Use</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Container Filter */}
          <select
            value={containerFilter}
            onChange={(e) => setContainerFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Containers</option>
            {containers.map((container) => (
              <option key={container.id} value={container.id}>
                {container.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters Summary */}
        {(searchTerm ||
          statusFilter !== "all" ||
          categoryFilter !== "all" ||
          containerFilter !== "all") && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                Status: {statusFilter.replace(/_/g, " ")}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                Category: {categoryFilter.replace(/_/g, " ")}
                <button
                  onClick={() => setCategoryFilter("all")}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setContainerFilter("all");
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-lg text-gray-500">
            {items.length === 0
              ? "No items yet. Add your first item!"
              : "No items match your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className={`flex flex-col rounded-lg border p-4 transition hover:border-blue-400 hover:bg-blue-50 ${
                  item.status === "CHECKED_OUT"
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {/* Photo */}
                <div className="mb-3">
                  {item.photos.length > 0 ? (
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={item.photos[0].url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                        item.status === "IN_STORAGE"
                          ? "bg-green-100 text-green-700"
                          : item.status === "CHECKED_OUT"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.status === "IN_STORAGE"
                        ? "In Storage"
                        : item.status === "CHECKED_OUT"
                          ? "Checked Out"
                          : "In Use"}
                    </span>
                  </div>

                  {item.description && (
                    <p className="line-clamp-2 text-sm text-gray-600">
                      {item.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="space-y-1 text-xs text-gray-600">
                    {item.quantity > 1 && (
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>Qty: {item.quantity}</span>
                      </div>
                    )}
                    {item.container && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {item.container.label}
                          {item.container.currentSlot?.rack.name &&
                            ` → ${item.container.currentSlot.rack.name}`}
                          {item.container.currentSlot &&
                            ` ${formatSlotLabel(item.container.currentSlot.row, item.container.currentSlot.col)}`}
                        </span>
                      </div>
                    )}
                    {item.category && (
                      <div className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {item.category.replace(/_/g, " ")}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions - use menu dropdown to save space */}
                <div className="mt-3 border-t pt-3">
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
                      containerId: item.container?.id || null,
                    }}
                    containers={containers}
                    layout="menu"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
