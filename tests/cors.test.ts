import { assertEquals } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import fast, { middleware } from "../mod.ts";

const opts = {
  origin: "*",
  allowedHeaders: ["Content-Type", "Charset"],
  methods: ["GET, HEAD, OPTIONS"],
  credentials: true,
  exposedHeaders: ["Content-Type"],
  maxAge: 86400,
};

const app = fast();

const cors = middleware.cors(opts);
app.use(cors);

app.get("/", (_ctx) => {
  return "Hello, world";
});

app.options("/", (_ctx) => {
  return "Hello, world";
});

Deno.test("cors-middleware", async () => {
  const req = new Request("http://localhost:8000");
  const res = await app.handle(req);

  assertEquals(res.headers.get("access-control-allow-origin"), "*");
  assertEquals(res.headers.get("access-control-allow-credentials"), "true");
  assertEquals(
    res.headers.get("access-control-expose-headers"),
    "Content-Type",
  );

  const req2 = new Request("http://localhost:8000", { method: "OPTIONS" });
  const res2 = await app.handle(req2);

  assertEquals(res2.headers.get("access-control-allow-origin"), "*");
  assertEquals(res2.headers.get("access-control-allow-credentials"), "true");
  assertEquals(
    res2.headers.get("access-control-expose-headers"),
    "Content-Type",
  );

  assertEquals(
    res2.headers.get("access-control-allow-methods"),
    "GET, HEAD, OPTIONS",
  );
  assertEquals(res2.headers.get("access-control-max-age"), "86400");
});
