export class HttpError extends Error {
  expose = false;
  status = 500;
  headers = new Headers();
}

// Convert error to response
export function convert(err: Error | HttpError) {
  const httpErr = err instanceof HttpError ? err : new HttpError(err.message);
  const message = httpErr.expose ? httpErr.message : "Internal Server Error";
  return Response.json({ message }, { status: httpErr.status });
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
    headers?: Headers,
  ): asserts cond {
    if (cond) return;
    this.throw(status, message, headers);
  }

  throw(status: number, message?: string, headers?: Headers) {
    const error = new HttpError(message);
    error.status = status;
    error.expose = status < 500 ? true : false;
    if (headers) error.headers = headers;
    throw error;
  }
}
