import type { Context } from "./context.ts";

export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => Promise<unknown> | unknown;

export type NextFunction = (ctx: Context) => Promise<Response>;
export type FallbackFunction = (ctx: Context) => Response;

export function compose(middlewares: Middleware[], fb: FallbackFunction) {
  let cur = -1;
  const max = middlewares.length;
  let next: NextFunction;
  return next = (ctx: Context) => {
    // fallback when next() called on last handler
    const res = ++cur >= max ? fb(ctx) : middlewares[cur](ctx, next);
    return Promise.resolve(res).then(decode);
  };
}

export function isJSON(val: unknown): val is Record<string, unknown> {
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
  }

  throw new Error("Invalid response");
}
