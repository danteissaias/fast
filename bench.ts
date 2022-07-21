import fast from "./mod.ts";

const app = fast();

app.get("/", () => new Response("Hello, World!"));

const req = new Request("https://localhost:8000");

Deno.bench("app.handle", async () => {
  await app.handle(req);
});
