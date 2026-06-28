# Crate — inventory & warehouse management for SMBs

**Crate** is a production-grade **Next.js 16** starter for simple inventory and
warehouse management: track stock, locations, low-stock alerts and reorders.
Know exactly what you have, where, and when to reorder.

Inspired by the clean, visual, card/grid feel of **[sortly.com](https://www.sortly.com)**
and the practical, light B2B tables of **[inflowinventory.com](https://www.inflowinventory.com)**.
Built to be rebranded in five minutes.

## Quick start

```bash
npm install
npm run dev          # → http://localhost:3000  (runs in demo mode, no keys needed)
```

It boots straight into a live inventory dashboard with a realistic sample
catalog, stock levels, locations, movements and purchase orders — **no API keys
required**.

## What's inside

- **Dashboard** — an inventory cockpit: stat row (items, stock value, low-stock,
  out of stock), an items table with stock-level bars, a click-through item
  **detail drawer** (stock history, locations, a generated **barcode + QR**,
  adjust-stock control), a **low-stock alert** panel, a **stock-movement log**, a
  **locations** breakdown, a **stock-value-over-time** chart, and a **purchase-order**
  mini-panel.
- **Items** page — grid + table views, category filters, search.
- **Purchase orders** page — PO list with status filters + supplier scorecard.
- **Landing page** — hero with a live product preview, an **interactive demo**
  (adjust a quantity and watch a low-stock alert fire), features, how-it-works,
  comparison vs spreadsheets/generic tools, testimonials, pricing and FAQ.
- **Settings** — brand + integration status.
- **Auth** — `/login` + `/signup` with a demo bypass.

All visuals are **inline SVG / CSS** — item thumbnails, charts, barcodes, QR
codes and logos. **No photos.**

## Make it yours

Open this folder in **Claude Code** and say:

> **"set up this project"**  (or run **`/setup`**)

Claude interviews you for your **brand**, **logo**, **colors**, and the **API keys
this app needs** (Supabase, optional barcode lookup, optional Shopify/WooCommerce
sync), then writes your `app.config.ts` and `.env.local` and boots it. Prefer to
do it by hand? Open **`START-HERE.md`**, then follow [`SETUP.md`](./SETUP.md) —
every step names the exact file to change.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · lucide-react.
Fonts: **Plus Jakarta Sans** (UI) + **JetBrains Mono** (SKUs/quantities).
No database required to run — it falls back to realistic demo data in
`lib/demo/data.ts`.
