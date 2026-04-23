const API_BASE = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "https://future-fs-02-l8bb.onrender.com")
).replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("miniCrmToken");
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && options.skipAuth !== true) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body:
      options.body && !(options.body instanceof FormData) && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}