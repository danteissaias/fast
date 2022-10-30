import { Context } from "./context.ts";
import compose from "./compose.ts";
import type { Middleware } from "./types.ts";

const fallback: Middleware = (ctx: Context) => ctx.throw(404, "Not found.");

interface Match {
  middlewares: Middleware[];
  params?: Record<string, string>;
}

export interface WebApp {
  get(path: string, ...middlewares: Middleware[]): WebApp;
  post(path: string, ...middlewares: Middleware[]): WebApp;
  put(path: string, ...middlewares: Middleware[]): WebApp;
  patch(path: string, ...middlewares: Middleware[]): WebApp;
  delete(path: string, ...middlewares: Middleware[]): WebApp;
  options(path: string, ...middlewares: Middleware[]): WebApp;
  head(path: string, ...middlewares: Middleware[]): WebApp;
}

export class WebApp {
  #middlewares: Middleware[];
  #routes: Map<string, Middleware[]>;

  #patterns: URLPattern[];
  #cache: Record<string, Match | null>;

  constructor() {
    this.#middlewares = [];
    this.#routes = new Map();

    this.#patterns = [];
    this.#cache = {};

    // Define methods
    // deno-fmt-ignore-line
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;
    for (const method of methods) {
      this[method] = (path, ...middlewares) =>
        this.#add(path, method.toUpperCase(), middlewares);
    }
  }

  use(...middlewares: Middleware[]) {
    this.#middlewares.push(...middlewares);
    return this;
  }

  #add(pathname: string, method: string, middlewares: Middleware[]) {
    const id = method + pathname;
    const route = this.#routes.get(id);
    if (route) route.push(...middlewares);
    else this.#routes.set(id, middlewares);

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
    const middlewares = this.#routes.get(id);
    if (!middlewares) return this.#cache[cid] = null;

    if (pathname.includes(":")) {
      const exec = pattern.exec(path);
      const params = exec?.pathname.groups;
      return this.#cache[cid] = { middlewares, params };
    } else return this.#cache[cid] = { middlewares };
  }

  handle = (request: Request) => {
    const match = this.#match(request.url, request.method);
    const ctx = new Context({ request, params: match?.params });
    const middlewares = match
      ? this.#middlewares.concat(match.middlewares, fallback)
      : this.#middlewares.concat(fallback);
    return compose(middlewares)(ctx);
  };

  serve = (opts?: Deno.ServeOptions) => Deno.serve(this.handle, opts);
}
