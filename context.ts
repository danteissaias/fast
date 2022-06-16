export type Middleware = (
  ctx: Context,
) => Response | Promise<Response>;

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
    this.expose = status >= 500 ? true : false;
  }
}

interface ContextInit {
  request: Request;
  middlewares: Middleware[];
  params?: Record<string, string>;
}

export class Context {
  #url?: URL;
  request: Request;
  params: Record<string, string>;
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

  next = async () => await this.#middlewares[++this.#current](this);

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
