import { serve } from "https://deno.land/std@0.149.0/http/server.ts";

await serve(() => new Response("Hello, World"));
