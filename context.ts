type Params = Record<string, string>;

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class Context {
  #url?: URL;

  constructor(
    public request: Request,
    public params: Params = {},
  ) {}

  get url(): URL {
    return this.#url ?? (this.#url = new URL(this.request.url));
  }

  assert(expr: unknown, status?: number, message?: string): asserts expr {
    if (!status) status = 500;
    if (!message) message = "Assertion failed";
    if (!expr) this.throw(status, message);
  }

  throw(status: number, message: string) {
    throw new HttpError(status, message);
  }
}
