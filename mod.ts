export type Middleware = (
  ctx: Context,
  next: NextFunction,
) => Promise<unknown> | unknown;

export type NextFunction = (
  ctx?: Context,
) => Promise<Response>;

export interface Context {
  request: Request;
  params: Record<string, string>;
  assert: CtxAssertFn;
}

type CtxAssertFn = (
  expr: unknown,
  status: number,
  message: string,
  init?: ResponseInit,
) => asserts expr;

export class ServerError extends Error {
  expose: boolean;
  init: ResponseInit;

  constructor(status: number, message?: string, init: ResponseInit = {}) {
    super(message ?? "Internal Server Error");
    this.init = { status, ...init };
    this.expose = status < 500;
  }
}

const assert: CtxAssertFn = (expr, status, message, init) => {
  if (expr) return;
  throw new ServerError(status, message, init);
};

interface ContextInit {
  request: Request;
  params?: Record<string, string>;
}

const createContext = ({ request, params = {} }: ContextInit): Context => ({
  request,
  params,
  assert,
});

const isJSON = (val: unknown) => {
  try {
    const s = JSON.stringify(val);
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
};

const decode = (res: unknown) => {
  if (res instanceof Response) return res;
  if (typeof res === "string") return new Response(res);
  if (isJSON(res)) return Response.json(res);
  throw new Error("Invalid response");
};

const compose = (middlewares: Middleware[]) => {
  let ctx: Context;
  let cur = -1;
  const max = middlewares.length;
  let next: NextFunction;
  return next = async (ctx2 = ctx) =>
    ++cur >= max
      ? new Response("Not Found", { status: 404 })
      : decode(await middlewares[cur](ctx2, next));
};

// deno-lint-ignore no-explicit-any
const convert = (error: any) => {
  let { message, expose = false, init = { status: 500 } } = error;
  if (!expose) message = "Internal Server Error";
  return Response.json({ message }, init);
};

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
    if (route) route.push(...middlewares);
    const pattern = new URLPattern({ pathname: path });
    this.#patterns.add(pattern);
    this.#routes[id] = middlewares;
    return this;
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
    const at = this.#middlewares.length - 1;
    this.#middlewares.splice(at, 0, ...middlewares);
  }

  handle = (request: Request) => {
    const match = this.#match(request.url, request.method);
    const ctx = createContext({ request, params: match?.params });
    const middlewares = match
      ? this.#middlewares.concat(match.middlewares)
      : this.#middlewares;
    return compose(middlewares)(ctx).catch(convert);
  };
}

export default function fast() {
  return new Application();
}
