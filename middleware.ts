import { Context } from "./context.ts";

export type NextFunction = (
  ctx: Context,
) => Promise<Response> | Response;

export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => Response | Promise<Response>;

// Returns a single handler from a stack of middleware
export function compose(mw: Middleware[]) {
  if (!mw.length) throw new Error("compose called without middleware");
  let current = -1;
  const next: NextFunction = (ctx) => mw[++current](ctx, next);
  return next;
}
