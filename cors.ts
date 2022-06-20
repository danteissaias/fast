import type { Middleware } from "./mod.ts";

// Simple cross-origin resource sharing middleware
export const cors: Middleware = async (ctx) => {
  const { method } = ctx.request;
  const isPreflight = method === "OPTIONS";
  if (isPreflight) {
    const headers = new Headers();
    headers.set("Allow", "*");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "*");
    headers.set("Access-Control-Allow-Headers", "*");
    return new Response(null, { status: 204, headers });
  } else {
    const res = await ctx.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "*");
    res.headers.set("Access-Control-Allow-Headers", "*");
    return res;
  }
};
