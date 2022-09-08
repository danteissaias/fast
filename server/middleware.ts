import { Context } from "./context.ts";

export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => Promise<unknown> | unknown;

export type NextFunction = (
  ctx: Context,
) => Promise<Response>;

function isJSON(val: unknown) {
  try {
    const s = JSON.stringify(val);
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

export function compose(middlewares: Middleware[]) {
  let cur = -1;
  let next: NextFunction;
  return next = async (ctx: Context) => {
    try {
      ctx.assert(++cur < middlewares.length, 404, "Not Found");
      const res = await middlewares[cur](ctx, next);
      if (res instanceof Response) return res;
      if (typeof res === "string") return new Response(res);
      if (isJSON(res) || Array.isArray(res)) return Response.json(res);
      if (res instanceof Blob || res instanceof File) {
        const headers = new Headers();
        if (res.type) headers.set("Content-Type", res.type);
        headers.set("Content-Length", res.size.toString());
        return new Response(res, { headers });
      } else return new Response(null, { status: 204 });
    } catch (error) {
      let { message, expose = false, init = { status: 500 } } = error;
      if (!expose) message = "Internal Server Error";
      const { status } = init;
      return Response.json({ error: { status, message } }, init);
    }
  };
}
