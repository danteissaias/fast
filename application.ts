import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { Context, convert } from "./context.ts";
import { compose, Middleware } from "./middleware.ts";

export class Application {
  #middlewares: Middleware[] = [];

  use(...middlewares: Middleware[]) {
    this.#middlewares.push(...middlewares);
    return this;
  }

  handle(request: Request) {
    const ctx = new Context(request);
    const fallback: Middleware = (ctx) => ctx.throw(404, "Not Found");
    const next = compose(this.#middlewares.concat(fallback));
    return next(ctx).catch(convert);
  }

  async listen(opts: { hostname?: string; port: number } = { port: 8000 }) {
    if (!this.#middlewares.length) throw new Error("no middleware");
    const { hostname = "localhost", port } = opts;
    await serve((r) => this.handle(r), { hostname, port });
  }
}
