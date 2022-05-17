import { Context, HttpError } from "./context.ts";
import { compose, decode, Middleware } from "./middleware.ts";

type HttpMethod =
  | "HEAD"
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

interface Route {
  pathname: string;
  method: HttpMethod;
  middlewares: Middleware[];
}

function matchPatterns(patterns: URLPattern[], pathname: string) {
  const pattern = patterns.find((p) => p.test(pathname));
  if (!pattern) return null;
  const res = pattern.exec(pathname);
  if (!res) throw new Error("no result from pattern exec");
  return { pattern, res };
}

interface RouterInit {
  middlewares?: Middleware[];
}

export class Router {
  #routes: Route[];
  #patterns: URLPattern[];
  #middlewares: Middleware[];

  constructor({ middlewares = [] }: RouterInit = {}) {
    this.#routes = [];
    this.#patterns = [];
    this.#middlewares = middlewares.concat([this.#error]);
    this.handle = this.handle.bind(this);
  }

  #error: Middleware = async (ctx, next) => {
    try {
      return await next(ctx);
    } catch (error) {
      const { status, message } = error instanceof HttpError
        ? error
        : new HttpError(500, error.message);
      return new Response(message, { status });
    }
  };

  // Accepts middlewhere and router
  use(...middlewares: Middleware[]) {
    this.#middlewares.push(...middlewares);
    return this;
  }

  get(path: string, ...middlewares: Middleware[]) {
    this.#add(path, "GET", middlewares);
    return this;
  }

  post(path: string, ...middlewares: Middleware[]) {
    this.#add(path, "POST", middlewares);
    return this;
  }

  put(path: string, ...middlewares: Middleware[]) {
    this.#add(path, "PUT", middlewares);
    return this;
  }

  patch(path: string, ...middlewares: Middleware[]) {
    this.#add(path, "PATCH", middlewares);
    return this;
  }

  delete(path: string, ...middlewares: Middleware[]) {
    this.#add(path, "DELETE", middlewares);
    return this;
  }

  head(path: string, ...middlewares: Middleware[]) {
    this.#add(path, "HEAD", middlewares);
    return this;
  }

  #add(pathname: string, method: HttpMethod, middlewares: Middleware[]) {
    const pattern = new URLPattern({ pathname });
    const has = this.#patterns.includes(pattern);
    if (!has) this.#patterns.push(pattern);
    const route = this.#find(pathname, method);
    if (route) route.middlewares.push(...middlewares);
    else this.#routes.push({ pathname, method, middlewares });
  }

  #find(pathname: string, method: string) {
    const cmp = (r: Route) => r.method === method && r.pathname === pathname;
    return this.#routes.find(cmp);
  }

  // Returns a context and middleware stack
  #match(request: Request): [Context, Middleware[]] {
    const ctx = new Context(request, {});
    const middlewares: Middleware[] = this.#middlewares;
    const result = matchPatterns(this.#patterns, request.url);
    if (!result) return [ctx, middlewares];
    const route = this.#find(result.pattern.pathname, request.method);
    const mta: Middleware = (ctx) => ctx.throw(405, "Method Not Allowed");
    if (!route) return [ctx, middlewares.concat(mta)];
    ctx.params = result.res.pathname.groups;
    return [ctx, middlewares.concat(route.middlewares)];
  }

  routes(): Middleware {
    return async (ctx, next) => {
      const [{ params }, middlewares] = this.#match(ctx.request);
      ctx.params = params;
      const handler = compose(middlewares.concat(next));
      return await handler(ctx);
    };
  }

  async handle(request: Request) {
    const [ctx, middlewares] = this.#match(request);
    const fallback = () => new Response("Not Found", { status: 404 });
    const handler = compose(middlewares.concat(fallback));
    const res = await handler(ctx);
    return decode(res);
  }
}
