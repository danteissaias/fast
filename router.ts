import { Context } from "./context.ts";
import type { Middleware } from "./middleware.ts";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

interface Route {
  pattern: URLPattern;
  middlewares: Partial<Record<string, Middleware[]>>;
}

interface Match {
  params?: Record<string, string>;
  middlewares: Middleware[];
  route: Route;
}

export class Router {
  #routes: Route[];
  #cache: Record<string, Match | null>;

  constructor() {
    this.#routes = [];
    this.#cache = {};
  }

  get = (pathname: string, ...middlewares: Middleware[]) =>
    this.#add(pathname, middlewares, "GET");

  post = (pathname: string, ...middlewares: Middleware[]) =>
    this.#add(pathname, middlewares, "POST");

  put = (pathname: string, ...middlewares: Middleware[]) =>
    this.#add(pathname, middlewares, "PUT");

  patch = (pathname: string, ...middlewares: Middleware[]) =>
    this.#add(pathname, middlewares, "PATCH");

  delete = (pathname: string, ...middlewares: Middleware[]) =>
    this.#add(pathname, middlewares, "DELETE");

  head = (pathname: string, ...middlewares: Middleware[]) =>
    this.#add(pathname, middlewares, "HEAD");

  options = (pathname: string, ...middlewares: Middleware[]) =>
    this.#add(pathname, middlewares, "OPTIONS");

  #add(pathname: string, middlewares: Middleware[], method: Method) {
    const route = this.#find(pathname);
    if (!route) {
      const pattern = new URLPattern({ pathname });
      this.#routes.push({ pattern, middlewares: { [method]: middlewares } });
    } else if (route.middlewares[method]) {
      route.middlewares[method]!.push(...middlewares);
    } else route.middlewares[method] = middlewares;
    return this;
  }

  #find = (url: string) => this.#routes.find((r) => r.pattern.test(url));

  match(url: string, method: string) {
    const id = url + method;
    if (this.#cache[id]) return this.#cache[id];
    const route = this.#find(url);
    if (!route) return this.#cache[id] = null;
    const middlewares = route.middlewares[method] ?? [];
    const { pattern } = route;
    if (route.pattern.pathname.includes(":")) {
      const params = pattern.exec(url)!.pathname.groups;
      return this.#cache[id] = { params, middlewares, route };
    } else return this.#cache[id] = { middlewares, route };
  }

  handle: Middleware = (ctx: Context) => {
    const match = this.match(ctx.request.url, ctx.request.method);
    if (!match) return ctx.next();
    ctx.assert(match.middlewares.length, 405, "Method Not Allowed");
    const { params, middlewares } = match;
    return ctx.clone({ middlewares, params }).next();
  };
}
