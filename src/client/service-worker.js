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
        data: payload.data ?? {},
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
      const tmuxPane = event.notification.data.tmuxPane;

      const clientList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Focus existing window, navigate to focus the specified tmux pane
      for (const client of clientList) {
        if ("focus" in client) {
          await client.focus();
          if (tmuxPane && "navigate" in client) {
            client.navigate(`/?focusTmuxPane=${encodeURIComponent(tmuxPane)}`);
          }
          return;
        }
      }

      // Open a new window/tab at the root if no open clients exist
      if (clients.openWindow) {
        const url = tmuxPane
          ? `/?focusTmuxPane=${encodeURIComponent(tmuxPane)}`
          : "/";
        await clients.openWindow(url);
        return;
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
