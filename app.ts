import { serve, ServeInit } from "https://deno.land/std@0.163.0/http/server.ts";
import { Context } from "./context.ts";
import decode from "./decode.ts";
import { Handler, ServerError } from "./types.ts";

const notFound = {
  status: 404,
  message: "The requested resource doesn't exist.",
};

interface Match {
  handler: Handler;
  params?: Record<string, string>;
}

export interface WebApp {
  get(path: string, handler: Handler): WebApp;
  post(path: string, handler: Handler): WebApp;
  put(path: string, handler: Handler): WebApp;
  patch(path: string, handler: Handler): WebApp;
  delete(path: string, handler: Handler): WebApp;
  options(path: string, handler: Handler): WebApp;
  head(path: string, handler: Handler): WebApp;
}

export class WebApp {
  #routes: Map<string, Handler>;
  #patterns: URLPattern[];
  #cache: Record<string, Match | null>;

  constructor() {
    this.#routes = new Map();
    this.#patterns = [];
    this.#cache = {};

    // Define methods
    // deno-fmt-ignore-line
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;
    for (const method of methods) {
      this[method] = (path, handler) =>
        this.#add(path, method.toUpperCase(), handler);
    }
  }

  #add(pathname: string, method: string, handler: Handler) {
    const id = method + pathname;
    this.#routes.set(id, handler);

    const pattern = new URLPattern({ pathname });
    const has = this.#patterns.find((p) => p.pathname === pathname);
    if (!has) this.#patterns.push(pattern);

    return this;
  }

  #match(path: string, method: string) {
    const cid = method + path;
    const hit = this.#cache[cid];
    if (hit) return hit;

    const pattern = this.#patterns.find((p) => p.test(path));
    if (!pattern) return this.#cache[cid] = null;
    const { pathname } = pattern;

    const id = method + pathname;
    const handler = this.#routes.get(id);
    if (!handler) return this.#cache[cid] = null;

    if (pathname.includes(":")) {
      const exec = pattern.exec(path);
      const params = exec?.pathname.groups;
      return this.#cache[cid] = { handler, params };
    } else return this.#cache[cid] = { handler };
  }

  handle = async (request: Request) => {
    try {
      const match = this.#match(request.url, request.method);
      const ctx: Context = new Context({ request });
      ctx.assert(match, notFound);
      ctx.params = match.params ?? {};
      const res = await match.handler(ctx);
      return decode(res, ctx.status);
    } catch (error) {
      const err = ServerError.from(error);
      const res = err.serialize();
      return decode(res, err.status);
    }
  };

  serve = (opts?: ServeInit) => serve(this.handle, opts);
}
