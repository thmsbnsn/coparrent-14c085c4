// Service Worker for Push Notifications
self.addEventListener("push", function (event) {
  if (!event.data) {
    console.log("Push event but no data");
    return;
  }

  const data = event.data.json();

  const options = {
    body: data.message || data.body || "You have a new notification",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || "1",
      url: data.url || "/dashboard",
    },
    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
    tag: data.tag || "coparrent-notification",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "CoParrent", options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event.notification.tag);
});

// Activate event - clean up old caches
self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});
