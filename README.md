# Brake Pads Co.

A focused single-product-category storefront for brake pads. Not a big catalog with
filters — a short list of pad **models**, where each model's **fitment/shape** is a
variant you pick on the product page (like a t-shirt size you don't merchandise
separately).

- **Frontend:** Astro (SSR, `output: "server"`) with React islands for interactivity
- **Backend + hosting:** Wix Headless — Wix Stores catalog + eCom cart/checkout via
  `@wix/astro` and `@wix/sdk`, deployed on Wix's hosting (`wix build` / `wix release`)

## How it works

Under `@wix/astro` the SDK auth is **ambient** — server code calls `productsV3`
directly and React islands call `currentCart` directly; there is no `createClient`.

| Piece | Where |
|---|---|
| Catalog read (SSR) | `src/lib/products.ts` — `listPads()`, `getPadBySlug()` |
| Home (model grid) | `src/pages/index.astro` |
| Product detail (fitment picker + buy) | `src/pages/products/[slug].astro` |
| Add-to-cart island | `src/components/AddToCart.tsx` |
| Cart count + checkout island | `src/components/CartButton.tsx` |
| Plain styling | `src/styles/global.css` |

Data model: a **product** = a pad model; the **"Fitment"** option holds the shapes, and
each fitment is a Wix **variant**. Add-to-cart requires the specific `variantId` (a bare
product id is silently dropped by Wix Cart V2). Checkout redirects to Wix's hosted
checkout page.

## Getting started

```bash
npm install
npm run dev        # wix dev — local dev server at http://localhost:4321
```

The Wix client id / secret live in `.env.local` (written by the Wix scaffold, gitignored).

## Scripts (Wix CLI)

- `npm run dev` — local dev server (`wix dev`)
- `npm run build` — production build (`wix build`)
- `npm run preview` — preview the build (`wix preview`)
- `npm run release` — publish to Wix hosting (`wix release`)

## Wix backend

`wix.config.json` holds the `siteId` + `appId`. The **Wix Stores** app (and its eCom
dependency) is installed on the site. Manage products/orders/payments in the Wix
dashboard, or via the Stores REST API with a CLI token:

```bash
npx @wix/cli@latest token --site "$(node -p "require('./wix.config.json').siteId")"
```

Products were seeded via `POST /stores/v3/bulk/products-with-inventory/create` (one-off
script kept in `.context/seed.mjs`).

## Status

Scaffold complete and verified end-to-end (live catalog read + add-to-cart). Styling is
deliberately plain — the visual **look & feel** is the next, separate step.
