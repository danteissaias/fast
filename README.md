# Fast

Minimalist web framework for [Deno](https://deno.land).

[![test](https://github.com/danteissaias/fast/actions/workflows/test.yml/badge.svg)](https://github.com/danteissaias/fast/actions/workflows/test.yml)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/fast/mod.ts)

```ts
import { Application, Router } from "https://deno.land/x/fast/mod.ts";

const app = new Application();

app.get("/", () => {
  return "Hello, World!";
});

app.serve({ port: 8080 });
```
