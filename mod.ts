/**
 * Minimalist web framework for Deno.
 *
 * ```ts
 * import { serve } from "https://deno.land/std/http/server.ts";
 * import { application } from "https://deno.land/x/fast/mod.ts";
 *
 * const app = application();
 *
 * app.get("/", () => "Hello, World!");
 *
 * await serve(app.handle);
 * ```
 *
 * @module
 */
export { application } from "./server/application.ts";
export { createContext } from "./server/context.ts";
export type { Context, HttpError } from "./server/context.ts";
export type {
  Middleware,
  MiddlewareResponse,
  NextFunction,
} from "./server/middleware.ts";
export { router } from "./server/router.ts";
