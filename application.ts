import { Context, type Middleware } from "./context.ts";
import { Router } from "./mod.ts";

const fallback = () => new Response("Not Found", { status: 404 });

export class Application {
  #router = new Router();
  #middlewares: Middleware[] = [this.#router.handle, fallback];

  get = (pathname: string, ...middlewares: Middleware[]) =>
    this.#router.get(pathname, ...middlewares);

  post = (pathname: string, ...middlewares: Middleware[]) =>
    this.#router.post(pathname, ...middlewares);

  put = (pathname: string, ...middlewares: Middleware[]) =>
    this.#router.put(pathname, ...middlewares);

  patch = (pathname: string, ...middlewares: Middleware[]) =>
    this.#router.patch(pathname, ...middlewares);

  delete = (pathname: string, ...middlewares: Middleware[]) =>
    this.#router.delete(pathname, ...middlewares);

  head = (pathname: string, ...middlewares: Middleware[]) =>
    this.#router.head(pathname, ...middlewares);

  options = (pathname: string, ...middlewares: Middleware[]) =>
    this.#router.options(pathname, ...middlewares);

  use(...middlewares: Middleware[]) {
    this.#middlewares.splice(-2, 0, ...middlewares);
    return this;
  }

  handle = async (request: Request) => {
    const middlewares = this.#middlewares;
    const ctx = new Context({ request, middlewares });
    try {
      return await ctx.next();
    } catch (error) {
      let { message, init = { status: 500 }, expose = false } = error;
      if (!expose) message = "Internal Server Error";
      return Response.json({ message }, init);
    }
  };
}
