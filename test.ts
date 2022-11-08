import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import fast, { Context } from "./mod.ts";

function makeRequest(path: string, init: RequestInit = {}) {
  path = "https://example.com" + path;
  return new Request(path, { ...init });
}

const app = fast();

Deno.test("404", async () => {
  const req = makeRequest("/404");
  const res = await app.handle(req);
  assertEquals(res.status, 404);
});

// deno-fmt-ignore-line
const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;
for (const method of methods) {
  const id = crypto.randomUUID();
  app[method]("/", () => id);
  Deno.test(`app.${method}`, async () => {
    const req = makeRequest("/", { method });
    const res = await app.handle(req);
    const data = await res.text();
    assertEquals(res.status, 200);
    assertEquals(data, id);
  });
}

const err = {
  status: 400,
  code: "",
  message: "",
};

app.get("/assert", (ctx: Context) => ctx.assert(false, err));
app.get("/assert2", (ctx: Context) => ctx.assert(true, err));
app.get("/throw", (ctx: Context) => ctx.throw(err));
// deno-fmt-ignore
app.get("/throw2", () => { throw new Error() });

Deno.test("ctx.assert", async () => {
  const req = makeRequest("/assert");
  const res = await app.handle(req);
  assertEquals(res.status, 400);

  const req2 = makeRequest("/assert2");
  const res2 = await app.handle(req2);
  assertEquals(res2.status, 204);
});

Deno.test("ctx.throw", async () => {
  const req = makeRequest("/throw");
  const res = await app.handle(req);
  assertEquals(res.status, 400);

  const req2 = makeRequest("/throw2");
  const res2 = await app.handle(req2);
  const data = await res2.json();
  assertEquals(res2.status, 500);
  assertEquals(data.error.message, "An unknown error occurred.");
});

app.get("/pages/:id", (ctx) => ctx.params.id);

Deno.test("ctx.params", async () => {
  const req = makeRequest("/pages/abc");
  const res = await app.handle(req);
  const data = await res.text();
  assertEquals(res.status, 200);
  assertEquals(data, "abc");
});

app.post("/body", async (ctx) => {
  const body = await ctx.body;
  return body;
});

Deno.test("ctx.body", async () => {
  const body = "abc";
  const req = makeRequest("/body", { body, method: "POST" });
  const res = await app.handle(req);
  assertEquals(res.status, 400);
});

app.get("/string", () => "abc");
app.get("/array", () => [1, 2, 3]);
app.get("/json", () => ({ abc: 123 }));
app.get("/void", () => {});
app.get("/res", () => new Response("Hello", { status: 201 }));

Deno.test("decode", async () => {
  const req = makeRequest("/string");
  const res = await app.handle(req);
  const data = await res.text();
  assertEquals(res.status, 200);
  assertEquals(data, "abc");

  const req2 = makeRequest("/array");
  const res2 = await app.handle(req2);
  const data2 = await res2.json();
  assertEquals(res2.status, 200);
  assertEquals(data2, [1, 2, 3]);

  const req3 = makeRequest("/json");
  const res3 = await app.handle(req3);
  const data3 = await res3.json();
  assertEquals(res3.status, 200);
  assertEquals(data3, { abc: 123 });

  const req4 = makeRequest("/void");
  const res4 = await app.handle(req4);
  assertEquals(res4.status, 204);

  const req5 = makeRequest("/res");
  const res5 = await app.handle(req5);
  assertEquals(res5.status, 201);
});
