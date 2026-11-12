"use client";

import { useState } from "react";

/*
 * Posts to /api/enquiry, which sends the enquiry to the Refine Admin panel's
 * Leads page. If that fails, the form tells the visitor to call or email
 * instead, so no enquiry is silently lost. `site` carries the phone, email
 * and privacy link, editable in the panel.
 */
export default function EnquiryForm({ site }) {
  const FALLBACK = `We could not send your details. Please call ${site.phoneLabel} or email ${site.email}.`;
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [message, setMessage] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setStatus("sending");
    setMessage("");
    let serverMessage = "";
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        serverMessage = typeof data.error === "string" ? data.error : "";
        throw new Error("rejected");
      }
      form.reset();
      setStatus("sent");
      setMessage("Thank you. A member of the sales team will call you shortly.");
    } catch {
      // Network failures, timeouts and server errors all end with the phone and email
      setStatus("error");
      setMessage(serverMessage || FALLBACK);
    }
  }

  return (
    <form className="enquiry-form" onSubmit={onSubmit} noValidate aria-describedby="enquiry-consent">
      <label className="field">
        <span>Full name</span>
        <input name="name" type="text" autoComplete="name" placeholder="Your name" required minLength={2} maxLength={120} />
      </label>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" placeholder="name@email.com" required maxLength={200} />
      </label>
      <label className="field">
        <span>Mobile</span>
        <input
          name="mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+971"
          required
          maxLength={20}
          pattern="\+?[0-9 \(\)\-]{7,20}"
          title="A phone number, for example +971 50 123 4567"
        />
      </label>
      {/* Spam trap: not rendered for people or autofill, filled in by most bots */}
      <div hidden>
        <label>
          Leave this empty
          <input name="h99_trap" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <button type="submit" className="btn btn-light" disabled={status === "sending"}>
        {status === "sending" ? "Sending" : "Send"}
      </button>

      <p className="form-consent" id="enquiry-consent">
        By sending, you agree to be contacted about HAUS 99 and to our <a href={site.privacyHref}>privacy policy</a>.
      </p>
      <p className={`form-status is-${status}`} role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
