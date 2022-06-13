import { Context } from "./context.ts";
import { compose, Middleware } from "./middleware.ts";
import { Router } from "./router.ts";

const fallback = () => new Response("Not Found", { status: 404 });

export class Application {
  #router: Router;
  #middlewares: Middleware[] = [fallback];

  constructor() {
    this.#router = new Router();
    this.use(this.#router.handle);
  }

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
    this.#middlewares.splice(-1, 0, ...middlewares);
    return this;
  }

  handle = async (request: Request) => {
    const ctx = new Context(request);
    const next = compose(this.#middlewares);
    return await next(ctx);
  };
}
