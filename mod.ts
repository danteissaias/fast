// deno-lint-ignore no-explicit-any
type DefaultState = any;

export interface Context<S = DefaultState> {
  request: Request;
  params: Record<string, string>;
  state: S;
  assert(
    expr: unknown,
    status: number,
    message: string,
    init?: ResponseInit,
  ): asserts expr;
}

interface ContextInit {
  request: Request;
  params?: Record<string, string>;
}

interface ServerError {
  message: string;
  expose?: boolean;
  init?: ResponseInit;
}

const createContext = <S = DefaultState>(
  { request, params = {} }: ContextInit,
): Context<S> => ({
  request,
  params,
  state: {} as S,
  assert(expr, status, message, init = { status }) {
    if (expr) return;
    init.status = status;
    throw { expose: status < 500, message, init };
  },
});

export type NextFunction<S = DefaultState> = (
  ctx: Context<S>,
) => Promise<Response>;

export type Middleware<S = DefaultState> = (
  ctx: Context<S>,
  next: NextFunction<S>,
) => Promise<unknown> | unknown;

const decode = (res: unknown) => {
  if (res instanceof Response) return res;
  if (typeof res === "string") return new Response(res);
  if (typeof res === "object") return Response.json(res);
  throw new Error("Invalid response");
};

const compose = (middlewares: Middleware[]) => {
  let cur = -1;
  let next: NextFunction;
  return next = async (ctx) => {
    const res = await middlewares[++cur](ctx, next);
    return decode(res);
  };
};

const convert = (error: ServerError) => {
  let { message, expose = false, init = { status: 500 } } = error;
  if (!expose) message = "Internal Server Error";
  return Response.json({ message }, init);
};

const fallback = () => new Response("Not Found", { status: 404 });

interface Match {
  middlewares: Middleware[];
  params?: Record<string, string>;
}

export interface Application<S = DefaultState> {
  get(path: string, ...middlewares: Middleware<S>[]): Application<S>;
  post(path: string, ...middlewares: Middleware<S>[]): Application<S>;
  put(path: string, ...middlewares: Middleware<S>[]): Application<S>;
  patch(path: string, ...middlewares: Middleware<S>[]): Application<S>;
  delete(path: string, ...middlewares: Middleware<S>[]): Application<S>;
  options(path: string, ...middlewares: Middleware<S>[]): Application<S>;
  head(path: string, ...middlewares: Middleware<S>[]): Application<S>;
}

export class Application<S> {
  #middlewares: Middleware[];
  #patterns: Set<URLPattern>;
  #routes: Record<string, Middleware[]>;
  #cache: Record<string, Match | null>;

  constructor() {
    this.#middlewares = [];
    this.#patterns = new Set();
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

  use(...middlewares: Middleware<S>[]) {
    this.#middlewares.splice(0, 0, ...middlewares);
    return this;
  }

  handle = (request: Request) => {
    const ctx = createContext<S>({ request });
    const { url, method } = request;
    const match = this.#match(url, method);
    ctx.params = match?.params ?? {};
    let middlewares = match
      ? this.#middlewares.concat(match.middlewares)
      : this.#middlewares;
    middlewares = middlewares.concat(fallback);
    return compose(middlewares)(ctx).catch(convert);
  };
}
