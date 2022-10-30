import type { Context } from "./context.ts";
import type { Middleware, NextFunction } from "./types.ts";

function isJSON(val: unknown) {
  try {
    const s = JSON.stringify(val);
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

function decode(res: unknown) {
  if (res instanceof Response) return res;
  if (typeof res === "string") return new Response(res);
  if (isJSON(res) || Array.isArray(res)) return Response.json(res);
  return new Response(null, { status: 204 });
}

export default function compose(middlewares: Middleware[]) {
  let cur = -1;
  let next: NextFunction;
  return next = async (ctx: Context) => {
    try {
      const mw = middlewares[++cur];
      const res = await mw(ctx, next);
      return decode(res);
    } catch (error) {
      const { status = 500, message } = error;
      const init = { status };
      const body = { error: { status, message } };
      return Response.json(body, init);
    }
  };
}
