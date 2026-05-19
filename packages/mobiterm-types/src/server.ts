type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/**
 * Extension routes merged into Bun.serve().
 * @example
 * {
 *   "/api/hello": { GET: () => Response.json({ msg: "hello" }) },
 *   "/api/data":  { POST: (req) => req.json().then((d) => Response.json(d)) },
 * }
 */
export type ServerRoutes = Record<
  string,
  Partial<Record<HTTPMethod, (req: Request) => Response | Promise<Response>>>
>;
