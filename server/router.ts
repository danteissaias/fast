import { Context } from "./context.ts";
import { compose, Middleware, NextFunction } from "./middleware.ts";

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

interface Route {
  pattern: URLPattern;
  middlewares: Partial<Record<string, Middleware[]>>;
}

interface Match {
  params?: Record<string, string>;
  middlewares: Middleware[];
  route: Route;
}

interface Router {
  get(path: string, ...middlewares: Middleware[]): Router;
  post(path: string, ...middlewares: Middleware[]): Router;
  put(path: string, ...middlewares: Middleware[]): Router;
  patch(path: string, ...middlewares: Middleware[]): Router;
  delete(path: string, ...middlewares: Middleware[]): Router;
  options(path: string, ...middlewares: Middleware[]): Router;
  head(path: string, ...middlewares: Middleware[]): Router;
  handle: Middleware;
}

export function router(): Router {
  const routes: Route[] = [];
  const cache: Record<string, Match | null> = {};

  const add = (
    pathname: string,
    method: HttpMethod,
    middlewares: Middleware[],
  ) => {
    const route = routes.find((r) => r.pattern.test({ pathname }));
    if (!route) {
      const pattern = new URLPattern({ pathname });
      routes.push({ pattern, middlewares: { [method]: middlewares } });
    } else if (route.middlewares[method]) {
      route.middlewares[method]!.push(...middlewares);
    } else route.middlewares[method] = middlewares;
  };

  const match = (url: string, method: string) => {
    const id = url + method;
    if (cache[id]) return cache[id];
    const route = routes.find((r) => r.pattern.test(url));
    if (!route) return cache[id] = null;
    const middlewares = route.middlewares[method] ?? [];
    const { pattern } = route;
    if (route.pattern.pathname.includes(":")) {
      const params = pattern.exec(url)!.pathname.groups;
      return cache[id] = { params, middlewares, route };
    } else return cache[id] = { middlewares, route };
  };

  const router = {
    get: (path: string, ...middewares: Middleware[]) => {
      add(path, "GET", middewares);
      return router;
    },
    post: (path: string, ...middewares: Middleware[]) => {
      add(path, "POST", middewares);
      return router;
    },
    put: (path: string, ...middewares: Middleware[]) => {
      add(path, "PUT", middewares);
      return router;
    },
    patch: (path: string, ...middewares: Middleware[]) => {
      add(path, "PATCH", middewares);
      return router;
    },
    delete: (path: string, ...middewares: Middleware[]) => {
      add(path, "DELETE", middewares);
      return router;
    },
    options: (path: string, ...middewares: Middleware[]) => {
      add(path, "OPTIONS", middewares);
      return router;
    },
    head: (path: string, ...middewares: Middleware[]) => {
      add(path, "HEAD", middewares);
      return router;
    },
    handle: (ctx: Context, next: NextFunction) => {
      const route = match(ctx.request.url, ctx.request.method);
      if (!route) return next(ctx);
      ctx.assert(route.middlewares.length, 405, "Method Not Allowed");
      const { params, middlewares } = route;
      if (params) ctx.params = params;
      return compose([...middlewares, next])(ctx);
    },
  };

  return router;
}
