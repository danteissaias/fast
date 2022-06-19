import { serve } from "https://deno.land/std@0.144.0/http/server.ts";
import { Application } from "../mod.ts";

const app = new Application();

app.get("/", () => new Response("Hello, World!"));

await serve(app.handle);
