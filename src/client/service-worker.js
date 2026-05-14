self.addEventListener("push", (event) => {
  const defaultData = { title: "title", body: "body" };

  event.waitUntil(
    (async () => {
      let payload = {};

      if (event.data) {
        try {
          payload = event.data.json();
        } catch (error) {
          console.error("Push notification payload parsing failed:", error);
        }
      }

      const notificationOpts = {
        body: payload.body ?? defaultData.body,
        icon: payload.icon ?? undefined,
        tag: "mobiterm-notification", // Stacks notifications to prevent a messy tray
      };

      await self.registration.showNotification(
        payload.title ?? defaultData.title,
        notificationOpts,
      );
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const clientList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Focus the first available open window/tab of the app
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }

      // Open a new window/tab at the root if no open clients exist
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })(),
  );
});

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
