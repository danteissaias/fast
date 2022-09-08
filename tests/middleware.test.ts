import { assertEquals } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import { compose, Context } from "../mod.ts";

const request = new Request("http://localhost:8000");
const params = {};
const ctx = new Context({ request, params });

Deno.test("compose", async () => {
  const fn = compose([() => "Hello, World!"]);
  const res = await fn(ctx).then((res) => res.text());
  assertEquals(res, "Hello, World!");

  const fn2 = compose([(ctx, next) => next(ctx), () => ({ a: 1 })]);
  const res2 = await fn2(ctx).then((res) => res.json());
  assertEquals(res2, { a: 1 });
});
