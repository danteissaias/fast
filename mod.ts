import { Application } from "./server/application.ts";
export default () => new Application();
export { Context } from "./server/context.ts";
export type { Middleware, NextFunction } from "./server/middleware.ts";
