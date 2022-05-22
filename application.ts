import { Context, convert } from "./context.ts";
import { compose, Middleware } from "./middleware.ts";

const fallback: Middleware = (ctx) => ctx.throw(404, "Not Found");

export interface ListenInit extends Partial<Deno.ListenOptions> {
  /** An AbortSignal to close the server and all connections. */
  signal?: AbortSignal;
}

export class Application {
  #middlewares: Middleware[] = [fallback];

  use(...middlewares: Middleware[]) {
    // Insert new middlewares before fallback:
    // - Faster than concatting fallback in handle()
    // - We want to keep handle() standalone so can't push fallback in listen()
    this.#middlewares.splice(-1, 0, ...middlewares);
    return this;
  }

  async handle(request: Request) {
    const ctx = new Context(request);
    const next = compose(this.#middlewares);
    return await next(ctx).catch(convert);
  }

  async #serveHttp(conn: Deno.Conn) {
    for await (const ev of Deno.serveHttp(conn)) {
      const res = await this.handle(ev.request);
      ev.respondWith(res);
    }
  }

  async listen(opts: ListenInit = {}) {
    if (!this.#middlewares.length) throw new Error("no middleware");
    const { hostname = "0.0.0.0", port = 8000, signal } = opts;
    const server = Deno.listen({ hostname, port });
    for await (const conn of server) this.#serveHttp(conn);
    signal?.addEventListener("abort", () => server.close());
    console.log(`http://${hostname}:${port}/ 🚀`);
  }
}
