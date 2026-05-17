// Client wrapper for the /api/views serverless endpoint.
// Always writes to localStorage as a fallback / offline cache.

const LOCAL_KEY = "conjourney_views_v1";

export function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocal(views) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(views));
  } catch {
    /* quota exceeded — ignore */
  }
}

export async function fetchRemoteViews() {
  try {
    const res = await fetch("/api/views", { cache: "no-store" });
    if (res.status === 503) return { ok: false, configured: false };
    if (!res.ok) return { ok: false, configured: true };
    const data = await res.json();
    return { ok: true, configured: true, views: data.views || null };
  } catch {
    return { ok: false, configured: true, network: true };
  }
}

export async function pushRemoteViews(views) {
  saveLocal(views);
  try {
    const res = await fetch("/api/views", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ views }),
    });
    if (res.status === 503) return { ok: false, configured: false };
    if (!res.ok) return { ok: false, configured: true };
    return { ok: true, configured: true };
  } catch {
    return { ok: false, configured: true, network: true };
  }
}
