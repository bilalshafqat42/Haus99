/*
 * Register-interest submissions.
 *
 * Sent to the Refine Admin panel's Leads page when CONTENT_API_URL and
 * CONTENT_API_TOKEN are set (the panel then emails or forwards it as set in
 * Website Settings). Otherwise to ENQUIRY_WEBHOOK_URL (and optionally
 * ENQUIRY_WEBHOOK_TOKEN), a CRM or automation endpoint. With neither the
 * route answers 503 and stores nothing, and the form shows the phone and
 * email.
 *
 * The rate limit below is per server instance and in memory, so it only
 * slows casual abuse. Before launch, add bot protection at the edge
 * (for example Cloudflare Turnstile or the host's rate limiting).
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^\+?[0-9 ()-]{7,20}$/;
const FALLBACK = "Please call 800 REFINE (733463) or email sales@refinedubai.com.";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/*
 * The visitor's address for the rate limit. Render sits behind Cloudflare,
 * which sets CF-Connecting-IP itself (a visitor cannot fake it). The first
 * X-Forwarded-For entry can be typed by the visitor, so it is not trusted;
 * the last one, added by the proxy, is the fallback.
 */
function clientIp(headers) {
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const forwarded = headers.get("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean);
  return forwarded?.at(-1) || "unknown";
}

export async function POST(request) {
  const ip = clientIp(request.headers);
  if (rateLimited(ip)) {
    return Response.json({ error: `Too many attempts. ${FALLBACK}` }, { status: 429 });
  }

  // JSON only (13 November 2026 audit). A plain form or text/plain post
  // needs no CORS preflight, so any other website could make its visitors'
  // browsers submit enquiries here; the form itself always sends JSON.
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return Response.json({ error: "Invalid request." }, { status: 415 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Spam trap filled: answer as if accepted, forward nothing
  if (body.h99_trap) return Response.json({ ok: true });

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const mobile = String(body.mobile ?? "").trim().slice(0, 30);
  const digits = mobile.replace(/\D/g, "").length;

  if (name.length < 2 || !EMAIL.test(email) || !PHONE_CHARS.test(mobile) || digits < 7 || digits > 15) {
    return Response.json({ error: "Please check your name, email and mobile number." }, { status: 422 });
  }

  // UTM tags from the page address, when the form passes them on.
  const utm = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    if (typeof body[key] === "string" && body[key].trim()) utm[key] = body[key].trim().slice(0, 200);
  }

  const sent = await sendToPanel({ name, email, mobile, utm, ip }) ?? (await sendToWebhook({ name, email, mobile }));
  if (sent === null) {
    return Response.json({ error: `Online enquiries are not open yet. ${FALLBACK}` }, { status: 503 });
  }
  if (!sent) {
    return Response.json({ error: `We could not send your details. ${FALLBACK}` }, { status: 502 });
  }
  return Response.json({ ok: true });
}

/*
 * To the Refine Admin panel's Leads page (POST /api/v1/leads), with the
 * same site key the site reads its content with. The panel stores the
 * enquiry and then routes it (email, CRM webhook) as set in Website
 * Settings. Returns null when the panel is not configured, so the webhook
 * below can be used instead; true or false otherwise.
 */
async function sendToPanel({ name, email, mobile, utm, ip }) {
  const baseUrl = process.env.CONTENT_API_URL?.trim();
  const token = process.env.CONTENT_API_TOKEN?.trim();
  if (!baseUrl || !token) return null;

  const [firstName, ...rest] = name.split(/\s+/);
  const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/v1/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      // The visitor's address, for the panel's per-visitor limit.
      ...(ip !== "unknown" ? { "X-Client-IP": ip } : {}),
    },
    body: JSON.stringify({
      source: "register-interest",
      formSource: "haus99-website",
      firstName,
      lastName: rest.join(" "),
      email,
      phone: mobile,
      // The form states that sending is agreeing to be contacted.
      consent: true,
      ...utm,
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (!res?.ok) console.error("Panel lead submission failed:", res?.status ?? "no response");
  return Boolean(res?.ok);
}

// The older route: a CRM or automation webhook, if one is set instead.
async function sendToWebhook({ name, email, mobile }) {
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) return null;

  const res = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ENQUIRY_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.ENQUIRY_WEBHOOK_TOKEN}` } : {}),
    },
    body: JSON.stringify({ project: "HAUS 99", name, email, mobile, submittedAt: new Date().toISOString() }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  return Boolean(res?.ok);
}

