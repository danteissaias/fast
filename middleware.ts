import { Context } from "./context.ts";

export type NextFunction = (
  ctx: Context,
) => Promise<Response>;

export type MiddlewareResponse =
  | Response
  | void
  | Record<string, unknown>
  | string
  | null;

export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => MiddlewareResponse | Promise<MiddlewareResponse>;

// Normalize middleware response into Response
export function decode(res: Response | void | unknown | string): Response {
  if (!res) return new Response(null, { status: 204 });
  if (res instanceof Response) return res;
  if (typeof res === "string") return new Response(res);
  const str = JSON.stringify(res);
  const headers = { "content-type": "application/json" };
  return new Response(str, { headers });
}

// Returns a single handler from a stack of middleware
export function compose(
  middlewares: Middleware[],
): NextFunction {
  if (!middlewares.length) throw new Error("compose called without middleware");
  let current = -1;
  const next: NextFunction = async (ctx) =>
    decode(await middlewares[++current](ctx, next));
  return next;
}
