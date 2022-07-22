import type { Context } from "./context.ts";

export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => Promise<unknown> | unknown;

export type NextFunction = (
  ctx: Context,
) => Promise<Response>;

export function compose(middlewares: Middleware[]) {
  let cur = -1;
  const max = middlewares.length;
  let next: NextFunction;
  return next = async (ctx: Context) => {
    ctx.assert(++cur < max, 404, "Not Found");
    const res = await middlewares[cur](ctx, next);
    return decode(res);
  };
}

function isJSON(val: unknown) {
  try {
    const s = JSON.stringify(val);
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

export function decode(res: unknown) {
  if (res instanceof Response) return res;

  // deno-fmt-ignore
  if (typeof res === "string" || res instanceof ArrayBuffer ||
    res instanceof Uint8Array || res instanceof ReadableStream)
    return new Response(res);

  if (isJSON(res) || Array.isArray(res)) return Response.json(res);
  if (res === null || res === undefined) {
    return new Response(null, { status: 204 });
  }

  if (res instanceof Blob || res instanceof File) {
    const headers = new Headers();
    headers.set("Content-Type", res.type);
    headers.set("Content-Length", res.size.toString());
    return new Response(res, { headers });
  }

  throw new Error("Invalid response");
}
