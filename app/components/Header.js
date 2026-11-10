"use client";

import { useEffect, useState } from "react";
import { nav } from "../content";

/*
 * Transparent over the hero, then a solid bar once the page scrolls.
 * Below 960px the links fold into a menu button.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`header${scrolled ? " is-solid" : ""}${open ? " is-open" : ""}`}>
      <div className="header-inner">
        <a href="#main" className="wordmark" aria-label="HAUS 99, back to top" onClick={close}>
          HAUS 99
        </a>

        <nav className="header-nav" id="site-nav" aria-label="Main">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={close}>
              {item.label}
            </a>
          ))}
          <a href="#register" className="btn btn-outline btn-sm" onClick={close}>
            Register interest
          </a>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
