/*
 * Register-interest submissions.
 *
 * Set ENQUIRY_WEBHOOK_URL (and optionally ENQUIRY_WEBHOOK_TOKEN) to the CRM
 * or automation endpoint that should receive leads. Without it the route
 * answers 503 and stores nothing, and the form shows the phone and email.
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

  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) {
    return Response.json({ error: `Online enquiries are not open yet. ${FALLBACK}` }, { status: 503 });
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ENQUIRY_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.ENQUIRY_WEBHOOK_TOKEN}` } : {}),
    },
    body: JSON.stringify({ project: "HAUS 99", name, email, mobile, submittedAt: new Date().toISOString() }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (!res?.ok) {
    return Response.json({ error: `We could not send your details. ${FALLBACK}` }, { status: 502 });
  }
  return Response.json({ ok: true });
}
