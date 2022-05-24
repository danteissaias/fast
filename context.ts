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
    status: number,
    message?: string,
    init: ResponseInit = {},
  ): asserts cond {
    if (cond) return;
    this.throw(status, message, init);
  }

  throw(
    status: number,
    message?: string,
    init: ResponseInit = {},
  ) {
    const error = new HttpError(message);
    error.status = status;
    if (!init.status) init.status = status;
    error.expose = error.status < 500 ? true : false;
    error.init = init;
    throw error;
  }
}
