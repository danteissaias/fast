# Fast

Small (<200L) web framework.

[![test](https://github.com/danteissaias/fast/actions/workflows/test.yml/badge.svg)](https://github.com/danteissaias/fast/actions/workflows/test.yml)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/fast/mod.ts)
[![deno module](https://shield.deno.dev/x/fast)](https://deno.land/x/fast)

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { Application } from "https://deno.land/x/fast/mod.ts";

const app = new Application();

app.get("/", () => "Hello, World!");

await serve(app.handle);
```
