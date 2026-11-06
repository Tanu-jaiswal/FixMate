const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = (
  configuredApiUrl ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://fixmate-backend-0cyg.onrender.com")
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

export async function apiRequest(path, options = {}) {
  const apiPath = path.replace(/^\/?api(?=\/|$|\?)/i, "");
  const requestPath = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  const headers = new Headers(options.headers || {});
  const requestOptions = {
    ...options,
    headers,
    credentials: "include",
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    requestOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}/api${requestPath}`, requestOptions);
  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof result === "object" && result?.message
        ? result.message
        : "The request could not be completed."
    );
    error.status = response.status;
    throw error;
  }

  return result;
}
