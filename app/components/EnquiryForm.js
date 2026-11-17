"use client";

import { useState } from "react";

/*
 * Posts to /api/enquiry, which sends the enquiry to the Refine Admin panel's
 * Leads page. If that fails, the form tells the visitor to call or email
 * instead, so no enquiry is silently lost. `site` carries the phone, email
 * and privacy link, editable in the panel.
 */
// Campaign tags (utm_source and so on) from the page address, passed on with
// the enquiry so the panel's Leads page shows where the visitor came from.
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
function utmTags() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(UTM_KEYS.filter((key) => params.get(key)).map((key) => [key, params.get(key).slice(0, 200)]));
}

// The fields checked before sending, in page order, with the message shown
// under each one when it is missing or not valid.
const FIELDS = [
  { name: "name", label: "Full name", missing: "Enter your full name.", invalid: "Enter at least 2 letters." },
  { name: "email", label: "Email", missing: "Enter your email address.", invalid: "Enter an email address like name@email.com." },
  { name: "mobile", label: "Mobile", missing: "Enter your mobile number.", invalid: "Enter a phone number like +971 50 123 4567." },
];

function errorFor(field, input) {
  const value = input.value.trim();
  if (!value) return field.missing;
  if (!input.validity.valid || (field.name === "name" && value.length < 2)) return field.invalid;
  return "";
}

// { name: message } for every field that is not valid
function validate(form) {
  const errors = {};
  for (const field of FIELDS) {
    const message = errorFor(field, form.elements[field.name]);
    if (message) errors[field.name] = message;
  }
  return errors;
}

export default function EnquiryForm({ site }) {
  const FALLBACK = `We could not send your details. Please call ${site.phoneLabel} or email ${site.email}.`;
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const invalid = FIELDS.filter((f) => errors[f.name]);

  // Once a field shows an error, check it again as the visitor corrects it
  function onFieldInput(event) {
    const field = FIELDS.find((f) => f.name === event.target.name);
    if (!field || !errors[field.name]) return;
    const next = errorFor(field, event.target);
    setErrors((prev) => {
      const copy = { ...prev };
      if (next) copy[field.name] = next;
      else delete copy[field.name];
      return copy;
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const found = validate(form);
    setErrors(found);
    const first = FIELDS.find((f) => found[f.name]);
    if (first) {
      setStatus("idle");
      setMessage("");
      form.elements[first.name].focus();
      return;
    }

    setStatus("sending");
    setMessage("");
    let serverMessage = "";
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), ...utmTags() }),
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

  // Marks a field invalid and links it to its message, for screen readers
  function errorProps(name) {
    return errors[name] ? { "aria-invalid": true, "aria-describedby": `enquiry-${name}-error` } : {};
  }

  return (
    <form
      className={`enquiry-form${invalid.length ? " has-errors" : ""}`}
      onSubmit={onSubmit}
      onInput={onFieldInput}
      noValidate
      aria-describedby="enquiry-consent"
    >
      <p className="form-errors" role="alert">
        {invalid.length > 0 &&
          `Please check ${invalid.length === 1 ? "this field" : "these fields"}: ${invalid.map((f) => f.label).join(", ")}.`}
      </p>
      <label className="field">
        <span>Full name</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          required
          minLength={2}
          maxLength={120}
          {...errorProps("name")}
        />
        <FieldError name="name" message={errors.name} />
      </label>
      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@email.com"
          required
          maxLength={200}
          {...errorProps("email")}
        />
        <FieldError name="email" message={errors.email} />
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
          {...errorProps("mobile")}
        />
        <FieldError name="mobile" message={errors.mobile} />
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
        By sending, you agree to be contacted about HAUS 99 and to our{" "}
        {site.privacyHref && site.privacyHref !== "#" ? <a href={site.privacyHref}>privacy policy</a> : "privacy policy"}.
      </p>
      <p className={`form-status is-${status}`} role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}

function FieldError({ name, message }) {
  if (!message) return null;
  return (
    <span className="field-error" id={`enquiry-${name}-error`}>
      {message}
    </span>
  );
}
