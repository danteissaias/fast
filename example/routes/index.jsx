/** @jsxImportSource https://esm.sh/preact@10.9.0 */

export const loader = () => {
  return { ver: Deno.version };
};

export const action = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  console.log(email);
  return { error: "This is an error" };
};

export default function Index({ data }) {
  return (
    <main>
      <h1>Hello World</h1>
      <p>Version data from server: {JSON.stringify(data.ver)}</p>
      {data.error ? <p>{data.error}</p> : null}
      <form method="post">
        <input type="text" name="email" />
        <input type="submit" />
      </form>
    </main>
  );
}
