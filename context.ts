import type { Middleware } from "./middleware.ts";

export class HttpError extends Error {
  expose: boolean;
  init: ResponseInit;

  constructor(
    status: number,
    message?: string,
    init: ResponseInit = { status },
  ) {
    super(message);
    this.init = init;
    this.expose = status >= 500 ? false : true;
  }
}

const isResponse = (res: unknown): res is Response => res instanceof Response;

const isString = (res: unknown): res is string =>
  Object.prototype.toString.call(res) === "[object String]";

const isEmpty = (res: unknown): res is null | void =>
  (res !== 0 && !res) || res === null || res === undefined;

const isJSON = (res: unknown) => {
  try {
    const s = JSON.stringify(res);
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
};

interface ContextInit {
  request: Request;
  middlewares: Middleware[];
  params?: Record<string, string>;
}

export class Context {
  #url?: URL;
  readonly request: Request;
  readonly params: Record<string, string>;
  #middlewares: Middleware[];
  #current = -1;

  constructor({ request, middlewares, params = {} }: ContextInit) {
    this.request = request;
    this.params = params;
    this.#middlewares = middlewares;
  }

  get url() {
    return this.#url ?? (this.#url = new URL(this.request.url));
  }

  async next() {
    const cur = ++this.#current;
    const handler = this.#middlewares[cur];
    const res = await handler(this);
    if (isResponse(res)) return res;
    if (isString(res)) return new Response(res);
    if (isJSON(res)) return Response.json(res);
    if (isEmpty(res)) return new Response(null, { status: 204 });
    throw new Error("Invalid response.");
  }

  clone({
    request = this.request,
    middlewares = [],
    params = this.params,
  }: Partial<ContextInit>) {
    middlewares = middlewares.concat(this.#middlewares);
    return new Context({ request, middlewares, params });
  }

  assert(
    cond: unknown,
    status: number,
    message?: string,
    init: ResponseInit = { status },
  ): asserts cond {
    if (cond) return;
    throw new HttpError(status, message, init);
  }
}
