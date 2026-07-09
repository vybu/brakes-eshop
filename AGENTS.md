# Brake Pads Co. — agent notes

An **Astro** storefront on a **Wix Headless** backend (Wix Stores + eCom), hosted on Wix.

## Domain model
- A **product** = a brake-pad model. The **"Fitment"** option carries the shapes; each
  fitment is a Wix **variant** with its own `variantId` and price.
- Keep the shop "single-item" in spirit: models front and center, fitment chosen on the
  product page — do not build a heavy faceted catalog.

## Wix + Astro integration
- `@wix/astro` provides **ambient SDK auth**. Server code calls `productsV3` directly;
  React islands call `currentCart` / `redirects` directly. Do NOT add `createClient`.
- Catalog is **Stores V3**: use `productsV3`, never V1 `products` (V1 returns 0 on V3).
- `queryProducts` does not inline variants; `getProduct(id, { fields: [...] })` does.
- **Add-to-cart needs `variantId`** in `catalogReference.options` — a bare product id
  (or an option-name map) is silently dropped for variant-managed products.
- Checkout: `currentCart.createCheckoutFromCurrentCart({ channelType: currentCart.ChannelType.WEB })`
  → `redirects.createRedirectSession(...)` → `window.location.href = fullUrl`.
- Interactivity is React islands (`client:load`); cross-island updates use a
  `window` `"cart-updated"` CustomEvent.
- `.astro` frontmatter is TypeScript — no HTML comments there (`//` or `/* */` only).

## Commands
- `npm run dev` (wix dev), `npm run build` (wix build), `npm run release` (publish).
- Site management/seeding: `npx @wix/cli@latest token --site <siteId>` + Stores REST.

## Look & feel
Styling is deliberately plain (`src/styles/global.css`). The visual design pass is a
separate, later step — do not treat the current styling as the intended aesthetic.

## History
Originally scaffolded as Next.js, then switched to Astro (the framework Wix's headless
tooling hosts natively). The old `init` site is orphaned; the live site is the one in
`wix.config.json`.
