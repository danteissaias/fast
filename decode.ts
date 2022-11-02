function isJSON(val: unknown) {
  try {
    const s = JSON.stringify(val);
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

export default function decode(res: unknown, status: number) {
  if (res instanceof Response) return res;
  if (typeof res === "string") return new Response(res, { status });
  if (isJSON(res) || Array.isArray(res)) return Response.json(res, { status });
  return new Response(null, { status: 204 });
}
