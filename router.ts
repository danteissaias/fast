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

  #find(pattern: URLPattern, method: Method): Route {
    const routes = this.#routes
      .filter((r) => r.pattern === pattern)
      .filter((r) => r.method === method);
    return routes[0];
  }

  // Cached matcher for URLPatterns
  // 2x faster than with no cache on benchmark
  #match(pathname: string, method: Method): Route | null {
    const id = method + ":" + pathname;
    const hit = this.#cache.get(id);
    if (hit) return hit;
    const pattern = this.#patterns.find((p) => p.test({ pathname }));
    if (pattern) {
      const route = this.#find(pattern, method);
      this.#cache.set(id, route);
      return route;
    }

    this.#cache.set(id, null);
    return null;
  }

  routes(): Middleware {
    return (ctx, next) => {
      const [url, method] = [ctx.url, ctx.request.method as Method];
      const route = this.#match(url.pathname, method);
      if (!route) return next(ctx);
      const { middlewares, pattern } = route;
      // Skip exec when not needed
      const param = pattern.pathname.includes(":");
      if (param) ctx.params = pattern.exec(url)!.pathname.groups;
      const handler = compose(middlewares);
      return handler(ctx);
    };
  }
}
