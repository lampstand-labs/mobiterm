import { serve, which, file } from "bun";

import { createPushRoutes } from "./server/webpush";
import { parseArgs } from "./server/args";
import { websocket } from "./server/websocket";
import type { WebSocketData } from "./server/websocket";
import {
  loadExtensions,
  getServerExtensions,
  getClientExtensions,
  getClientBundle,
} from "./server/extensions";

// Embedded files (compiled binary / dev)
import rawIndexHtml from "./client/index.html" with { type: "file" };
import swUrl from "./client/service-worker.js" with { type: "file" };
import rawManifest from "./client/assets/manifest.json" with { type: "file" };
import rawIcon from "./client/assets/icon.svg" with { type: "file" };
import iconPngUrl from "./client/assets/icon-180.png" with { type: "file" };

// Embedded builds (compile-time macros)
import {
  bundleVendorEsm,
  frontendJs,
  frontendCss,
  sharedUiBundle,
} from "./server/macros.ts" with { type: "macro" };

const VENDOR: Record<string, string> = {
  react: bundleVendorEsm("node_modules/react/cjs/react.production.js"),
  "react-dom": bundleVendorEsm(
    "node_modules/react-dom/cjs/react-dom.production.js",
  ),
  "react-dom-client": bundleVendorEsm(
    "node_modules/react-dom/cjs/react-dom-client.production.js",
  ),
  "react-jsx-runtime": bundleVendorEsm(
    "node_modules/react/cjs/react-jsx-runtime.production.js",
  ),
  "react-jsx-dev-runtime": bundleVendorEsm(
    "node_modules/react/cjs/react-jsx-dev-runtime.production.js",
  ),
};

const FRONTEND_JS = frontendJs();
const FRONTEND_CSS = frontendCss();
const SHARED_UI = sharedUiBundle();

const { identifier, vapidContact, port, extensions } = parseArgs();
await loadExtensions(extensions);
const hasTmux = which("tmux") !== null;

function startServer(port?: number): ReturnType<typeof serve<WebSocketData>> {
  let currentPort = port ?? 7130;
  while (true) {
    try {
      return serve<WebSocketData>({
        port: currentPort,

        routes: {
          "/": () =>
            new Response(file(rawIndexHtml as unknown as URL), {
              headers: { "Content-Type": "text/html" },
            }),
          ...createPushRoutes(identifier, vapidContact),
          ...getServerExtensions(),
          "/service-worker.js": () =>
            new Response(file(swUrl as URL), {
              headers: { "Content-Type": "application/javascript" },
            }),
          "/api/hasTmux": {
            GET: () => Response.json({ hasTmux }),
          },
          "/frontend.js": () =>
            new Response(FRONTEND_JS, {
              headers: { "Content-Type": "application/javascript" },
            }),
          "/styles.css": () =>
            new Response(FRONTEND_CSS, {
              headers: { "Content-Type": "text/css" },
            }),
          "/shared/ui.js": () =>
            new Response(SHARED_UI, {
              headers: { "Content-Type": "application/javascript" },
            }),
          "/assets/manifest.json": () =>
            new Response(file(rawManifest as unknown as URL), {
              headers: { "Content-Type": "application/manifest+json" },
            }),
          "/assets/icon.svg": () =>
            new Response(file(rawIcon as unknown as URL), {
              headers: { "Content-Type": "image/svg+xml" },
            }),
          "/assets/icon-180.png": () =>
            new Response(file(iconPngUrl as URL), {
              headers: { "Content-Type": "image/png" },
            }),
          "/clientExtensions": {
            GET: () => Response.json(getClientExtensions()),
          },
        },

        fetch(req, server) {
          const url = new URL(req.url);
          if (url.pathname === "/ws") {
            if (server.upgrade(req, { data: { identifier, hasTmux } })) return;
          }
          const extMatch = url.pathname.match(
            /^\/extensions\/([^/]+)\/client\.js$/,
          );
          if (extMatch) {
            const bundle = getClientBundle(extMatch[1]!);
            if (bundle) {
              return new Response(new Uint8Array(bundle), {
                headers: { "Content-Type": "application/javascript" },
              });
            }
          }
          const vendorMatch = url.pathname.match(/^\/vendor\/(.+)\.js$/);
          if (vendorMatch) {
            const bundle = VENDOR[vendorMatch[1]!];
            if (bundle) {
              return new Response(bundle, {
                headers: { "Content-Type": "application/javascript" },
              });
            }
          }
          return new Response("Not Found", { status: 404 });
        },

        websocket,

        development: process.env.NODE_ENV !== "production" && {
          hmr: true,
          console: true,
        },
      });
    } catch (err) {
      if ((err as { code?: string }).code !== "EADDRINUSE") throw err;
      if (port !== undefined) throw err;
      console.error(
        `Port ${currentPort} is in use, trying ${currentPort + 1}...`,
      );
      currentPort++;
    }
  }
}

const server = startServer(port);

console.log(`🚀 Server running at ${server.url}`);
