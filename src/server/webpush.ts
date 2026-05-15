import { Database } from "bun:sqlite";
import { hash } from "bun";
import { mkdirSync } from "fs";
import { dirname } from "path";
import webPush from "web-push";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Stmt = any;

interface SubscriptionStore {
  add: Stmt;
  exists: Stmt;
  all: Stmt;
  remove: Stmt;
  count: Stmt;
}

interface InstanceStore {
  get: Stmt;
  add: Stmt;
}

type RouteHandler = (req: Request) => Response | Promise<Response>;

interface SubscriptionRow {
  endpoint: string;
  data: string;
}

interface InstanceRow {
  vapid_public_key: string;
  vapid_private_key: string;
  vapid_contact: string;
}

interface CountResult {
  count: number;
}

interface SubscribeBody {
  subscription?: { endpoint: string; keys?: Record<string, string> };
}

interface UnsubscribeBody {
  subscription?: { endpoint: string };
}

interface SendNotificationBody {
  title?: string;
  body?: string;
  icon?: string;
  data?: Record<string, unknown>;
}

function tableName(identifier: string): string {
  const hashedIdentifier = hash(identifier).toString(36);
  return `subscriptions_${hashedIdentifier}`;
}

function dbPath(): string {
  if (process.env.NODE_ENV !== "production") return "./data/mobiterm.sqlite";
  const home = process.env.HOME || "/tmp";
  if (process.platform === "darwin") {
    return `${home}/Library/Application Support/mobiterm/mobiterm.sqlite`;
  }
  const dataHome = process.env.XDG_DATA_HOME || `${home}/.local/share`;
  return `${dataHome}/mobiterm/mobiterm.sqlite`;
}

function initDb(identifier: string): {
  subscriptions: SubscriptionStore;
  instances: InstanceStore;
} {
  const path = dbPath();
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true });
  db.run("PRAGMA journal_mode=WAL");

  const subTable = tableName(identifier);
  db.run(`CREATE TABLE IF NOT EXISTS ${subTable} (
    endpoint TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS instances (
    identifier TEXT PRIMARY KEY,
    vapid_public_key TEXT NOT NULL,
    vapid_private_key TEXT NOT NULL,
    vapid_contact TEXT NOT NULL
  )`);

  const subscriptions: SubscriptionStore = {
    add: db.prepare(
      `INSERT OR REPLACE INTO ${subTable} (endpoint, data) VALUES ($endpoint, $data)`,
    ),
    exists: db.prepare(`SELECT 1 FROM ${subTable} WHERE endpoint = $endpoint`),
    all: db.prepare(`SELECT endpoint, data FROM ${subTable}`),
    remove: db.prepare(`DELETE FROM ${subTable} WHERE endpoint = $endpoint`),
    count: db.prepare(`SELECT COUNT(*) as count FROM ${subTable}`),
  };

  const instances: InstanceStore = {
    get: db.prepare("SELECT * FROM instances WHERE identifier = $identifier"),
    add: db.prepare(
      `INSERT OR REPLACE INTO instances (identifier, vapid_public_key, vapid_private_key, vapid_contact)
       VALUES ($identifier, $vapid_public_key, $vapid_private_key, $vapid_contact)`,
    ),
  };

  console.log(`Push DB: ${path} table: ${subTable}`);
  return { subscriptions, instances };
}

