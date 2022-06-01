import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { Application } from "../application.ts";
import { Router } from "../router.ts";

Deno.test("router - hello world", async () => {
  const app = new Application();
  const router = new Router();
  router.get("/", () => "hello world");
  app.use(router.routes);
  const req = new Request("http://localhost:8000/");
  const res = await app.handle(req);
  assertEquals(res.status, 200);
  const text = await res.text();
  assertEquals(text, "hello world");
});

Deno.test("router - prefix", async () => {
  const app = new Application();
  const router = new Router({ prefix: "/api" });
  router.get("/", () => "hello world");
  app.use(router.routes);
  const req = new Request("http://localhost:8000/api");
  const res = await app.handle(req);
  assertEquals(res.status, 200);
  const text = await res.text();
  assertEquals(text, "hello world");
});

Deno.test("router - preflight", async () => {
  const app = new Application();
  const router = new Router();
  router.get("/", () => "hello world");
  router.post("/", () => "hello world");
  app.use(router.routes);
  const req = new Request("http://localhost:8000/", { method: "OPTIONS" });
  const res = await app.handle(req);
  assertEquals(res.status, 204);
  assertEquals(res.headers.get("allow"), "GET,POST");
});
