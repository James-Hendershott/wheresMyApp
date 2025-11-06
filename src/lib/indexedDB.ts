// WHY: Offline data storage for PWA functionality
// WHAT: IndexedDB wrapper for caching items, containers, locations locally
// HOW: Uses native IndexedDB API with async/await wrappers, versioned schema
// GOTCHA: IndexedDB is async and requires careful error handling

/**
 * Database schema version and stores
 */
const DB_NAME = "wheresmyapp";
const DB_VERSION = 1;

/**
 * Store names for different data types
 */
export const STORES = {
  ITEMS: "items",
  CONTAINERS: "containers",
  LOCATIONS: "locations",
  RACKS: "racks",
  SYNC_QUEUE: "syncQueue",
  METADATA: "metadata",
} as const;

/**
 * Offline sync queue item
 */
export interface SyncQueueItem {
  id?: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: keyof typeof STORES;
  entityId: string;
  data: any;
  timestamp: number;
  retries: number;
  error?: string;
}

/**
 * Metadata for tracking last sync time
 */
export interface Metadata {
  key: string;
  value: any;
  updatedAt: number;
}

/**
 * Open IndexedDB connection with schema setup
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Items store
      if (!db.objectStoreNames.contains(STORES.ITEMS)) {
        const itemStore = db.createObjectStore(STORES.ITEMS, { keyPath: "id" });
        itemStore.createIndex("containerId", "containerId", { unique: false });
        itemStore.createIndex("category", "category", { unique: false });
        itemStore.createIndex("status", "status", { unique: false });
        itemStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      // Containers store
      if (!db.objectStoreNames.contains(STORES.CONTAINERS)) {
        const containerStore = db.createObjectStore(STORES.CONTAINERS, {
          keyPath: "id",
        });
        containerStore.createIndex("code", "code", { unique: true });
        containerStore.createIndex("qrCode", "qrCode", { unique: true });
        containerStore.createIndex("currentSlotId", "currentSlotId", {
          unique: false,
        });
        containerStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      // Locations store
      if (!db.objectStoreNames.contains(STORES.LOCATIONS)) {
        const locationStore = db.createObjectStore(STORES.LOCATIONS, {
          keyPath: "id",
        });
        locationStore.createIndex("name", "name", { unique: false });
      }

      // Racks store
      if (!db.objectStoreNames.contains(STORES.RACKS)) {
        const rackStore = db.createObjectStore(STORES.RACKS, { keyPath: "id" });
        rackStore.createIndex("locationId", "locationId", { unique: false });
        rackStore.createIndex("name", "name", { unique: false });
      }

      // Sync queue store (for offline mutations)
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: "id",
          autoIncrement: true,
        });
        queueStore.createIndex("timestamp", "timestamp", { unique: false });
        queueStore.createIndex("entity", "entity", { unique: false });
      }

      // Metadata store (last sync timestamps, etc.)
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: "key" });
      }
    };
  });
}

/**
 * Generic get operation
 */
export async function getFromStore<T>(
  storeName: string,
  key: string
): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic get all operation
 */
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic put operation (insert or update)
 */
export async function putInStore<T>(
  storeName: string,
  data: T
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic put many operation (batch insert/update)
 */
export async function putManyInStore<T>(
  storeName: string,
  items: T[]
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    items.forEach((item) => store.put(item));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Generic delete operation
 */
export async function deleteFromStore(
  storeName: string,
  key: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get items by index
 */
export async function getByIndex<T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add item to sync queue (for offline mutations)
 */
export async function addToSyncQueue(
  queueItem: Omit<SyncQueueItem, "id">
): Promise<void> {
  await putInStore(STORES.SYNC_QUEUE, queueItem);
}

/**
 * Get all pending sync queue items
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return getAllFromStore<SyncQueueItem>(STORES.SYNC_QUEUE);
}

/**
 * Remove item from sync queue after successful sync
 */
export async function removeFromSyncQueue(id: number): Promise<void> {
  await deleteFromStore(STORES.SYNC_QUEUE, String(id));
}

/**
 * Update metadata (e.g., last sync time)
 */
export async function setMetadata(key: string, value: any): Promise<void> {
  const metadata: Metadata = {
    key,
    value,
    updatedAt: Date.now(),
  };
  await putInStore(STORES.METADATA, metadata);
}

/**
 * Get metadata value
 */
export async function getMetadata(key: string): Promise<any> {
  const metadata = await getFromStore<Metadata>(STORES.METADATA, key);
  return metadata?.value;
}

/**
 * Check if database is available (browser support)
 */
export function isIndexedDBSupported(): boolean {
  return "indexedDB" in window;
}

/**
 * Get database size estimate (if supported)
 */
export async function getStorageEstimate(): Promise<{
  usage?: number;
  quota?: number;
  percentage?: number;
}> {
  if (!("storage" in navigator && "estimate" in navigator.storage)) {
    return {};
  }

  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;
  const percentage = quota > 0 ? (usage / quota) * 100 : 0;

  return { usage, quota, percentage };
}
