/** @jsxImportSource https://esm.sh/preact@10.9.0 */

export const loader = () => {
  return { ver: Deno.version };
};

export default function Index({ ver }) {
  return (
    <main>
      <h1>Hello World</h1>
      <p>Version data from server: {JSON.stringify(ver)}</p>
    </main>
  );
}
