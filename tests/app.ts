import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";
import { Application } from "../application.ts";

Deno.test("application", async () => {
  const app = new Application();
  app.get("/", () => new Response("Hello, World!"));
  const req = new Request("http://localhost:8000/");
  const res = await app.handle(req);
  assertEquals(await res.text(), "Hello, World!");
});
