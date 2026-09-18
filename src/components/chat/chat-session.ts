const REQUEST_ID_KEY = "ster-schoonmaak-chat-request-id";

export function getClientRequestId(reset = false): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  try {
    if (reset) window.sessionStorage.removeItem(REQUEST_ID_KEY);
    const existing = window.sessionStorage.getItem(REQUEST_ID_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(REQUEST_ID_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export function currentSourcePath(): string {
  return typeof window === "undefined" ? "/" : window.location.pathname || "/";
}
