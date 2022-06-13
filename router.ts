import { compose, Middleware } from "./middleware.ts";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

interface Route {
  pattern: URLPattern;
  middlewares: Partial<Record<string, Middleware[]>>;
}

interface Match {
  params?: Record<string, string>;
  middlewares: Middleware[];
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

  #find = (pathname: string) =>
    this.#routes.find((r) => r.pattern.test({ pathname }));

  match(pathname: string, method: string): Match | null {
    const id = pathname + method;
    if (this.#cache[id]) return this.#cache[id];
    const route = this.#find(pathname);
    if (!route) return this.#cache[id] = null;
    const middlewares = route.middlewares[method];
    if (!middlewares) return this.#cache[id] = null;
    const { pattern } = route;
    if (route.pattern.pathname.includes(":")) {
      const params = pattern.exec({ pathname })!.pathname.groups;
      return this.#cache[id] = { params, middlewares };
    } else return this.#cache[id] = { middlewares };
  }

  // TODO(danteissaias): Method not allowed
  // TODO(danteissaias): Handle OPTIONS requests
  // TODO(danteissaias): Handle HEAD requests
  // TODO(danteissaias): Cross-origin resource sharing
  handle: Middleware = (ctx, next) => {
    const match = this.match(ctx.url.pathname, ctx.request.method);
    if (!match) return next(ctx);
    if (match.params) ctx.params = match.params;
    return compose(match.middlewares)(ctx);
  };
}
