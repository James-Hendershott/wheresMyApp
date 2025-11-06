// WHY: Show user their online/offline status and offline capabilities
// WHAT: Banner component with connection status, sync info, and refresh option
// HOW: Uses custom hooks for online status and cache state, displays toast-like banner
// GOTCHA: Only shows when relevant (offline, or has cached data)

"use client";

import { useOnlineStatus, useOfflineReady, useLastSync } from "@/hooks/useOfflineCache";
import { WifiOff, Wifi, RefreshCw, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function OfflineStatusBanner() {
  const isOnline = useOnlineStatus();
  const { hasData } = useOfflineReady();
  const lastSync = useLastSync("app");

  // Don't show banner if online and no cached data
  if (isOnline && !hasData) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-2 text-sm shadow-lg transition-colors ${
        isOnline
          ? "border-green-200 bg-green-50 text-green-900"
          : "border-orange-200 bg-orange-50 text-orange-900"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-600" />
          )}
          <span className="font-medium">
            {isOnline ? "Online" : "Offline Mode"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {hasData && (
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span>Data cached</span>
            </div>
          )}

          {lastSync && (
            <div className="hidden sm:block">
              Last synced: {formatDistanceToNow(lastSync, { addSuffix: true })}
            </div>
          )}

          {!isOnline && hasData && (
            <div className="rounded bg-orange-100 px-2 py-1 text-orange-700">
              Changes will sync when online
            </div>
          )}
        </div>

        {isOnline && (
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 rounded bg-white px-3 py-1 text-green-700 transition hover:bg-green-100"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
}
