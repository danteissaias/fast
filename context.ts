export class HttpError extends Error {
  expose = false;
  status = 500;
  init: ResponseInit = {};
}

export class Context {
  #url?: URL;

  constructor(
    readonly request: Request,
    public params: Record<string, string> = {},
  ) {}

  get url() {
    return this.#url ?? (this.#url = new URL(this.request.url));
  }

  assert(
    cond: unknown,
    message?: string,
    init: ResponseInit = {},
  ): asserts cond {
    if (cond) return;
    this.throw(message, init);
  }

  throw(message?: string, init: ResponseInit = {}) {
    const error = new HttpError(message);
    if (init.status) error.status = init.status;
    error.expose = error.status < 500 ? true : false;
    error.init = init;
    throw error;
  }
}
