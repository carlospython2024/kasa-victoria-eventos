export async function api<T = any>(
  path: string,
  body?: unknown,
  method?: string,
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: method || (body === undefined ? "GET" : "POST"),
    credentials: "same-origin",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({
    error: "No pudimos conectar con el servicio. Intenta de nuevo.",
  }));
  if (!res.ok)
    throw new Error(data.error || "No se pudo completar la solicitud.");
  return data;
}
