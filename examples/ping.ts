import fast from "https://deno.land/x/fast/mod.ts";

const app = fast();

app.get("/ping", () => "Pong!");

await app.serve();
