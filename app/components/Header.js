"use client";

import { useEffect, useRef, useState } from "react";

// Matches the breakpoint in globals.css where the links fold into the menu
const MENU_QUERY = "(max-width: 1023px)";

/*
 * Transparent over the hero, then a solid bar once the page scrolls.
 * Below 1024px the links fold into a menu button.
 */
export default function Header({ nav }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /*
   * While the menu is open: lock the page scroll, keep keyboard focus inside
   * the menu (the page behind is made inert), close on Escape, and close if
   * the window grows past the menu breakpoint (for example a tablet turned
   * to landscape), which would otherwise leave the page unable to scroll.
   */
  useEffect(() => {
    if (!open) return;
    const behind = document.querySelectorAll("body > :not(header):not(script)");
    const toggle = toggleRef.current;
    const media = window.matchMedia(MENU_QUERY);
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle?.focus();
    };
    const onMedia = () => !media.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    media.addEventListener("change", onMedia);
    document.body.style.overflow = "hidden";
    behind.forEach((el) => (el.inert = true));
    return () => {
      document.removeEventListener("keydown", onKey);
      media.removeEventListener("change", onMedia);
      document.body.style.overflow = "";
      behind.forEach((el) => (el.inert = false));
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
          ref={toggleRef}
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
