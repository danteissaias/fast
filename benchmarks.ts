import { Application, Router } from "./mod.ts";

const app1 = new Application();
const app2 = new Application();
const router = new Router();
router.get("/", () => new Response("Hello, World!"));
app2.use(router.handle);

const r = new Request("http://localhost:8000/");

Deno.bench({
  name: "app",
  fn() {
    app1.handle(r);
  },
});

Deno.bench({
  name: "app with router",
  baseline: true,
  fn() {
    app2.handle(r);
  },
});
