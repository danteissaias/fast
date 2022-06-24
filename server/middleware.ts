import type { Context } from "./context.ts";

export type MiddlewareResponse =
  | string
  | unknown
  | Response;

export type NextFunction = (
  ctx: Context,
) => Promise<Response>;

export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => MiddlewareResponse | Promise<MiddlewareResponse>;

const isString = (res: unknown): res is string =>
  Object.prototype.toString.call(res) === "[object String]";

const isJSON = (res: unknown) => {
  try {
    const s = JSON.stringify(res);
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
};

export const compose = (middlewares: Middleware[]) => {
  let cur = -1;
  const next: NextFunction = async (ctx: Context) => {
    const res = await middlewares[++cur](ctx, next);
    if (res instanceof Response) return res;
    if (isString(res)) return new Response(res);
    if (isJSON(res)) return Response.json(res);
    ctx.assert(false, 500, "Middleware returned invalid response.");
  };
  return next;
};
