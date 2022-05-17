import { Context } from "./context.ts";

export type MiddlewareResponse =
  | void
  | string
  | Response
  | unknown;

export type NextFunction = (
  ctx: Context,
) => Response | Promise<Response>;

export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => MiddlewareResponse | Promise<MiddlewareResponse>;

export function decode(res: MiddlewareResponse) {
  if (res instanceof Response) return res;
  if (typeof res === "string") return new Response(res);
  const str = JSON.stringify(res);
  const headers = { "content-type": "application/json" };
  return new Response(str, { headers });
}

export function compose(middlewares: Middleware[]) {
  return (ctx: Context) => {
    let current = -1;
    const next: NextFunction = async () =>
      current === (middlewares.length - 1)
        ? new Response("next() called on last handler", { status: 500 })
        : decode(await middlewares[++current](ctx, next));
    return middlewares[++current](ctx, next);
  };
}
