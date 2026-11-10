import { getSiteUrl } from "./site-url";

export default function sitemap() {
  return [{ url: `${getSiteUrl()}/`, changeFrequency: "weekly", priority: 1 }];
}
