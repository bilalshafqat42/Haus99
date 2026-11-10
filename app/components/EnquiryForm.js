"use client";

import { useState } from "react";
import { site } from "../content";

/*
 * Posts to /api/enquiry. Until that route is connected to the CRM it
 * answers 503, and the form tells the visitor to call or email instead,
 * so no enquiry is silently lost.
 */
export default function EnquiryForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [message, setMessage] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      form.reset();
      setStatus("sent");
      setMessage("Thank you. A member of the sales team will call you shortly.");
    } catch (err) {
      setStatus("error");
      setMessage(
        err.message ||
          `We could not send your details. Please call ${site.phoneLabel} or email ${site.email}.`,
      );
    }
  }

  return (
    <form className="enquiry-form" onSubmit={onSubmit} noValidate>
      <label className="field">
        <span>Full name</span>
        <input name="name" type="text" autoComplete="name" placeholder="Your name" required minLength={2} />
      </label>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" placeholder="name@email.com" required />
      </label>
      <label className="field">
        <span>Mobile</span>
        <input
          name="mobile"
          type="tel"
          autoComplete="tel"
          placeholder="+971"
          required
          pattern="^\+?[0-9 ()-]{7,20}$"
        />
      </label>
      {/* Honeypot: hidden from people, filled in by most bots */}
      <input name="company" type="text" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <button type="submit" className="btn btn-light" disabled={status === "sending"}>
        {status === "sending" ? "Sending" : "Send"}
      </button>

      <p className="form-consent">
        By sending, you agree to be contacted about HAUS 99 and to our <a href="#">privacy policy</a>.
      </p>
      {message && (
        <p className={`form-status is-${status}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
