import fast from "https://deno.land/x/fast@5.0.0/mod.ts";

const app = fast();

app.get("/ping", () => "Pong!");

await app.serve();
