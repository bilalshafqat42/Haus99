# HAUS 99

Landing page for HAUS 99, 99 private residences in Jumeirah Village Triangle, Dubai. Built with Next.js and hosted on Render.

## Branches

| Branch | Website | Render service |
|---|---|---|
| `stg` | Staging: https://stg-haus99.refinedubai.com | `stg-house99` (Render address stg-house99.onrender.com) |
| `main` | Live (after manager approval): https://haus99.refinedubai.com | `Haus99` (Render address haus99.onrender.com) |

Work goes to `stg` first. Once the manager approves it on staging, `stg` is merged into `main` through a pull request.

## Render settings

| Setting | Value |
|---|---|
| Language | Node |
| Region | Frankfurt (EU Central) |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Project / group | Refine Admin for Landing Pages, Haus99 |

### Environment variables

| Key | Staging | Live |
|---|---|---|
| `NODE_VERSION` | `22` | `22` |
| `SITE_URL` | `https://stg-haus99.refinedubai.com` | `https://haus99.refinedubai.com` |
| `ENQUIRY_WEBHOOK_URL` | not set yet | not set yet |
| `ENQUIRY_WEBHOOK_TOKEN` | optional | optional |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox public token (`pk.`) | same |
| `NEXT_PUBLIC_MAPBOX_STYLE_URL` | Mapbox Studio style, the same as Eden House The Park | same |

Render sets `PORT` itself.

- **SITE_URL** is used for canonical links, share images, robots.txt and the sitemap.
- **Enquiry form:** until `ENQUIRY_WEBHOOK_URL` is set, the form tells visitors to call 800 REFINE or email sales instead of sending their details.
- **Location map:** the two `NEXT_PUBLIC_MAPBOX_*` values are built into the page, so a change needs a redeploy. Without a token the drawn, illustrative map shows instead. In Mapbox, the token's URL restrictions must include haus99.refinedubai.com, stg-haus99.refinedubai.com and both onrender.com addresses, or the map stays blank. Pin coordinates live in `app/content.js`.
- **Secrets:** never commit secrets. `.env*` files are ignored by git, so set values in Render only.

## Staging is never indexed

A site whose address starts with `stg-` (from `SITE_URL`, Render's own `onrender.com` address, or the address a request came to) tells search engines to stay out in three ways:

- `robots.txt` disallows everything;
- every page has a `noindex, nofollow` meta tag;
- every response has an `X-Robots-Tag: noindex, nofollow` header.

The live site is unaffected.

## Running it locally

```bash
npm ci
npm run dev
```

Then open http://localhost:3000.
