// WHY: Allow users to enable/disable push notifications
// WHAT: Settings component with permission request and subscription management
// HOW: Uses pushNotifications.ts utilities, shows platform-specific warnings
// GOTCHA: iOS Safari will always show "not supported" warning

"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  subscribeUserToPush,
  unsubscribeFromPush,
  isPushSubscribed,
  isPushSupported,
  requestNotificationPermission,
  showTestNotification,
} from "@/lib/pushNotifications";
import { toast } from "sonner";

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supported = isPushSupported();

  useEffect(() => {
    async function checkStatus() {
      if (typeof Notification !== "undefined") {
        setPermission(Notification.permission);
      }

      if (supported) {
        const subscribed = await isPushSubscribed();
        setIsSubscribed(subscribed);
      }

      setIsLoading(false);
    }

    checkStatus();
  }, [supported]);

  const handleEnable = async () => {
    setIsLoading(true);

    try {
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm === "granted") {
        const subscription = await subscribeUserToPush();
        if (subscription) {
          setIsSubscribed(true);
          toast.success("Notifications enabled! 🔔");
          
          // Show test notification
          try {
            await showTestNotification();
          } catch (err) {
            console.error("Test notification failed:", err);
          }
        } else {
          toast.error("Failed to enable notifications");
        }
      } else {
        toast.error("Notification permission denied");
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      toast.error("Failed to enable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);

    try {
      const success = await unsubscribeFromPush();
      if (success) {
        setIsSubscribed(false);
        toast.success("Notifications disabled");
      } else {
        toast.error("Failed to disable notifications");
      }
    } catch (error) {
      console.error("Failed to disable notifications:", error);
      toast.error("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  // Not supported by browser
  if (!supported) {
    return (
      <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div className="flex-1">
            <div className="font-semibold text-orange-900">
              Push Notifications Not Available
            </div>
            <div className="mt-1 text-sm text-orange-800">
              Your browser doesn't support push notifications.
            </div>
            <div className="mt-2 text-xs text-orange-700">
              <strong>iOS Users:</strong> Safari on iOS doesn't support web push
              notifications. This is an Apple restriction. You can still use the app, but
              won't receive push notifications.
            </div>
            <div className="mt-2 text-xs text-orange-700">
              <strong>Alternative:</strong> Consider using email notifications or install
              on Android/desktop for push support.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Permission denied
  if (permission === "denied") {
    return (
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <BellOff className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <div className="font-semibold text-red-900">Notifications Blocked</div>
            <div className="mt-1 text-sm text-red-800">
              You've blocked notifications for this site.
            </div>
            <div className="mt-2 text-xs text-red-700">
              <strong>To enable:</strong>
              <ol className="ml-4 mt-1 list-decimal space-y-1">
                <li>Click the lock icon (🔒) in your browser's address bar</li>
                <li>Find "Notifications" in site settings</li>
                <li>Change to "Allow"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Already subscribed
  if (isSubscribed && permission === "granted") {
    return (
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div className="flex-1">
              <div className="font-semibold text-green-900">
                Notifications Enabled ✓
              </div>
              <div className="mt-1 text-sm text-green-800">
                You'll receive updates about your items and containers.
              </div>
              <div className="mt-2 text-xs text-green-700">
                <strong>You'll be notified when:</strong>
                <ul className="ml-4 mt-1 list-disc space-y-0.5">
                  <li>Items are added to containers</li>
                  <li>Items are checked out</li>
                  <li>Containers are moved</li>
                  <li>Capacity warnings occur</li>
                </ul>
              </div>
            </div>
          </div>
          <Button
            onClick={handleDisable}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Disable
          </Button>
        </div>
      </div>
    );
  }

  // Not yet enabled
  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div className="flex-1">
            <div className="font-semibold text-blue-900">
              Enable Push Notifications
            </div>
            <div className="mt-1 text-sm text-blue-800">
              Get notified when items are added, moved, or checked out.
            </div>
            <div className="mt-2 text-xs text-blue-700">
              <strong>Benefits:</strong>
              <ul className="ml-4 mt-1 list-disc space-y-0.5">
                <li>Never forget where you put something</li>
                <li>Track item movements in real-time</li>
                <li>Get capacity warnings</li>
                <li>Works even when app is closed (Android)</li>
              </ul>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              ⚠️ <strong>Note:</strong> iOS Safari doesn't support push notifications
              (Apple restriction). Works great on Android and desktop browsers.
            </div>
          </div>
        </div>
        <Button onClick={handleEnable} disabled={isLoading} size="sm">
          {isLoading ? "Loading..." : "Enable"}
        </Button>
      </div>
    </div>
  );
}
