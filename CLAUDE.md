# Working in this project (read me first)

This is **Crate** — a **GoatStarter kit** on Next.js 16. The product: **simple
inventory & warehouse management for SMBs** — track stock, locations, low-stock
alerts and reorders (inspired by sortly.com + inflowinventory.com). A
production-grade starter built to be rebranded fast.

**Design language:** CLEAN, LIGHT, industrial-practical. White surfaces, hairline
borders, a warm **amber** primary (`oklch(70% 0.15 65)`) over cool slate, **green**
for in-stock / **red** for out-of-stock, JetBrains-Mono SKUs and quantities
(Plus Jakarta Sans + JetBrains Mono — **not** Inter/Roboto). Light is the default
— **no `dark` class** on `<html>`. The dashboard is an inventory cockpit: white
sidebar (grouped nav + pinned user card) · stat row · an items table with
stock-level bars · a right item-details drawer (stock history bars + a generated
barcode/QR + adjust-stock) · low-stock alert panel · stock-movement log ·
locations breakdown · stock-value area chart · purchase-order mini-panel. All
visuals are inline SVG / CSS (item thumbnails in `components/app/item-thumb.tsx`,
charts in `components/app/charts.tsx`, barcode + QR in `components/app/barcode.tsx`)
— **no photos**.

## ⭐ If the user wants to set this up

When the user says anything like **"set up this project"**, **"bu projeyi kur"**,
**"make this mine"**, **"configure this"**, or runs **`/setup`** — do NOT start
editing files blindly. Open **`SETUP.md`** and follow it exactly. It is an
interview: you ask a short list of questions (brand, logo, colors, and the
specific API keys this app needs), then you apply the answers to:

- `app.config.ts` — name, tagline, copy, navigation, integrations
- `app/globals.css` — brand colors
- `app/layout.tsx` — fonts (optional)
- `.env.local` — the API keys you collected
- `public/logo.svg` — the user's logo (if provided)

Ask **one question at a time**, accept "skip"/"keep default" for any of them, and
never invent API keys. When done, run `npm install` and `npm run dev` and report
the local URL.

## The single source of truth

`app.config.ts` drives the brand, the marketing page, the dashboard navigation
(`navGroups` = the grouped sidebar; `nav` = the flat list used for topbar title
lookup), and the list of integrations this kit expects (Supabase, optional
Barcode Lookup, optional Shopify/WooCommerce sync). Read it before changing UI
copy.

## Bilingual (TR + EN)

Every user-facing string is `{ tr: "…", en: "…" }`. When you edit copy, **keep
both languages**. Shared UI strings (auth, nav chrome, buttons) live in
`lib/i18n/dict.ts`. The default language is set in `lib/i18n/config.ts`
(`DEFAULT_LANG`). A live TR/EN toggle sits in the navbar, dashboard topbar and
auth pages.

## Auth

`/login` and `/signup` are real screens but run a **demo bypass** — Supabase
isn't connected, so submitting (or "Continue with demo") just enters the
dashboard. Wiring Supabase via setup is what makes them do real auth.

## Demo mode

With no keys in `.env.local`, the app renders from `lib/demo/data.ts` (a realistic
catalog of items with SKUs, stock, reorder points, locations, movements and POs).
That is intentional — it lets anyone boot the app instantly. Real integrations
replace the demo data once their keys are present.

## This is NOT the Next.js you may know

This is Next.js 16 (App Router, React 19, Tailwind v4). APIs and conventions may
differ from older training data. If unsure about a Next.js API, check
`node_modules/next/dist/docs/` before writing code, and heed deprecation notices.
