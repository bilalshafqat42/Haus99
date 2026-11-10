import { getSiteUrl } from "./site-url";

export default function robots() {
  const site = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${site}/sitemap.xml`,
  };
}
