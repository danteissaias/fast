import { serve } from "https://deno.land/std@0.143.0/http/server.ts";
import { Application } from "./mod.ts";

const app = new Application();

app.get("/", () => new Response("Hello"));

serve(app.handle);
