import { serve } from "https://deno.land/std@0.145.0/http/server.ts";
import { Application } from "./mod.ts";

const app = new Application();

app.get("/", () => "Hello, World!");

serve(app.handle);
