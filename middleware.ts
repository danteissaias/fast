import { Context } from "./context.ts";

export type NextFunction = (
  ctx: Context,
) => Promise<Response>;

export type MiddlewareResponse =
  | Response
  | void
  | unknown
  | string
  | null;

export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => MiddlewareResponse | Promise<MiddlewareResponse>;

// Normalize middleware response into Response
function normalize(res: MiddlewareResponse): Response {
  if (res instanceof Response) return res;
  if (!res) return new Response(null, { status: 204 });
  if (typeof res === "string") return new Response(res);
  return Response.json(res);
}

// Returns a single handler from a stack of middleware
export function compose(mw: Middleware[]): NextFunction {
  if (!mw.length) throw new Error("compose called without middleware");
  let current = -1;
  const next: NextFunction = async (ctx) =>
    normalize(await mw[++current](ctx, next));
  return next;
}
