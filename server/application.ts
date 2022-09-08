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
  use(...middlewares: Middleware[]): Application;
  handle(request: Request): Promise<Response>;
  serve(opts?: Deno.ServeOptions): Promise<void>;
}

export class Application {
  #middlewares: Middleware[];
  #cache: Record<string, Match | null>;
  #patterns: Set<URLPattern>;
  #routes: Record<string, Middleware[]>;

  constructor() {
    this.#middlewares = [];
    this.#cache = {};
    this.#routes = {};
    this.#patterns = new Set();

    // Define methods
    // deno-fmt-ignore-line
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;
    for (const method of methods) {
      this[method] = (path, ...middlewares) =>
        this.#add(path, method.toUpperCase(), middlewares);
    }
  }

  #add(pathname: string, method: string, middlewares: Middleware[]) {
    const id = method + pathname;
    const route = this.#routes[id];
    const pattern = new URLPattern({ pathname });
    this.#patterns.add(pattern);
    if (route) route.push(...middlewares);
    else this.#routes[id] = middlewares;
    return this;
  }

  #match(url: string, method: string) {
    const id = method + url;
    const hit = this.#cache[id];
    if (hit) return hit;
    const pattern = [...this.#patterns].find((p) => p.test(url));
    if (!pattern) return this.#cache[id] = null;
    const middlewares = this.#routes[method + pattern.pathname];
    if (!middlewares) return this.#cache[id] = null;
    if (pattern.pathname.includes(":")) {
      const exec = pattern.exec(url);
      const params = exec?.pathname.groups;
      return this.#cache[id] = { middlewares, params };
    } else return this.#cache[id] = { middlewares };
  }

  use(...middlewares: Middleware[]) {
    this.#middlewares = this.#middlewares.concat(middlewares);
    return this;
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