export function createPushRoutes(
  identifier: string,
  contact?: string,
): Record<string, { GET?: RouteHandler; POST?: RouteHandler }> {
  const db = initDb(identifier);

  let publicKey: string | null = null;

  const row = db.instances.get.get({ $identifier: identifier }) as
    | InstanceRow
    | undefined;

  if (row) {
    webPush.setVapidDetails(
      row.vapid_contact,
      row.vapid_public_key,
      row.vapid_private_key,
    );
    publicKey = row.vapid_public_key;
    console.log("VAPID push notifications enabled (from DB)");
  } else {
    const keys = webPush.generateVAPIDKeys();
    const safeDomain =
      identifier
        .replace(/[^a-zA-Z0-9-]/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
        .slice(0, 63) || "fallback";
    const vapidContact = contact || `mailto:admin@${safeDomain}.com`;
    webPush.setVapidDetails(vapidContact, keys.publicKey, keys.privateKey);
    db.instances.add.run({
      $identifier: identifier,
      $vapid_public_key: keys.publicKey,
      $vapid_private_key: keys.privateKey,
      $vapid_contact: vapidContact,
    });
    publicKey = keys.publicKey;
    console.log("VAPID push notifications enabled (keys generated)");
  }

  return {
    "/vapidPublicKey": {
      GET: () => Response.json({ publicKey }),
    },

    "/subscribe": {
      POST: async (req) => {
        try {
          const { subscription } = (await req.json()) as SubscribeBody;
          if (!subscription) {
            return Response.json(
              { error: "Subscription object is required" },
              { status: 400 },
            );
          }

          const row = db.subscriptions.exists.get({
            $endpoint: subscription.endpoint,
          });
          if (!row) {
            db.subscriptions.add.run({
              $endpoint: subscription.endpoint,
              $data: JSON.stringify(subscription),
            });
          }

          const { count } = db.subscriptions.count.get() as CountResult;
          return Response.json(
            {
              success: true,
              message: "Subscription saved successfully",
              totalSubscriptions: count,
            },
            { status: 201 },
          );
        } catch (error: any) {
          console.error("Error in /subscribe:", error);
          return Response.json(
            { error: "Failed to save subscription" },
            { status: 500 },
          );
        }
      },
    },

    "/sendNotification": {
      POST: async (req) => {
        try {
          const {
            title,
            body: msgBody,
            icon,
            data,
          } = (await req.json()) as SendNotificationBody;

          if (!title && !msgBody) {
            return Response.json(
              { error: "Title or body is required" },
              { status: 400 },
            );
          }

          const payload = JSON.stringify({
            title: title || "Notification",
            body: msgBody || "",
            icon,
            data: data || {},
            timestamp: new Date().toISOString(),
          });

          const results = {
            sent: 0,
            failed: 0,
            errors: [] as { endpoint: string; error: string }[],
          };
          const rows = db.subscriptions.all.all() as SubscriptionRow[];

          for (const row of rows) {
            try {
              const subscription = JSON.parse(row.data);
              await webPush.sendNotification(subscription, payload);
              results.sent++;
            } catch (error: any) {
              results.failed++;
              results.errors.push({
                endpoint: row.endpoint,
                error: error.message,
              });
              if (error.statusCode === 410 || error.statusCode === 404) {
                db.subscriptions.remove.run({ $endpoint: row.endpoint });
              }
            }
          }

          return Response.json({
            success: true,
            message: `Notifications sent: ${results.sent} successful, ${results.failed} failed`,
            results,
          });
        } catch (error: any) {
          console.error("Error in /sendNotification:", error);
          return Response.json(
            { error: "Failed to send notifications" },
            { status: 500 },
          );
        }
      },
    },

    "/unsubscribe": {
      POST: async (req) => {
        try {
          const { subscription } = (await req.json()) as UnsubscribeBody;
          if (!subscription || !subscription.endpoint) {
            return Response.json(
              { error: "Subscription endpoint is required" },
              { status: 400 },
            );
          }

          const endpoint = subscription.endpoint;
          const row = db.subscriptions.exists.get({ $endpoint: endpoint });
          let removed = 0;

          if (row) {
            db.subscriptions.remove.run({ $endpoint: endpoint });
            removed = 1;
          }

          const { count } = db.subscriptions.count.get() as CountResult;
          return Response.json({
            success: true,
            message:
              removed > 0 ? "Subscription removed" : "Subscription not found",
            removed,
            totalSubscriptions: count,
          });
        } catch (error: any) {
          console.error("Error in /unsubscribe:", error);
          return Response.json(
            { error: "Failed to remove subscription" },
            { status: 500 },
          );
        }
      },
    },

    "/health": {
      GET: () => {
        try {
          const { count } = db.subscriptions.count.get() as CountResult;
          return Response.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            subscriptions: count,
          });
        } catch (error: any) {
          return Response.json(
            {
              status: "unhealthy",
              timestamp: new Date().toISOString(),
              error: error.message,
            },
            { status: 500 },
          );
        }
      },
    },
  };
}
