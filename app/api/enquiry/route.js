/*
 * Register-interest submissions.
 *
 * Set ENQUIRY_WEBHOOK_URL (and optionally ENQUIRY_WEBHOOK_TOKEN) to the CRM
 * or automation endpoint that should receive leads. Without it the route
 * answers 503 and stores nothing, and the form shows the phone and email.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ()-]{7,20}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot filled: pretend success, drop it
  if (body.company) return Response.json({ ok: true });

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const mobile = String(body.mobile ?? "").trim().slice(0, 30);

  if (name.length < 2 || !EMAIL.test(email) || !PHONE.test(mobile)) {
    return Response.json({ error: "Please check your name, email and mobile number." }, { status: 422 });
  }

  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) {
    return Response.json(
      { error: "Online enquiries are not open yet. Please call 800 REFINE (733463) or email sales@refinedubai.com." },
      { status: 503 },
    );
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ENQUIRY_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.ENQUIRY_WEBHOOK_TOKEN}` } : {}),
    },
    body: JSON.stringify({ project: "HAUS 99", name, email, mobile, submittedAt: new Date().toISOString() }),
  }).catch(() => null);

  if (!res?.ok) {
    return Response.json(
      { error: "We could not send your details. Please call 800 REFINE (733463) or email sales@refinedubai.com." },
      { status: 502 },
    );
  }
  return Response.json({ ok: true });
}
