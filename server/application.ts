import { Context } from "./context.ts";
import { compose, type Middleware } from "./middleware.ts";

interface Match {
  middlewares: Middleware[];
  params?: Record<string, string>;
}

export interface Application {
  get(path: string, ...middlewares: Middleware[]): Application;
  post(path: string, ...middlewares: Middleware[]): Application;
  put(path: string, ...middlewares: Middleware[]): Application;
  patch(path: string, ...middlewares: Middleware[]): Application;
  delete(path: string, ...middlewares: Middleware[]): Application;
  options(path: string, ...middlewares: Middleware[]): Application;
  head(path: string, ...middlewares: Middleware[]): Application;
}

export class Application {
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
      ? this.#middlewares.concat(match.middlewares)
      : this.#middlewares;
    return compose(middlewares)(ctx);
  };

  serve = (opts?: Deno.ServeOptions) => Deno.serve(this.handle, opts);
}
