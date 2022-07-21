import { Context, Middleware } from "../mod.ts";

export function serve(base: string): Middleware {
  return async (ctx: Context) => {
    ctx.assert(ctx.request.method === "GET", 404, "Not Found");
    const { pathname } = ctx.url;
    ctx.assert(pathname !== "/", 404, "Not Found");
    const path = base + pathname;
    const file = await Deno.open(path, { read: true }).catch(() => null);
    ctx.assert(file, 404, "Not Found");
    return new Response(file.readable);
  };
}
