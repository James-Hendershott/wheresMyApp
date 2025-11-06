# Push Notifications Implementation Guide

## ⚠️ iOS Limitations

**CRITICAL:** iOS Safari does **NOT support** Web Push Notifications for PWAs.

**What iOS doesn't support:**
- ❌ Push Notifications API
- ❌ Background Sync API
- ❌ Persistent notifications
- ❌ Any form of push while app is closed

**Apple's stance:** This is intentional to protect App Store revenue. Only native iOS apps get push notifications.

**Workarounds for iOS:**
1. **Email notifications** - Reliable but not instant
2. **SMS via Twilio** - Costs per message
3. **Native app** - Build with React Native/Flutter/Capacitor
4. **In-app polling** - Only works while app is open

## ✅ Android Support

Android Chrome/Edge **fully supports** Web Push Notifications:
- ✅ Push Notifications API
- ✅ Background notifications (app closed)
- ✅ Notification icons and actions
- ✅ Vibration and sounds
- ✅ Notification permission prompts

---

## Architecture

### Components:
1. **VAPID Keys** - Server authentication for push service
2. **Service Worker** - Receives and displays notifications
3. **Push Subscription** - User's unique endpoint
4. **Backend API** - Sends notifications via push service

### Flow:
```
User enables notifications
  → Browser requests permission
  → Generate push subscription
  → Save subscription to database
  → Server sends notification to push service
  → Push service delivers to device
  → Service worker displays notification
```

---

## Implementation Steps

### 1. Generate VAPID Keys (One-time Setup)

```bash
npx web-push generate-vapid-keys
```

Save to `.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDxxxxxxx...
VAPID_PRIVATE_KEY=xxxxxxx...
```

### 2. Install web-push Package

```bash
npm install web-push
```

### 3. Create Push Subscription Schema

Add to `prisma/schema.prisma`:
```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  endpoint  String   @unique
  p256dh    String   // Encryption key
  auth      String   // Authentication secret
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

Run migration:
```bash
npm run db:migrate
```

### 4. Service Worker Notification Handler

Add to `public/sw.js` (or create custom one):
```javascript
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'WheresMy Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      ...data.data
    },
    actions: data.actions || [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
```

### 5. Client-Side Subscription Manager

Create `src/lib/pushNotifications.ts`:
```typescript
export async function subscribeUserToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      )
    });

    // Save subscription to backend
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### 6. Backend API Routes

**Subscribe endpoint** (`src/app/api/push/subscribe/route.ts`):
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await request.json();

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId: session.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  return NextResponse.json({ success: true });
}
```

**Send notification endpoint** (`src/app/api/push/send/route.ts`):
```typescript
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, body, url, userIds } = await request.json();

  // Get subscriptions for target users
  const subscriptions = await prisma.pushSubscription.findMany({
    where: userIds ? { userId: { in: userIds } } : {},
  });

  const payload = JSON.stringify({
    title,
    body,
    url,
    data: { timestamp: Date.now() }
  });

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      )
    )
  );

  // Clean up failed subscriptions (expired or invalid)
  const failedIndexes = results
    .map((result, index) => result.status === 'rejected' ? index : null)
    .filter(i => i !== null);

  if (failedIndexes.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: {
        id: { in: failedIndexes.map(i => subscriptions[i!].id) }
      }
    });
  }

  return NextResponse.json({
    success: true,
    sent: results.filter(r => r.status === 'fulfilled').length,
    failed: failedIndexes.length
  });
}
```

### 7. UI Component for Permission Request

Create `src/components/NotificationPermissionPrompt.tsx`:
```typescript
"use client";

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subscribeUserToPush } from '@/lib/pushNotifications';
import { toast } from 'sonner';

export function NotificationPermissionPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported on this browser');
      return;
    }

    if (permission === 'granted') {
      toast.info('Notifications already enabled');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      const subscription = await subscribeUserToPush();
      if (subscription) {
        toast.success('Notifications enabled! 🔔');
      } else {
        toast.error('Failed to enable notifications');
      }
    } else {
      toast.error('Notification permission denied');
    }
  };

  if (permission === 'denied') {
    return (
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-900">
          <BellOff className="h-5 w-5" />
          <div>
            <div className="font-semibold">Notifications Blocked</div>
            <div className="text-sm">
              You've blocked notifications. Enable them in browser settings.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'granted') {
    return (
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2 text-green-900">
          <Bell className="h-5 w-5" />
          <div>
            <div className="font-semibold">Notifications Enabled ✓</div>
            <div className="text-sm">
              You'll receive updates about your items and containers.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-blue-900">
          <Bell className="h-5 w-5" />
          <div>
            <div className="font-semibold">Enable Notifications</div>
            <div className="text-sm">
              Get notified when items are added, moved, or checked out.
            </div>
            <div className="mt-1 text-xs text-blue-700">
              ⚠️ Note: Not available on iOS Safari (Apple restriction)
            </div>
          </div>
        </div>
        <Button onClick={requestPermission} size="sm">
          Enable
        </Button>
      </div>
    </div>
  );
}
```

---

## Example Notifications

### When item is added to container:
```typescript
await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Item Added',
    body: `${itemName} was added to ${containerLabel}`,
    url: `/items/${itemId}`,
    userIds: [userId] // Optional: target specific users
  })
});
```

### When container is moved:
```typescript
await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Container Moved',
    body: `${containerLabel} moved to ${locationName} → ${rackName}`,
    url: `/containers/${containerId}`
  })
});
```

### When item is checked out:
```typescript
await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Item Checked Out',
    body: `${itemName} was checked out by ${userName}`,
    url: `/inventory`
  })
});
```

---

## Testing

### Test on Android:
1. Visit app on Android Chrome
2. Click "Enable Notifications" button
3. Grant permission when prompted
4. Trigger a notification action (add item, etc.)
5. Notification should appear even with app closed

### Test on iOS (will fail):
1. Visit app on iOS Safari
2. Button should show warning about iOS limitation
3. Permission will be denied or notification won't work
4. Consider email notifications instead

### Test locally:
```bash
npm run dev:network
# Visit from phone on same WiFi
# HTTPS required for notifications (use ngrok or deploy)
```

---

## Production Considerations

1. **HTTPS Required** - Push API only works over HTTPS
2. **VAPID Keys** - Keep private key secret, add to `.env`
3. **Rate Limiting** - Prevent notification spam
4. **User Preferences** - Let users choose which notifications they want
5. **Cleanup** - Remove expired subscriptions
6. **Analytics** - Track notification delivery and click rates

---

## Alternative: Email Notifications (iOS-friendly)

If you need iOS support, implement email notifications:

```typescript
// src/lib/email.ts
import nodemailer from 'nodemailer';

export async function sendEmailNotification(
  to: string,
  subject: string,
  body: string,
  actionUrl?: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"WheresMy App" <notifications@wheresmyapp.com>',
    to,
    subject,
    html: `
      <h2>${subject}</h2>
      <p>${body}</p>
      ${actionUrl ? `<a href="${actionUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>` : ''}
    `
  });
}
```

Works on ALL platforms including iOS!

---

## Summary

✅ **Android**: Full push notification support  
❌ **iOS**: No push support (use email instead)  
🔧 **Workarounds**: Email, SMS, native app, or accept limitation
