import {
  serve,
  type ServeInit,
} from "https://deno.land/std@0.148.0/http/server.ts";
import { Context } from "./context.ts";
import { compose, type Middleware } from "./middleware.ts";

interface Match {
  middlewares: Middleware[];
  params?: Record<string, string>;
}

interface Route {
  pattern: URLPattern;
  middlewares: Record<string, Middleware[]>;
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
  listen(init?: ServeInit): Promise<void>;
}

export class Application {
  #middlewares: Middleware[];
  #routes: Record<string, Route>;
  #cache: Record<string, Match | null>;
  // TODO: Replace with URLPatternList
  get #patterns() {
    return Object.values(this.#routes)
      .map((r) => r.pattern);
  }

  constructor() {
    this.#middlewares = [];
    this.#routes = {};
    this.#cache = {};

    // Define methods
    // deno-fmt-ignore-line
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;
    for (const method of methods) {
      this[method] = (path, ...middlewares) =>
        this.#add(path, method.toUpperCase(), middlewares);
    }
  }

  #add(pathname: string, method: string, middlewares: Middleware[]) {
    const route = this.#routes[pathname] ?? {};
    route.pattern = new URLPattern({ pathname });
    route.middlewares = { [method]: middlewares };
    this.#routes[pathname] = route;
    return this;
  }

  #match(url: string, method: string) {
    const id = method + url;
    const hit = this.#cache[id];
    if (hit) return hit;
    const pattern = this.#patterns.find((p) => p.test(url));
    if (!pattern) return this.#cache[id] = null;
    const route = this.#routes[pattern.pathname];
    const middlewares = route.middlewares[method];
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
    if (!match) return compose(this.#middlewares)(ctx);
    const middlewares = this.#middlewares.concat(match.middlewares);
    return compose(middlewares)(ctx);
  };

  listen = (init?: ServeInit) => serve(this.handle, init);
}
