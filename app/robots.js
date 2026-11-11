import { getSiteUrl } from "./site-url";
import { isStagingSite } from "./staging";

export default function robots() {
  const site = getSiteUrl();
  if (isStagingSite()) {
    // Staging: keep every search engine out.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${site}/sitemap.xml`,
  };
}
