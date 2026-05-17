// Vercel serverless function — shared storage for Conjourney views.
//
// Storage backend: Vercel KV (Upstash Redis). To enable, add a KV store
// to the Vercel project (Storage → Create → KV) and connect it to this
// project. Vercel will inject KV_REST_API_URL + KV_REST_API_TOKEN env
// vars automatically. Without those, the route returns 503 and the
// client gracefully falls back to localStorage.

const KEY = "conjourney:views:v1";

function kvConfigured() {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
  );
}

async function kvGet() {
  const r = await fetch(
    `${process.env.KV_REST_API_URL}/get/${encodeURIComponent(KEY)}`,
    {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    },
  );
  if (!r.ok) throw new Error(`KV GET failed: ${r.status}`);
  const data = await r.json();
  // Upstash REST returns { result: "<stringified>" } or { result: null }
  if (data.result == null) return null;
  try {
    return JSON.parse(data.result);
  } catch {
    return null;
  }
}

async function kvSet(value) {
  const r = await fetch(
    `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(KEY)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    },
  );
  if (!r.ok) throw new Error(`KV SET failed: ${r.status}`);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!kvConfigured()) {
    res.status(503).json({
      error: "KV not configured",
      hint:
        "Connect a Vercel KV store to this project. See README → Shared backend.",
    });
    return;
  }

  try {
    if (req.method === "GET") {
      const views = await kvGet();
      res.status(200).json({ views: views || null });
      return;
    }

    if (req.method === "PUT") {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      const views = body?.views;
      if (!Array.isArray(views)) {
        res.status(400).json({ error: "views must be an array" });
        return;
      }
      await kvSet(JSON.stringify(views));
      res.status(200).json({ ok: true, count: views.length });
      return;
    }

    res.setHeader("Allow", "GET, PUT");
    res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    res.status(500).json({ error: e?.message || "server error" });
  }
}
