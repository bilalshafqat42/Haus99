/*
 * The site's public address, for canonical links, share images, robots.txt
 * and the sitemap. Set SITE_URL in production (for example
 * https://haus99.refinedubai.com). On Render, the service address is used
 * until then; locally it falls back to localhost.
 */
export function getSiteUrl() {
  const raw = (process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000").trim();
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return new URL(withScheme).origin;
}
