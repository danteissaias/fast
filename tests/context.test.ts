import { assertThrows } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import { Context } from "../mod.ts";

const request = new Request("http://localhost:8000/?id=1");
const params = {};
const ctx = new Context({ request, params });

Deno.test("ctx.throw", () => {
  const fn = () => ctx.throw(500, "Internal Server Error");
  assertThrows(fn);
});

Deno.test("ctx.assert", () => {
  const fn = () => ctx.assert(false, 400, "Bad Request");
  assertThrows(fn);
});
