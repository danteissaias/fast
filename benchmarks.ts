import { Application, Router } from "./mod.ts";

const app1 = new Application();
const app2 = new Application();
const router = new Router();
for (let i = 0; i < 999; i++) router.get("/" + i, () => new Response(`${i}`));
app2.use(router.handle);

const r = new Request("http://localhost:8000/582");

Deno.bench({
  name: "app",
  fn() {
    app1.handle(r);
  },
});
