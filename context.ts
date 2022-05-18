export class HttpError extends Error {
  expose = false;
  status = 500;
  headers = new Headers();
}

// Convert error to response
export function convert(err: Error | HttpError) {
  const is = err instanceof HttpError;
  const httpErr = is ? err : new HttpError(err.message);
  const message = httpErr.expose ? httpErr.message : "Internal Server Error";
  const str = JSON.stringify({ message });
  const headers = { "content-type": "application/json" };
  return new Response(str, { status: httpErr.status, headers });
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

  throw(status: number, message?: string, headers?: Headers) {
    const error = new HttpError(message);
    error.status = status;
    error.expose = status < 500 ? true : false;
    if (headers) error.headers = headers;
    throw error;
  }
}
