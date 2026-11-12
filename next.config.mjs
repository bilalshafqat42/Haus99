const isDev = process.env.NODE_ENV !== "production";

/*
 * Content-Security-Policy, matched to what the page really loads: its own
 * scripts, styles, fonts and images (the fonts are self-hosted by
 * next/font), plus Mapbox for the location map: styles, tiles, sprites and
 * glyphs from api.mapbox.com, telemetry to events.mapbox.com, and tile
 * workers from blob: URLs (the same allowances as the Eden House site).
 * 'unsafe-inline' for scripts and styles because Next's hydration and
 * mapbox-gl need it without a per-request nonce, and a nonce would end
 * static rendering.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://api.mapbox.com",
  "font-src 'self' data:",
  `connect-src 'self' https://api.mapbox.com https://events.mapbox.com${isDev ? " ws:" : ""}`,
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Production only: on plain-http localhost Safari would upgrade every asset to https.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const NOINDEX = { key: "X-Robots-Tag", value: "noindex, nofollow" };

// The deployment's own address (SITE_URL, or Render's onrender.com address
// until it is set) starts "stg-": this is staging, never to be indexed.
function siteUrlIsStaging() {
  try {
    const raw = (process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || "").trim();
    return raw !== "" && new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname.toLowerCase().startsWith("stg-");
  } catch {
    return false;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Security headers for every response.
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          // HTTPS only, for two years. Ignored on plain-HTTP localhost.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
      // Staging is never indexed: by the address a request came to...
      { source: "/:path*", has: [{ type: "host", value: "stg-.*" }], headers: [NOINDEX] },
      // ...and by the deployment's own address.
      ...(siteUrlIsStaging() ? [{ source: "/:path*", headers: [NOINDEX] }] : []),
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
