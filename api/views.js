// Vercel serverless function — shared storage for Conjourney views.
//
// Auto-detects which Redis backend is connected to the project:
//   1. Upstash Redis / Vercel KV  → uses KV_REST_API_URL + KV_REST_API_TOKEN
//      (HTTP REST API, no extra deps)
//   2. Redis (Redis Inc.) on Vercel Marketplace, or any TCP Redis
//      → uses REDIS_URL (or KV_URL) via the `redis` npm client
//
// Without either, the route returns 503 and the client falls back to
// localStorage.

import { createClient } from "redis";

const KEY = "conjourney:views:v2";

function upstashConfigured() {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
  );
}

function tcpRedisUrl() {
  return process.env.REDIS_URL || process.env.KV_URL || null;
}

// ---- Upstash REST -----------------------------------------------------------
async function upstashGet() {
  const r = await fetch(
    `${process.env.KV_REST_API_URL}/get/${encodeURIComponent(KEY)}`,
    {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    },
  );
  if (!r.ok) throw new Error(`KV GET failed: ${r.status}`);
  const data = await r.json();
  if (data.result == null) return null;
  try {
    return JSON.parse(data.result);
  } catch {
    return null;
  }
}

async function upstashSet(value) {
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

// ---- TCP Redis (Redis Inc. / generic) --------------------------------------
// Use an ephemeral connection per request. Simpler than connection pooling in
// serverless and avoids stuck sockets across cold starts.
async function withRedis(fn) {
  const url = tcpRedisUrl();
  const client = createClient({ url });
  client.on("error", () => {});
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.quit().catch(() => {});
  }
}

async function tcpGet() {
  return withRedis(async (c) => {
    const v = await c.get(KEY);
    if (v == null) return null;
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  });
}

async function tcpSet(value) {
  return withRedis(async (c) => {
    await c.set(KEY, JSON.stringify(value));
  });
}

// ---- Dispatcher ------------------------------------------------------------
async function storeGet() {
  if (upstashConfigured()) return upstashGet();
  if (tcpRedisUrl()) return tcpGet();
  return undefined;
}

async function storeSet(value) {
  if (upstashConfigured()) return upstashSet(value);
  if (tcpRedisUrl()) return tcpSet(value);
  throw new Error("not_configured");
}

function backend() {
  if (upstashConfigured()) return "upstash";
  if (tcpRedisUrl()) return "redis";
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const b = backend();
  if (!b) {
    res.status(503).json({
      error: "Redis not configured",
      hint:
        "Connect a Redis or Upstash KV store to this project. See README → Shared backend.",
    });
    return;
  }
  res.setHeader("X-Conjourney-Backend", b);

  try {
    if (req.method === "GET") {
      const views = await storeGet();
      res.status(200).json({ views: views || null, backend: b });
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
      await storeSet(views);
      res.status(200).json({ ok: true, count: views.length, backend: b });
      return;
    }

    res.setHeader("Allow", "GET, PUT");
    res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    res.status(500).json({ error: e?.message || "server error" });
  }
}
