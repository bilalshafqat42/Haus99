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

/*
 * A native scroll-snap track (swipe, trackpad and keyboard all work) with
 * a counter, arrows and an optional progress bar.
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
  const [index, setIndex] = useState(0);

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
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        setIndex(atEnd ? total - 1 : Math.round(track.scrollLeft / step()));
      });
    };
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [step, total]);

  const go = (dir) => {
    const track = trackRef.current;
    const target = Math.max(0, Math.min(total - 1, index + dir));
    track?.scrollTo({ left: target * step(), behavior: "smooth" });
  };

  const counter = (
    <p className="carousel-count" aria-live="polite">
      {pad(index + 1)} / {pad(total)}
    </p>
  );

  const arrows = (
    <div className="carousel-arrows">
      <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous">
        <Arrow direction="prev" />
      </button>
      <button type="button" onClick={() => go(1)} disabled={index >= total - 1} aria-label="Next">
        <Arrow direction="next" />
      </button>
    </div>
  );

  return (
    <div className={`carousel carousel-${controls} ${className}`}>
      {controls === "top" && (
        <div className="carousel-bar container">
          {head ?? counter}
          <div className="carousel-controls">
            {head && counter}
            {arrows}
          </div>
        </div>
      )}

      <ul ref={trackRef} className="carousel-track" aria-label={label} tabIndex={0}>
        {slides.map((slide, i) => (
          <li key={i} className="carousel-slide" aria-label={`${i + 1} of ${total}`}>
            {slide}
          </li>
        ))}
      </ul>

      {progress && (
        <div className="carousel-progress container" aria-hidden="true">
          <span style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      )}

      {controls === "bottom" && (
        <div className="carousel-bar container">
          {footnote ? <p className="eyebrow eyebrow-muted">{footnote}</p> : <span />}
          <div className="carousel-controls">
            {counter}
            {arrows}
          </div>
        </div>
      )}
      {controls === "top" && footnote && <p className="carousel-footnote container">{footnote}</p>}
    </div>
  );
}
