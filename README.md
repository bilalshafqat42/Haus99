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
| `CONTENT_API_URL` | `https://projects-admin.refinedubai.com` | same |
| `CONTENT_API_TOKEN` | API key of `stg-haus99` in the panel | API key of `Haus99` in the panel |
| `REVALIDATE_SECRET` | the secret saved in the panel for `stg-haus99` | the one for `Haus99` |
| `IMAGE_HOSTS` | optional, defaults to `media.refinedubai.com` | same |
| `ENQUIRY_WEBHOOK_URL` / `ENQUIRY_WEBHOOK_TOKEN` | not needed once connected to the panel | same |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | for the location map | same |
| `NEXT_PUBLIC_MAPBOX_STYLE_URL` | Mapbox Studio style, the same as Eden House The Park | same |
| `NEXT_PUBLIC_GTM_ID` | optional: Google Tag Manager container ID, for example `GTM-XXXXXXX` | the live container's ID |

### Google Tag Manager

Set `NEXT_PUBLIC_GTM_ID` to load a Google Tag Manager container on every page. Left empty (or not a valid `GTM-` ID), the site loads no tracking at all. It is read when the site is built, so after adding or changing it, redeploy on Render (a restart is not enough).

- **Security policy:** with the ID set, the Content-Security-Policy also allows Google Tag Manager and Google Analytics 4. A tag for any other service added inside GTM (for example an advertising pixel) is blocked until its hosts are added in `next.config.mjs`.
- **Consent:** the site has no cookie banner yet, so GTM loads for every visitor once the ID is set. Check with Legal (UAE PDPL) before setting it on the live site; when a banner is added, load GTM only after the visitor accepts analytics cookies (`app/components/GoogleTagManager.js`).

Render sets `PORT` itself. Never commit secrets: `.env*` files are ignored by git, so set values in Render only.

## Refine Admin panel

The site's copy, images, figures and links are edited in the Refine Admin panel (projects-admin.refinedubai.com).

- **What is editable:** `app/panel/sections.js` lists every section and field, with today's copy from `app/content.js` as each default. When the server starts it sends that list to the panel (`instrumentation.js`), so the panel's editor always matches the site.
- **Reading content:** `app/panel/content-api.js` reads the published content with `CONTENT_API_TOKEN`. If the panel is not configured or cannot be reached, the page shows the copy in `app/content.js`, so it never breaks.
- **Edits appear straight away:** after every save the panel calls `/api/revalidate` with `REVALIDATE_SECRET`. Without that call, edits still appear within 5 minutes.
- **Enquiries:** the form's enquiries go to the panel's Leads page (`/api/v1/leads`), which emails or forwards them as set in Website Settings.
- **Safety:** text from the panel is shown as plain text (formatting tags are removed), and unsafe links are replaced, so nothing from the panel is rendered as HTML.
- **Not editable:** page layout, design, fonts, logos, the location map pins and the page's search-engine tags stay in code.

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
