# Fast

Small (<200L) web framework.

[![test](https://github.com/danteissaias/fast/actions/workflows/test.yml/badge.svg)](https://github.com/danteissaias/fast/actions/workflows/test.yml)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/fast/mod.ts)

```ts
import fast from "https://deno.land/x/fast/mod.ts";

const app = fast();

app.get("/", () => "Hello, World!");

await fast.serve()
```
