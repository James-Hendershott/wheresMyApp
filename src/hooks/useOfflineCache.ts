// WHY: React hooks for IndexedDB offline functionality
// WHAT: Custom hooks for syncing server data to IndexedDB and handling offline state
// HOW: useEffect for background sync, useState for online/offline status
// GOTCHA: Must handle race conditions between server and IndexedDB updates

"use client";

import { useEffect, useState } from "react";
import {
  getAllFromStore,
  putManyInStore,
  getMetadata,
  setMetadata,
  isIndexedDBSupported,
  STORES,
} from "@/lib/indexedDB";

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to cache data to IndexedDB
 * Automatically syncs server data to local storage
 */
export function useOfflineCache<T>(
  storeName: string,
  serverData: T[] | null,
  cacheKey: string
) {
  const [cachedData, setCachedData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!isIndexedDBSupported()) {
      setCachedData(serverData);
      setIsLoading(false);
      return;
    }

    async function loadCache() {
      try {
        setIsLoading(true);

        if (isOnline && serverData) {
          // Online: Use server data and update cache
          await putManyInStore(storeName, serverData);
          await setMetadata(`${cacheKey}_lastSync`, Date.now());
          setCachedData(serverData);
        } else {
          // Offline: Load from cache
          const cached = await getAllFromStore<T>(storeName);
          if (cached.length > 0) {
            setCachedData(cached);
          } else {
            setCachedData(serverData);
          }
        }
      } catch (err) {
        console.error("IndexedDB error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setCachedData(serverData); // Fallback to server data
      } finally {
        setIsLoading(false);
      }
    }

    loadCache();
  }, [storeName, serverData, cacheKey, isOnline]);

  return { data: cachedData, isLoading, error, isOnline };
}

/**
 * Hook to get last sync timestamp for a cache
 */
export function useLastSync(cacheKey: string) {
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    if (!isIndexedDBSupported()) return;

    async function loadLastSync() {
      try {
        const timestamp = await getMetadata(`${cacheKey}_lastSync`);
        setLastSync(timestamp || null);
      } catch (err) {
        console.error("Error loading last sync:", err);
      }
    }

    loadLastSync();
  }, [cacheKey]);

  return lastSync;
}

/**
 * Hook to check if app has been cached for offline use
 */
export function useOfflineReady() {
  const [isReady, setIsReady] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!isIndexedDBSupported()) {
      setIsReady(false);
      return;
    }

    async function checkReady() {
      try {
        // Check if we have cached data
        const [items, containers, locations] = await Promise.all([
          getAllFromStore(STORES.ITEMS),
          getAllFromStore(STORES.CONTAINERS),
          getAllFromStore(STORES.LOCATIONS),
        ]);

        const dataExists =
          items.length > 0 || containers.length > 0 || locations.length > 0;
        setHasData(dataExists);
        setIsReady(true);
      } catch (err) {
        console.error("Error checking offline readiness:", err);
        setIsReady(false);
      }
    }

    checkReady();
  }, []);

  return { isReady, hasData };
}

/**
 * Hook to force refresh cache from server
 */
export function useRefreshCache() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear service worker cache
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Reload page to fetch fresh data
      window.location.reload();
    } catch (err) {
      console.error("Error refreshing cache:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refresh, isRefreshing };
}
