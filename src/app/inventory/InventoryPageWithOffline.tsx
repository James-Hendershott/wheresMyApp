// WHY: Demonstrates offline-first data loading pattern
// WHAT: Wrapper that caches server data to IndexedDB for offline access
// HOW: Uses useOfflineCache hook to sync server data automatically
// GOTCHA: Must be client component to use hooks

"use client";

import { useOfflineCache } from "@/hooks/useOfflineCache";
import { STORES } from "@/lib/indexedDB";
import { InventoryClient } from "./InventoryClient";

type InventoryPageProps = {
  items: unknown[];
  containers: unknown[];
};

export function InventoryPageWithOffline({ items, containers }: InventoryPageProps) {
  // Cache items to IndexedDB automatically
  const { data: cachedItems, isLoading: itemsLoading } = useOfflineCache(
    STORES.ITEMS,
    items,
    "inventory_items"
  );

  // Cache containers to IndexedDB automatically
  const { data: cachedContainers, isLoading: containersLoading } = useOfflineCache(
    STORES.CONTAINERS,
    containers,
    "inventory_containers"
  );

  // Show loading state while hydrating cache
  if (itemsLoading || containersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <InventoryClient
      items={(cachedItems || []) as Parameters<typeof InventoryClient>[0]["items"]}
      containers={(cachedContainers || []) as Parameters<typeof InventoryClient>[0]["containers"]}
    />
  );
}
