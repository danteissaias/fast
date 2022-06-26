import { assertEquals } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { Application } from "./mod.ts";

const app = new Application();

app.get("/", () => "Hello, World!");

Deno.test("200", async () => {
  const req = new Request("http://localhost:8000");
  const res = await app.handle(req);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), "Hello, World!");
});

Deno.test("404", async () => {
  const req = new Request("http://localhost:8000/404");
  const res = await app.handle(req);
  assertEquals(res.status, 404);
  assertEquals(await res.text(), "Not Found");
});
