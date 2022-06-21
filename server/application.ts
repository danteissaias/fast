import { createContext } from "./context.ts";
import { compose, type Middleware } from "./middleware.ts";
import { router } from "./router.ts";

interface Application {
  use(...middleware: Middleware[]): Application;
  get(path: string, ...middlewares: Middleware[]): Application;
  post(path: string, ...middlewares: Middleware[]): Application;
  put(path: string, ...middlewares: Middleware[]): Application;
  patch(path: string, ...middlewares: Middleware[]): Application;
  delete(path: string, ...middlewares: Middleware[]): Application;
  options(path: string, ...middlewares: Middleware[]): Application;
  head(path: string, ...middlewares: Middleware[]): Application;
  handle(req: Request): Promise<Response>;
}

export function application(): Application {
  const appRouter = router();
  const fallback = () => new Response("Not Found", { status: 404 });
  const appMiddlewares: Middleware[] = [appRouter.handle, fallback];

  const app = {
    use: (...mw: Middleware[]) => {
      appMiddlewares.unshift(...mw);
      return app;
    },
    get: (path: string, ...middlewares: Middleware[]) => {
      appRouter.get(path, ...middlewares);
      return app;
    },
    post: (path: string, ...middlewares: Middleware[]) => {
      appRouter.post(path, ...middlewares);
      return app;
    },
    put: (path: string, ...middlewares: Middleware[]) => {
      appRouter.put(path, ...middlewares);
      return app;
    },
    patch: (path: string, ...middlewares: Middleware[]) => {
      appRouter.patch(path, ...middlewares);
      return app;
    },
    delete: (path: string, ...middlewares: Middleware[]) => {
      appRouter.delete(path, ...middlewares);
      return app;
    },
    options: (path: string, ...middlewares: Middleware[]) => {
      appRouter.options(path, ...middlewares);
      return app;
    },
    head: (path: string, ...middlewares: Middleware[]) => {
      appRouter.head(path, ...middlewares);
      return app;
    },
    handle: async (request: Request) => {
      try {
        const ctx = createContext({ request });
        return await compose(appMiddlewares)(ctx);
      } catch (error) {
        const init = error.init ?? { status: 500 };
        const message = error.expose ? error.message : "Internal Server Error";
        return new Response(message, init);
      }
    },
  };

  return app;
}
