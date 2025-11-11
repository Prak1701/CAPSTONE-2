export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function api(path: string, opts: RequestInit = {}) {
  const url = API_BASE + path;
  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type") && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Try primary URL first; if network error occurs (e.g., deployed frontend can't reach localhost),
  // fall back to a same-origin request using the provided path.
  try {
    const res = await fetch(url, { ...opts, headers });
    const text = await res.text();
    try {
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw data;
      return data;
    } catch (err) {
      throw err;
    }
  } catch (err: any) {
    // If the first fetch failed due to network error, attempt a same-origin request.
    if (err instanceof TypeError) {
      try {
        const fallbackRes = await fetch(path, { ...opts, headers });
        const text = await fallbackRes.text();
        try {
          const data = text ? JSON.parse(text) : {};
          if (!fallbackRes.ok) throw data;
          return data;
        } catch (e) {
          throw e;
        }
      } catch (e) {
        throw e;
      }
    }
    throw err;
  }
}
