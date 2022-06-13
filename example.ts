import { serve } from "https://deno.land/std@0.143.0/http/server.ts";
import { Application } from "./application.ts";
import { Router } from "./router.ts";

const app = new Application();
const router = new Router();

// app.use(router.handle);

// router.get("/", () => "hello world");
// router.post("/", () => "hello world");
// router.get("/204", () => null);
// router.get("/:val", (ctx) => ({ hello: ctx.params.val }));

app.use(() => new Response("Hello, World!"));

await serve(app.handle);
