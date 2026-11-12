import { getSiteUrl } from "./site-url";
import { isStagingSite } from "./staging";

export default function sitemap() {
  // Staging is never indexed, so it lists nothing.
  if (isStagingSite()) return [];
  return [{ url: `${getSiteUrl()}/`, changeFrequency: "weekly", priority: 1 }];
}
