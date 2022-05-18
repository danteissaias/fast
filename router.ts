import { compose, Middleware } from "./middleware.ts";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

interface Route {
  pathname: string;
  method?: Method;
  middlewares: Middleware[];
}

interface MatchedRoutes {
  pattern: URLPattern;
  routes: Route[];
}

export class Router {
  #routes: Route[];
  #patterns: URLPattern[];
  #cache: Map<string, MatchedRoutes | null>;

  constructor() {
    this.#routes = [];
    this.#patterns = [];
    this.#cache = new Map();
  }

  all(pathname: string, ...middlewares: Middleware[]) {
    this.#add(pathname, middlewares);
    return this;
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

  #add(pathname: string, middlewares: Middleware[], method?: Method) {
    const current = this.#find(pathname, method);
    if (current) return current.middlewares.push(...middlewares);
    const route: Route = { pathname, middlewares, method };
    const pattern = new URLPattern({ pathname });
    this.#patterns.push(pattern);
    this.#routes.push(route);
  }

  #find(pattern: string, method?: Method): Route {
    const routes = this.#routes
      .filter((r) => r.pathname === pattern)
      .filter((r) => r.method === method);
    return routes[0];
  }

  // Cached matcher for URLPatterns
  // 2x faster than with no cache on benchmark
  #match(pathname: string, method?: Method): MatchedRoutes | null {
    const id = method ? method + ":" + pathname : pathname;
    const hit = this.#cache.get(id);
    if (hit) return hit;
    const pattern = this.#patterns.find((p) => p.test({ pathname }));
    if (!pattern) return null;
    const routes = this.#routes
      .filter((r) => r.pathname === pattern?.pathname)
      .filter((r) => method ? (r.method === method || !r.method) : true);
    const res = { routes, pattern };
    this.#cache.set(id, res);
    return res;
  }

  routes(): Middleware {
    return (ctx, next) => {
      const [url, method] = [ctx.url, ctx.request.method as Method];
      const match = this.#match(url.pathname, method);
      if (!match || match.routes.length === 0) return next(ctx);
      const { routes, pattern } = match;
      // Skip exec when not needed
      const param = routes[0].pathname.includes(":");
      if (param) ctx.params = pattern.exec(url)!.pathname.groups;
      const middlewares = routes.flatMap((r) => r.middlewares);
      const handler = compose(middlewares);
      return handler(ctx);
    };
  }
}
