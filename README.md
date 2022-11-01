# Fast

Deno web framework with [almost zero](https://github.com/denosaurs/bench)
overhead.

[![test](https://github.com/danteissaias/fast/actions/workflows/test.yml/badge.svg)](https://github.com/danteissaias/fast/actions/workflows/test.yml)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https://deno.land/x/fast/mod.ts)
[![codecov](https://codecov.io/gh/danteissaias/fast/branch/main/graph/badge.svg?token=LTiVBNmwP7)](https://codecov.io/gh/danteissaias/fast)

```ts
import fast from "https://deno.land/x/fast/mod.ts";

const app = fast();

app.get("/", () => "Hello, World!");

await app.serve();
```

## More examples

- [Routing](#routing)
- [Route parameters](#route-parameters)
- [Assertions](#assertions)

### Routing

```ts
import fast from "https://deno.land/x/fast@5.0.0/mod.ts";

const app = fast();

app.get("/ping", () => "Pong!");

await app.serve();
```

```
deno run -A --unstable https://deno.land/x/fast@5.0.0/examples/routing.ts
```

### Route Parameters

```ts
import fast from "https://deno.land/x/fast@5.0.0/mod.ts";

const app = fast();

app.get("/:page", (ctx) => {
  const { page } = ctx.params;
  // ...
  return "<p>Hello, World</p>";
});

await app.serve();
```

```
deno run -A --unstable https://deno.land/x/fast@5.0.0/examples/params.ts
```

### Assertions

```ts
import fast, { type Context } from "https://deno.land/x/fast@5.0.0/mod.ts";

const app = fast();

const missingEmail = {
  status: 400,
  code: "parameterMissing",
  message: `Missing required param: email.`,
};

const missingPassword = {
  status: 400,
  code: "parameterMissing",
  message: `Missing required param: password.`,
};

// We must explicitly type the `ctx` paramter.
// https://github.com/microsoft/TypeScript/issues/36931
app.post("/login", async (ctx: Context) => {
  const { email, password } = await ctx.body;
  ctx.assert(email, missingEmail);
  ctx.assert(password, missingPassword);
  // ...
  return { token: 123 };
});

await app.serve();
```

```
deno run -A --unstable https://deno.land/x/fast@5.0.0/examples/assert.ts
```
