# SEOGBTools — Astro + Tailwind CSS + Pages CMS + Cloudflare Pages

Migrated source **from the supplied WordPress theme ZIP plus the WordPress XML export originally dated 2026-11-18, with published content synchronized to the 2026-11-22 export**. Existing theme CSS, JS, fonts, logos, icons and available images are retained in `public/assets/`. Theme PHP is reference only; the generated HTML layouts and content data are now static. This is a functional source starter, **not a verified pixel-perfect clone** of the live WordPress website.

## Start locally

Requires Node.js 20.3+ (Node 22 recommended).

```bash
npm install
npm run dev
```

`npm run build` creates production-ready `dist/`. The prebuild renderer (`scripts/build.mjs`) generates starter pages under `.generated/`, then Astro compiles them to static output. Tailwind v4 is enabled via Astro/Vite; its reset/Preflight is deliberately omitted to avoid breaking the original WordPress styling. Original theme stylesheet is still the primary styling system.

**Note:** This Astro implementation wraps generated theme-compatible markup in an Astro component to preserve existing styling. Components are not yet individually reauthored as Tailwind-first Astro UI components.

## Cloudflare Pages

1. Create a **private** GitHub repository. Push project source, including `public`, `content`, `src`, `scripts`, `.pages.yml`, `package.json`, `astro.config.mjs`. Do **not** push `node_modules`, `dist`, `.generated`, or secrets.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect Git repository.
3. Build command: `npm run build`; output: `dist`; production branch: `main`. Use Node 22 if the platform asks for a version.
4. Deploy preview; inspect every page on desktop and mobile. Only then assign the real custom domain.

## Pages CMS

1. Visit https://app.pagescms.org, authenticate with GitHub and grant repo permission.
2. `.pages.yml` defines Homepage, Site Settings, Products, Tools, Posts, Pages, Plans, FAQs, Spotlight and Steps.
3. On saving, Pages CMS commits changes into the source repo; Cloudflare builds and publishes them.
4. Change `content/settings.json` siteUrl as necessary and carefully verify all external purchase links.

## Where content goes

- `content/products/*.json` — 203 published product records imported from WordPress XML (not a database backup).
- `content/posts/*.json`, `content/pages/*.json` — 4 published posts and 14 published pages synchronized from WordPress XML; older GitHub-only records remain preserved for review.
- `content/homepage.json`, `content/plans.json`, `content/faqs.json`, `content/settings.json` — CMS-editable settings.
- `public/assets` — original bundled images and theme design assets.

When you export updated WordPress content, merge it with these records, preserve the existing URL slugs, and copy over the WordPress Media Library files.

## Important limitations before replacing production WordPress

- **Pixel-exact visuals not verified:** layout and class names emulate the theme and original assets remain, but WordPress runtime / live theme settings can differ. Compare browser screenshots against production before pointing DNS.
- **WordPress/WooCommerce are not running:** shopping cart, payment processing, logged-in dashboard, native product reviews, plugin forms, WP search and WP admin features require a separate backend or links to your existing member checkout. Existing product buy links are carried over when present.
- Bundled records may be older or incomplete. The initial pricing/FAQ entries may not match production — replace after your export.
- Some image references can be missing from the supplied ZIP; upload from your live WP Media Library when available.
- SEO: Basic titles, descriptions, canonicals, sitemap and robots are included. Validate exact production URL map, categories, redirects, schema, OG images, pagination and existing SEO plugin configuration before launch.
- The project uses CMS-provided HTML content. Grant Pages CMS write access only to trusted users.
- The build currently uses one route-folder depth. For article/post nested route requirements, adapt generator and Astro dynamic route discovery before launch.

To test starter content generation without Astro dependencies: `node scripts/build.mjs && node scripts/verify.mjs`.

## WordPress XML content import (18 Nov 2026)

Imported: **203 published products, 4 published posts, 14 published pages, 3 pricing plans and 7 FAQs**. The WordPress export included **1,273 media attachment references** (not actual image bytes), 15 trashed products, and 2 drafts. Trashed and draft content was intentionally excluded from the published site.

- `migration/import-report.json`: complete per-status counts, missing featured images, collisions and caveats.
- `migration/media-manifest.json`: attachment URLs for downloading Media Library files from WordPress. Images linked to the old WordPress domain may appear only while the old site stays online. Download and rewrite those URLs to local public paths before shutting WordPress down.
- `scripts/import_wordpress.py`: repeatable importer for a newer WXR XML. Run: `python scripts/import_wordpress.py path/to/export.xml`, then `npm run build`. It **replaces existing products, posts and pages** with the published XML records; back up any CMS changes before reimporting.
- WordPress-specific shortcodes, embedded widgets and plugin features should be manually checked and migrated. Any buy URL imported from WordPress should be tested against your current checkout provider.
- The 42 starter homepage tool records remain in `content/tools/` and are not drawn from the WXR export.

**Launch gate:** Do not switch DNS until both the full Astro build succeeds and desktop/mobile design, media links, pages, canonicals, pricing and purchase redirects are verified against production.

## November 22 XML reconciliation (November 23, 2026)

- The 2026-11-22 WXR export lists 203 published products, 4 published posts, 14 published pages, 3 plans, 7 FAQs and 1,273 attachment records. Published products, posts and pages were synchronized into individual Pages CMS JSON records without deleting other repository-only content or overwriting existing image paths.
- Indexable public pages use `index,follow`; cart, checkout and account utility pages use `noindex,follow`. The sitemap excludes those utility URLs. Old `/refund_returns/` redirects to `/refund-returns/`.
- XML title, description, focus keyword, and custom SEO H1 fields are retained. The three explicit Yoast canonical overrides for Lynda, Copy AI and Moz were also preserved. Social images use absolute URLs and each page emits structured data.
- The full static Astro build and content/SEO test are verified through GitHub Actions. This does not prove screenshot-perfect parity with the live WordPress site or functional e-commerce checkout.
- The XML does not contain image binaries. Media completeness, actual buy links, and real preview/mobile visual parity remain separate launch checks. The existing repository has additional pages and posts not present in the new XML; they were deliberately not deleted.
- The repeatable importer now preserves existing CMS-only records and image paths instead of destructively deleting other files.
