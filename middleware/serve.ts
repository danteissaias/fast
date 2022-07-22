import { serveDir } from "https://deno.land/std@0.149.0/http/file_server.ts";
import type { Middleware } from "../mod.ts";

export const serve = (base: string): Middleware => async (ctx, next) => {
  const res = await serveDir(ctx.request, { fsRoot: base, quiet: true });
  return res.status === 404 ? next(ctx) : res;
};
