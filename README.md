# Conjourney — The Convi User Journey

An interactive, n8n-style flow editor for Convi's two user journeys —
the merchant installing the Shopify app, and the shopper using the widget.

Built with **Vite + React + @xyflow/react**, light theme inspired by
[conviapp.com](https://conviapp.com), zero backend, persisted in the
browser's localStorage.

## Features

- 🔐 **Password-gated** — `$$Conjourney$$` (client-side; see note below).
- 🗺️ **Flow editor** — 21 seeded stages laid out in two lanes
  (merchant / shopper) plus cross-cutting nodes.
- ➕ **Add nodes anywhere** — top-bar **Add node** button, or click any edge
  to insert a new node between two existing ones.
- ✏️ **Edit & delete** — every node has Edit / Delete actions; the form lets
  you edit title, lane, route, description and the full list of events.
- 💾 **Saveable views** — create, rename, duplicate, switch, and delete
  views. Each view stores its own nodes, edges, and channel filters.
- 🔍 **Zoom + pan + minimap** — full n8n-style canvas controls
  (`+`, `−`, fit-to-view, drag-to-pan, scroll-to-zoom).
- 🎚️ **Channel filters** — toggle Email / Banner / Modal / Widget / Toast /
  Backend / Roadmap chips. Filtered-out events dim inside every node.
- 💡 **Click any event chip** in a node to open a detail panel with the
  full description, subject line, and metadata.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build

```bash
npm run build        # outputs to ./dist
npm run preview      # serves the built bundle
```

## Deploy on Vercel

Vercel auto-detects this as a Vite project — zero configuration needed.

### Option A — Import from GitHub

1. Go to <https://vercel.com/new>.
2. Import the GitHub repo `sepantapouya-hue/Conjourney`.
3. Vercel detects **Vite** as the framework preset automatically:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Click **Deploy**.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel        # follow prompts
vercel --prod
```

## Project layout

```
├── index.html              Vite entry
├── package.json            Vite + React + @xyflow/react
├── vite.config.js
├── vercel.json             (optional) cache + header tweaks
├── public/favicon.svg
└── src/
    ├── main.jsx            React entry
    ├── App.jsx             Auth gate + editor switch
    ├── index.css           Light theme, swim-lane styling
    ├── data/
    │   └── seed.js         21 initial stages + filter defaults
    └── components/
        ├── AuthGate.jsx
        ├── Editor.jsx      Main canvas + state orchestrator
        ├── Toolbar.jsx     Top bar: views, filters, actions
        ├── StageNode.jsx   Custom node component
        ├── ViewsPanel.jsx  Manage views (create / rename / duplicate / delete)
        ├── NodeForm.jsx    Create / edit a node and its events
        └── EventDetail.jsx Side panel when clicking an event chip
```

## Note on password protection

The password gate is **client-side only** — the bundle ships to every
visitor and the password is in `src/App.jsx`. This is obfuscation, not
security. For real protection on a public domain, use one of:

- Vercel's password-protected deployments (Pro plan, edge-level).
- An auth proxy (e.g., Cloudflare Access) in front of the Vercel domain.
- A small serverless function that gates access via signed cookie.

The current setup matches the requirement (`$$Conjourney$$`) and keeps the
map out of casual hands; promote to one of the above if it ever needs to
hold real secrets.
