import type { Context } from "./context.ts";
import { decode } from "./decode.ts";

export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => Promise<unknown> | unknown;

export type NextFunction = (
  ctx: Context,
) => Promise<Response>;

export const compose = (middlewares: Middleware[]) => {
  let cur = -1;
  let next: NextFunction;
  return next = async (ctx: Context) => {
    try {
      const good = ++cur < middlewares.length;
      ctx.assert(good, 404, "Not found");
      const res = await middlewares[cur](ctx, next);
      return decode(res);
    } catch (error) {
      const { status = 500, message } = error;
      const init = { status };
      const body = { error: { status, message } };
      return Response.json(body, init);
    }
  };
};
