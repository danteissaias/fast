import {
  serve,
  type ServeInit,
} from "https://deno.land/std@0.147.0/http/server.ts";
import { Context } from "./context.ts";
import { compose, type Middleware } from "./middleware.ts";

// deno-lint-ignore no-explicit-any
export const onError = (error: any) => {
  let { message, expose = false, init = { status: 500 } } = error;
  if (!expose) message = "Internal Server Error";
  return Response.json({ message }, init);
};

export const fb = () => new Response("Not Found", { status: 404 });

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
  serve(init?: ServeInit): Promise<void>;
}

export class Application {
  #patterns: Set<URLPattern>;
  #middlewares: Middleware[];
  #routes: Record<string, Middleware[]>;
  #cache: Record<string, Match | null>;

  constructor() {
    this.#patterns = new Set();
    this.#middlewares = [];
    this.#routes = this.#cache = {};

    // Define methods
    // deno-fmt-ignore-line
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;
    for (const method of methods) {
      this[method] = (path, ...middlewares) =>
        this.#add(path, method.toUpperCase(), middlewares);
    }
  }

  #add(path: string, method: string, middlewares: Middleware[]) {
    const id = method + path;
    const route = this.#routes[id];
    if (route) {
      route.push(...middlewares);
      return this;
    } else {
      const pattern = new URLPattern({ pathname: path });
      this.#patterns.add(pattern);
      this.#routes[id] = middlewares;
      return this;
    }
  }

  #match(url: string, method: string) {
    const id = method + url;
    const hit = this.#cache[id];
    if (hit) return hit;
    const pattern = [...this.#patterns].find((p) => p.test(url));
    const middlewares = this.#routes[method + pattern?.pathname];
    if (!middlewares) return this.#cache[id] = null;
    if (pattern?.pathname.includes(":")) {
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
    if (!match) return compose(this.#middlewares, fb)(ctx);
    const middlewares = this.#middlewares.concat(match.middlewares);
    return compose(middlewares, fb)(ctx);
  };

  serve = (opts?: ServeInit) => serve(this.handle, { onError, ...opts });
}
