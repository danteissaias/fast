import { Application } from "../application.ts";
import { Router } from "../router.ts";
import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";

async function send(app: Application, pathname: string) {
  const req = new Request("http://localhost:8000" + pathname);
  return await app.handle(req);
}

Deno.test("hello world", async () => {
  const app = new Application();
  const router = new Router();
  router.all("/", () => "hello world");
  app.use(router.routes());
  const res = await send(app, "/");
  assertEquals(res.status, 200);
  const text = await res.text();
  assertEquals(text, "hello world");
  const res2 = await send(app, "/404");
  assertEquals(res2.status, 404);
  const err = await res2.json();
  assertEquals(err, { message: "Not Found" });
});
