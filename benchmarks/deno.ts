import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

await serve(() => new Response("hello world"));
