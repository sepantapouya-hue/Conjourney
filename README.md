# Conjourney — The Convi User Journey

An interactive, diagram-based visualization of Convi's two user journeys —
the merchant installing the Shopify app, and the shopper using the widget on
the storefront. Every email, banner, modal, toast, and silent backend event
is plotted on a two-lane swim diagram.

Pure static site — `index.html`, `styles.css`, `data.js`, `app.js`. No build
step, no framework, no dependencies.

## Run locally

Just open `index.html` in a browser, or serve the directory:

```bash
python3 -m http.server 5173
# then visit http://localhost:5173
```

## Deploy on Vercel

This is a static site at the repo root, so Vercel deploys it with zero
configuration.

### Option A — Import from GitHub (recommended)

1. Go to <https://vercel.com/new>.
2. Import the GitHub repo `sepantapouya-hue/Conjourney`.
3. Leave every field at its default — Framework Preset: **Other**,
   Build Command: empty, Output Directory: empty, Root Directory: `./`.
4. Click **Deploy**.

Vercel will serve `index.html` at the deployment root.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel        # follow prompts; accept defaults
vercel --prod # promote to production
```

## Project layout

```
├── index.html    Page structure + sections
├── styles.css    Dark theme, swim-lane layout, side panel
├── data.js       All 21 stages and their events
├── app.js        Renders stages, wires filters + detail panel
└── vercel.json   Minimal static config (optional)
```

## Editing the journey

All content lives in [`data.js`](data.js) as a single `STAGES` array. Each
stage has a `lane` (`merchant`, `shopper`, or `both`) and a list of `events`,
each typed `email | banner | modal | widget | toast | backend | roadmap`.
Add a new event by appending to a stage's `events` array; add a new stage by
appending an object to `STAGES`.
