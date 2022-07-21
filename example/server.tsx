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
  return new Response(
    "<!DOCTYPE html>" + res,
    { headers: { "content-type": "text/html" } },
  );
};

const merge = Object.assign;

app.use(async (ctx: Context, next) => {
  const { method } = ctx.request;
  const path = pathname(ctx);
  // @ts-ignore TODO
  const route = routes[path];
  if (method === "GET" || method === "POST") {
    ctx.assert(route, 404, "Not Found");
    const props = { data: {} };
    if (route.loader) props.data = await route.loader();
    if (method === "POST") merge(props.data, await route.action(ctx));
    const root = h(route.default, props);
    const res = render(root);
    return response(res);
  } else return next(ctx);
});

app.listen();
