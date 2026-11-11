import { getSiteUrl } from "./site-url";

/*
 * Staging is recognised the way the admin panel and the other Refine sites
 * recognise it: by a hostname starting "stg-" (stg-house99.refinedubai.com,
 * or stg-house99.onrender.com before SITE_URL is set). Staging must never be
 * indexed, so robots.txt and the page's meta robots tag both ask here; the
 * X-Robots-Tag header is set in next.config.mjs.
 */
export function isStagingSite() {
  try {
    return new URL(getSiteUrl()).hostname.toLowerCase().startsWith("stg-");
  } catch {
    return false;
  }
}
