import { serve } from "https://deno.land/std@0.139.0/http/server.ts";
import { cors, Router } from "./mod.ts";

const router = new Router({ middlewares: [cors] });
const subrouter = new Router();

router.use(cors);
router.get("/", () => "hello world");
subrouter.get("/error", (ctx) => ctx.throw(500, "Error thrown from route."));
router.use(subrouter.routes());

await serve(router.handle);
