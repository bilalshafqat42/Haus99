"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");

function Arrow({ direction }) {
  return (
    <svg width="38" height="12" viewBox="0 0 38 12" fill="none" aria-hidden="true">
      {direction === "prev" ? (
        <path d="M37 6H1M1 6L6.5 0.75M1 6L6.5 11.25" stroke="currentColor" strokeWidth="1.2" />
      ) : (
        <path d="M1 6H37M37 6L31.5 0.75M37 6L31.5 11.25" stroke="currentColor" strokeWidth="1.2" />
      )}
    </svg>
  );
}

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*
 * A native scroll-snap track (swipe, trackpad and keyboard all work) with
 * a counter, arrows and an optional progress bar.
 *
 * All state is read from the track's real scroll position, so the arrows
 * never get out of step with a swipe, and when every slide fits on screen
 * the arrows and progress bar are hidden.
 *
 * controls: "top" puts the counter and arrows above the track (with `head`
 * on the left when given), "bottom" puts them below with `footnote`.
 */
export default function Carousel({
  children,
  label,
  className = "",
  controls = "bottom",
  head = null,
  footnote = null,
  progress = false,
}) {
  const trackRef = useRef(null);
  const slides = Children.toArray(children);
  const total = slides.length;
  const [state, setState] = useState({ index: 0, atStart: true, atEnd: total <= 1, scrollable: total > 1 });

  const step = useCallback(() => {
    const track = trackRef.current;
    const first = track?.children[0];
    if (!first) return 1;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const measure = () => {
      const max = track.scrollWidth - track.clientWidth;
      const scrollable = max > 4;
      const atStart = track.scrollLeft <= 4;
      const atEnd = track.scrollLeft >= max - 4;
      const index = atEnd ? total - 1 : Math.min(total - 1, Math.round(track.scrollLeft / step()));
      setState((prev) =>
        prev.index === index && prev.atStart === atStart && prev.atEnd === atEnd && prev.scrollable === scrollable
          ? prev
          : { index, atStart, atEnd, scrollable },
      );
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [step, total]);

  /*
   * Mouse dragging. Touch and trackpads already scroll the track natively,
   * so this only handles a mouse: snapping is paused while dragging, then the
   * track settles on the nearest slide in the direction of the drag. A drag
   * longer than a few pixels cancels the click that follows it.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let drag = null;
    let suppressClick = false;
    let restoreTimer = 0;

    const restoreSnap = () => {
      clearTimeout(restoreTimer);
      track.style.scrollSnapType = "";
    };

    const onDown = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (track.scrollWidth - track.clientWidth <= 4) return;
      restoreSnap();
      drag = { id: e.pointerId, x: e.clientX, left: track.scrollLeft, moved: false };
    };

    const onMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 5) return;
        drag.moved = true;
        track.setPointerCapture(e.pointerId);
        track.style.scrollSnapType = "none";
        track.classList.add("is-dragging");
      }
      track.scrollLeft = drag.left - dx;
    };

    const onUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { moved, left } = drag;
      drag = null;
      if (!moved) return;
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      track.classList.remove("is-dragging");
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);

      const size = step();
      const max = track.scrollWidth - track.clientWidth;
      const position = track.scrollLeft / size;
      const moveRight = track.scrollLeft > left;
      // Settle forward or back depending on the drag direction, unless the drag barely moved
      const delta = Math.abs(track.scrollLeft - left);
      const index = moveRight ? Math.ceil(position) : Math.floor(position);
      // A short drag goes back to where it started
      const target = delta < size * 0.15 ? left : Math.max(0, Math.min(max, index * size));
      track.scrollTo({ left: target, behavior: reducedMotion() ? "auto" : "smooth" });
      // Turn snapping back on once the settle animation has finished
      const done = () => restoreSnap();
      track.addEventListener("scrollend", done, { once: true });
      restoreTimer = setTimeout(done, 700);
    };

    const onClick = (e) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };
    // Images and links would otherwise start the browser's own drag-and-drop
    const onDragStart = (e) => e.preventDefault();

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    track.addEventListener("click", onClick, true);
    track.addEventListener("dragstart", onDragStart);
    return () => {
      clearTimeout(restoreTimer);
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      track.removeEventListener("click", onClick, true);
      track.removeEventListener("dragstart", onDragStart);
    };
  }, [step]);

  const go = (dir) => {
    trackRef.current?.scrollBy({ left: dir * step(), behavior: reducedMotion() ? "auto" : "smooth" });
  };

  const { index, atStart, atEnd, scrollable } = state;

  const counter = (
    <p className="carousel-count" aria-live="polite">
      {pad(index + 1)} / {pad(total)}
    </p>
  );

  const arrows = scrollable ? (
    <div className="carousel-arrows">
      <button type="button" onClick={() => go(-1)} disabled={atStart} aria-label={`Previous ${label}`}>
        <Arrow direction="prev" />
      </button>
      <button type="button" onClick={() => go(1)} disabled={atEnd} aria-label={`Next ${label}`}>
        <Arrow direction="next" />
      </button>
    </div>
  ) : null;

  return (
    <div className={`carousel carousel-${controls} ${className}`}>
      {controls === "top" && (
        <div className="carousel-bar container">
          {head ?? (scrollable ? counter : <span />)}
          <div className="carousel-controls">
            {head && scrollable && counter}
            {arrows}
          </div>
        </div>
      )}

      <ul ref={trackRef} className={`carousel-track${scrollable ? " is-draggable" : ""}`} aria-label={label} tabIndex={scrollable ? 0 : -1}>
        {slides.map((slide, i) => (
          <li key={i} className="carousel-slide" aria-roledescription="slide" aria-label={`${i + 1} of ${total}`}>
            {slide}
          </li>
        ))}
      </ul>

      {progress && scrollable && (
        <div className="carousel-progress container" aria-hidden="true">
          <span style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      )}

      {controls === "bottom" && (
        <div className="carousel-bar container">
          {footnote ? <p className="eyebrow eyebrow-muted">{footnote}</p> : <span />}
          <div className="carousel-controls">
            {scrollable && counter}
            {arrows}
          </div>
        </div>
      )}
      {controls === "top" && footnote && <p className="carousel-footnote container">{footnote}</p>}
    </div>
  );
}
