import { serve } from "https://deno.land/std@0.143.0/http/server.ts";
import { Application } from "./application.ts";

const app = new Application();

app.get("/", () => {
  return new Response("Hello, World!");
});

serve(app.handle);
