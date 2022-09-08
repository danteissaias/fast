import { Application } from "./server/application.ts";
export default () => new Application();
export { Application } from "./server/application.ts";
export { Context } from "./server/context.ts";
export { compose } from "./server/middleware.ts";
export type { Middleware, NextFunction } from "./server/middleware.ts";
