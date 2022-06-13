# Fast

Minimalist web framework for [Deno](https://deno.land).

[![test](https://github.com/danteissaias/fast/actions/workflows/test.yml/badge.svg)](https://github.com/danteissaias/fast/actions/workflows/test.yml)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/fast/mod.ts)

```ts
import { serve } from "https://deno.land/std@0.143.0/http/server.ts";
import { Application, Router } from "https://deno.land/x/fast/mod.ts";

const app = new Application();
const router = new Router();
app.use(router.handle);

router.get("/", () => {
  return new Response("Hello, World!");
});

await serve(app.handle);
```
