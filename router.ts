import { compose, Middleware } from "./middleware.ts";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

interface Route {
  pattern: URLPattern;
  method: Method;
  middlewares: Middleware[];
}

export class Router {
  #routes: Route[];
  #patterns: URLPattern[];
  #cache: Map<string, Route | null>;

  constructor() {
    this.#routes = [];
    this.#patterns = [];
    this.#cache = new Map();
  }

  get(pathname: string, ...middlewares: Middleware[]) {
    this.#add(pathname, middlewares, "GET");
    return this;
  }

  post(pathname: string, ...middlewares: Middleware[]) {
    this.#add(pathname, middlewares, "POST");
    return this;
  }

  put(pathname: string, ...middlewares: Middleware[]) {
    this.#add(pathname, middlewares, "PUT");
    return this;
  }

  patch(pathname: string, ...middlewares: Middleware[]) {
    this.#add(pathname, middlewares, "PATCH");
    return this;
  }

  delete(pathname: string, ...middlewares: Middleware[]) {
    this.#add(pathname, middlewares, "DELETE");
    return this;
  }

  head(pathname: string, ...middlewares: Middleware[]) {
    this.#add(pathname, middlewares, "HEAD");
    return this;
  }

  options(pathname: string, ...middlewares: Middleware[]) {
    this.#add(pathname, middlewares, "OPTIONS");
    return this;
  }

  #add(pathname: string, middlewares: Middleware[], method: Method) {
    const pattern = new URLPattern({ pathname });
    const current = this.#find(pattern, method);
    if (current) return current.middlewares.push(...middlewares);
    const route: Route = { pattern, middlewares, method };
    if (!this.#patterns.includes(pattern)) this.#patterns.push(pattern);
    this.#routes.push(route);
  }

  #find(pattern: URLPattern, method: Method): Route | null {
    const matches = (r: Route) =>
      r.method === method && r.pattern.pathname === pattern.pathname;
    return this.#routes.find(matches) ?? null;
  }

  #match(pathname: string, method: Method): Route | null {
    const pattern = this.#patterns.find((p) => p.test({ pathname }));
    if (!pattern) return null;
    return this.#find(pattern, method);
  }

  // Cached matcher for URLPatterns
  // 1.5x faster than with no cache on benchmark
  #fast(pathname: string, method: Method): Route | null {
    const id = method + ":" + pathname;
    const hit = this.#cache.get(id);
    if (hit) return hit;
    const res = this.#match(pathname, method);
    this.#cache.set(id, res);
    return res;
  }

  routes(): Middleware {
    return (ctx, next): Promise<Response> => {
      const [url, method] = [ctx.url, ctx.request.method as Method];
      const route = this.#fast(url.pathname, method);
      if (!route) return next(ctx);
      const { middlewares, pattern } = route;
      // Skip exec when not needed
      // 2x faster on routes without param
      const param = pattern.pathname.indexOf(":") > -1;
      if (param) ctx.params = pattern.exec(url)!.pathname.groups;
      return compose(middlewares)(ctx);
    };
  }
}
