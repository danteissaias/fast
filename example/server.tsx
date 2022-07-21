/** @jsxImportSource https://esm.sh/preact@10.9.0 */
import fast, { Context } from "../mod.ts";
import { h } from "https://esm.sh/preact@10.9.0";
import render from "https://esm.sh/preact-render-to-string@5.2.1";
import routes from "./routes/_export.ts";

const app = fast();

const pathname = (ctx: Context) => {
  let { pathname } = ctx.url;
  if (pathname === "/index") pathname = "/";
  return pathname;
};

const response = (res: string) => {
  const headers = { "content-type": "text/html" };
  return new Response("<!DOCTYPE html>" + res, { headers });
};

app.get("*", async (ctx, next) => {
  const path = pathname(ctx);
  // @ts-ignore TODO
  const route = routes[path];
  if (!route) return next(ctx);

  let props = {};
  if (route.loader) props = await route.loader();

  const root = h(route.default, props);
  const res = render(root);
  return response(res);
});

app.listen();
