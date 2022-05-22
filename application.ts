import {
  ServeInit,
  Server,
} from "https://deno.land/std@0.140.0/http/server.ts";
import { Context, HttpError } from "./context.ts";
import { compose, Middleware } from "./middleware.ts";

export class Application {
  #middlewares: Middleware[] = [(ctx) => ctx.throw(404, "Not Found")];

  use(...middlewares: Middleware[]) {
    this.#middlewares.splice(-1, 0, ...middlewares);
    return this;
  }

  async handle(request: Request) {
    const ctx = new Context(request);
    const next = compose(this.#middlewares);
    return await next(ctx);
  }

  async serve(opts: ServeInit = {}) {
    if (!this.#middlewares.length) throw new Error("No middleware");
    const port = opts.port ?? 8000;
    const hostname = opts.hostname ?? "0.0.0.0";
    const handler = this.handle.bind(this);
    const onError = opts.onError ??
      ((err) => {
        console.log(err);
        const { message = "Internal Server Error", status = 500 } =
          err instanceof HttpError ? err : {};
        return Response.json({ message }, { status });
      });
    const server = new Server({ port, hostname, handler, onError });
    const s = server.listenAndServe();
    if (opts.onListen) opts.onListen({ port, hostname });
    console.log(`http://${hostname}:${port}/ 🚀`);
    return await s;
  }
}
