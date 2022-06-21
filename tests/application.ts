import { assertEquals } from "https://deno.land/std@0.144.0/testing/asserts.ts";
import { application } from "../mod.ts";

Deno.test("application", async () => {
  const app = application();
  app.use(() => "Hello, World!");
  const req = new Request("http://localhost:8000");
  const res = await app.handle(req);
  assertEquals(await res.text(), "Hello, World!");
});
