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
  // Baseline security headers. Add Strict-Transport-Security at the host once HTTPS is live.
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
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
