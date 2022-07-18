import fast from "../mod.ts";

const app = fast();

const JSONResponse = (data) => {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify(data), { headers });
}

app.get("/", () => {
    return JSONResponse({ id: crypto.randomUUID() })
});

await app.serve();



