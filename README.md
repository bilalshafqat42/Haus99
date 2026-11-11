# HAUS 99

Landing page for HAUS 99, 99 private residences in Jumeirah Village Triangle, Dubai. Built with Next.js and hosted on Render.

## Branches

| Branch | Website | Render service |
|---|---|---|
| `stg` | Staging: https://stg-house99.refinedubai.com | `stg-house99` |
| `main` | Live (after manager approval) | `house99` (not created yet) |

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
| `SITE_URL` | `https://stg-house99.refinedubai.com` | the live address |
| `ENQUIRY_WEBHOOK_URL` | not set yet | not set yet |
| `ENQUIRY_WEBHOOK_TOKEN` | optional | optional |

Render sets `PORT` itself.

- **SITE_URL** is used for canonical links, share images, robots.txt and the sitemap.
- **Enquiry form:** until `ENQUIRY_WEBHOOK_URL` is set, the form tells visitors to call 800 REFINE or email sales instead of sending their details.
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
