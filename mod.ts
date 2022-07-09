import { Application } from "./server/application.ts";
export default () => new Application();
export { Application } from "./server/application.ts";
export { type Context, ServerError } from "./server/context.ts";
export type { Middleware, NextFunction } from "./server/middleware.ts";
