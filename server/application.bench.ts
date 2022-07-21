import { Application } from "./application.ts";

const app = new Application();

app.get("/", () => new Response("Hello, World!"));

const req = new Request("https://localhost:8000");

Deno.bench("app.handle", async () => {
  await app.handle(req);
});
