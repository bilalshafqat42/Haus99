"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import IllustrativeMap from "./IllustrativeMap";
import { applyRoadStyle } from "./map-road-style";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const STYLE_URL = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || "mapbox://styles/mapbox/light-v11";

// content.js keeps Google Maps order [lat, lng]; Mapbox wants [lng, lat].
const lngLat = (coords) => (Array.isArray(coords) && coords.length === 2 ? [coords[1], coords[0]] : null);


const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isPhone = () => window.matchMedia("(max-width: 767px)").matches;
// Phones and tablets: the map sits above the card rather than behind it (globals.css).
const isStacked = () => window.matchMedia("(max-width: 1023px)").matches;
const NO_PADDING = { top: 0, right: 0, bottom: 0, left: 0 };
const PROJECT_ID = "__project";

// How far the card covers the map from the left (0 on phones and tablets, where the card is below it).
function cardInset(section, container) {
  if (isStacked() || !section || !container) return 0;
  const card = section.querySelector(".location-card")?.getBoundingClientRect();
  return card ? Math.max(0, card.right - container.getBoundingClientRect().left) : 0;
}

// Line icons for the pins, on a 24px grid (the Eden House pin style).
// Fixed strings from this file only, never from content.
const ICONS = {
  road: '<path d="M8 21 10 3M16 21 14 3"/><path d="M12 5v2M12 10.5v2M12 16v2"/>',
  shopping: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  marina: '<path d="M3 17h18l-2.5 4h-13z"/><path d="M12 3v14"/><path d="M12 4l6 10h-6"/><path d="M12 7l-4 7h4"/>',
  palm: '<path d="M12 21c0-4.5.4-8.5 1-11.5"/><path d="M13 9.5C11.5 6.5 8.5 6 6 7.5c2.5 0 4.5 1 6 3"/><path d="M13 9.5c1.5-3 4.5-3.5 7-2-2.5 0-4.5 1-6 3"/><path d="M13 9.5c0-3-1.5-5.5-4-6.5 1.5 2 2.5 4.5 2.5 6.5"/><path d="M8 21h9"/>',
  landmark: '<path d="M12 2v3"/><path d="M10.5 5h3l1 16h-5z"/><path d="M8 21h8"/>',
};
const ICON_SVG = (name) =>
  `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ICONS.landmark}</svg>`;

/*
 * A square brand pin with an icon, and the place's name beside it. Names
 * are set with textContent, never as HTML.
 */
function markerElement(name, kind, icon) {
  const el = document.createElement("div");
  el.className = `map-marker map-marker--${kind}`;
  el.setAttribute("aria-hidden", "true");
  const pin = document.createElement("span");
  pin.className = "map-marker__pin";
  pin.innerHTML = ICON_SVG(icon);
  const label = document.createElement("span");
  label.className = "map-marker__label";
  label.textContent = name;
  el.append(pin, label);
  return el;
}

/*
 * The HAUS 99 callout, the map's focal point: a dark card with the
 * monogram, the name and the neighbourhood, and a pointer down to a gold
 * dot with a pulsing halo on the exact plot. Anchored at the dot. The card
 * counts as the "pin" for the overlap check, so other places give way to it.
 */
function projectElement(name, area) {
  const el = document.createElement("div");
  el.className = "map-marker map-marker--project";
  el.setAttribute("aria-hidden", "true");
  el.title = `${name}: click to zoom in`;
  const card = document.createElement("span");
  card.className = "map-marker__pin project-callout";
  const badge = document.createElement("span");
  badge.className = "project-callout__badge";
  const img = document.createElement("img");
  img.src = "/brand/monogram.png";
  img.alt = "";
  badge.append(img);
  const text = document.createElement("span");
  text.className = "project-callout__text";
  const title = document.createElement("span");
  title.className = "project-callout__name";
  title.textContent = name;
  const sub = document.createElement("span");
  sub.className = "project-callout__area";
  sub.textContent = area;
  text.append(title, sub);
  card.append(badge, text);
  const stem = document.createElement("span");
  stem.className = "project-callout__stem";
  const dot = document.createElement("span");
  dot.className = "project-callout__dot";
  // No separate label: the card carries the name.
  const label = document.createElement("span");
  label.className = "map-marker__label";
  el.append(card, stem, dot, label);
  return el;
}

/*
 * The location section: the Mapbox map (same Studio style and road
 * treatment as the Eden House The Park site) with the white card over it.
 * The card's destinations and the map's pins share one selection:
 * clicking a row highlights its pin and moves the map there, clicking it
 * again goes back to the opening view, and clicking a pin selects its row.
 *
 * Mapbox GL is only downloaded when the section comes within a screen of
 * the viewport. Without an access token the drawn, illustrative map shows
 * and the destinations are a plain list.
 */
export default function LocationExplorer({ location, mapsHref }) {
  // `location` is the panel-edited copy (app/panel/sections.js); pins keep
  // their coordinates and icons from app/content.js.
  const [{ PROJECT, PLACES }] = useState(() => ({
    PROJECT: {
      name: location.project?.name || "HAUS 99",
      area: location.project?.area || "Jumeirah Village Triangle",
      coords: lngLat(location.project?.coords),
    },
    PLACES: location.distances.map((d) => ({ ...d, coords: lngLat(d.coords) })),
  }));
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const homeRef = useRef(null);
  const markersRef = useRef({});
  const layoutRef = useRef(null);
  const selectRef = useRef(null);
  const [active, setActive] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!TOKEN || !container) return undefined;

    let cancelled = false;

    /*
     * Places close together would draw over each other. Taking the HAUS 99
     * callout first (it never hides), then the selected place, then list order: a marker
     * whose pin lands on one already placed folds away; one whose label
     * would overlap keeps its pin and hides its name. Both come back on
     * hover, when selected, or once zoomed in far enough to fit.
     */
    const layoutLabels = () => {
      const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      const all = Object.values(markersRef.current);
      for (const el of all) el.classList.remove("is-label-hidden", "is-folded");
      const rank = (el) => (el.classList.contains("map-marker--project") ? 0 : el.classList.contains("is-active") ? 1 : 2);
      const ordered = [...all].sort((a, b) => rank(a) - rank(b));
      const taken = [];
      for (const el of ordered) {
        const pin = el.querySelector(".map-marker__pin").getBoundingClientRect();
        const label = el.querySelector(".map-marker__label").getBoundingClientRect();
        if (taken.some((r) => overlaps(pin, r))) {
          el.classList.add("is-folded");
          continue;
        }
        taken.push(pin);
        if (taken.slice(0, -1).some((r) => overlaps(label, r))) el.classList.add("is-label-hidden");
        else taken.push(label);
      }
    };
    layoutRef.current = layoutLabels;

    const init = async () => {
      const { default: mapboxgl } = await import("mapbox-gl");
      if (cancelled) return;

      const options = {
        container,
        style: STYLE_URL,
        accessToken: TOKEN,
        // Scrolling past the map scrolls the page; ctrl/cmd or two fingers zoom it.
        cooperativeGestures: true,
        attributionControl: false,
      };
      const points = [PROJECT.coords, ...PLACES.map((p) => p.coords)].filter(Boolean);
      if (points.length > 0) {
        const lngs = points.map((p) => p[0]);
        const lats = points.map((p) => p[1]);
        options.bounds = [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
        options.fitBoundsOptions = { padding: framePadding(), maxZoom: isPhone() ? 11.5 : 12.5 };
      }

      const map = new mapboxgl.Map(options);
      mapRef.current = map;
      map.addControl(new mapboxgl.AttributionControl({ compact: true }));

      map.on("load", () => {
        applyRoadStyle(map);
        homeRef.current = { center: map.getCenter(), zoom: map.getZoom() };
        if (PROJECT.coords) {
          const el = projectElement(PROJECT.name, PROJECT.area);
          el.addEventListener("click", () => selectRef.current?.(PROJECT_ID));
          markersRef.current[PROJECT_ID] = el;
          // Anchored at the centre of the dot, which sits at the bottom of the callout.
          new mapboxgl.Marker({ element: el, anchor: "bottom", offset: [0, 9] }).setLngLat(PROJECT.coords).addTo(map);
        }
        for (const place of PLACES) {
          if (!place.coords) continue;
          const el = markerElement(place.place, "place", place.icon);
          el.addEventListener("click", () => selectRef.current?.(place.place));
          markersRef.current[place.place] = el;
          new mapboxgl.Marker({ element: el, anchor: "left", offset: [-12, 0] }).setLngLat(place.coords).addTo(map);
        }
        setMapReady(true);
        layoutLabels();
      });
      map.on("moveend", layoutLabels);
    };

    // On wide screens the card sits over the map's left side: keep pins in
    // the space to its right. On phones the card is below the map; labels
    // sit to the right of their pins, so leave room on that side.
    function framePadding() {
      // The HAUS 99 callout stands about 100px above its plot, so the top
      // padding leaves room for it.
      // On phones the callout (about 230px wide, centred on the plot) needs room on both sides.
      if (isStacked()) return { top: 84, bottom: 40, left: 125, right: 125 };
      return { top: 80, bottom: 70, left: cardInset(sectionRef.current, container) + 120, right: 200 };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          init();
        }
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [PLACES, PROJECT]);

  // Highlight the selected pin, and re-check which labels fit.
  useEffect(() => {
    for (const [id, el] of Object.entries(markersRef.current)) el.classList.toggle("is-active", id === active);
    layoutRef.current?.();
  }, [active, mapReady]);

  const select = useCallback(
    (id) => {
      const next = active === id ? null : id;
      setActive(next);
      const map = mapRef.current;
      if (!map || !homeRef.current) return;

      // On phones the map is above the card: bring it into view.
      if (isStacked()) containerRef.current?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });

      const duration = reducedMotion() ? 0 : 1200;
      const inset = cardInset(sectionRef.current, containerRef.current);
      if (next === PROJECT_ID && PROJECT.coords) {
        // Zoom in on the plot, with the callout clear of the card.
        map.flyTo({ center: PROJECT.coords, zoom: 15, padding: { ...NO_PADDING, left: inset, top: 100 }, duration, essential: false });
        return;
      }
      const place = PLACES.find((p) => p.place === next);
      if (!place?.coords) {
        map.easeTo({ ...homeRef.current, padding: NO_PADDING, duration: reducedMotion() ? 0 : 900 });
        return;
      }
      if (PROJECT.coords) {
        // Room above for the HAUS 99 callout; on phones and tablets it is centred, so equal sides.
        const padding = isStacked()
          ? { top: 150, bottom: 50, left: 125, right: 125 }
          : { top: 150, bottom: 60, left: inset + 120, right: 200 };
        map.fitBounds([PROJECT.coords, place.coords], { padding, maxZoom: 14, duration });
      } else {
        // Centre the pin in the part of the map the card does not cover.
        map.flyTo({ center: place.coords, zoom: 13.5, padding: { ...NO_PADDING, left: inset }, duration, essential: false });
      }
    },
    [active, PLACES, PROJECT],
  );

  useEffect(() => {
    selectRef.current = select;
  }, [select]);

  const live = Boolean(TOKEN);

  return (
    <section className="frame location" id="location" ref={sectionRef}>
      {live ? (
        <div
          ref={containerRef}
          className="map-live"
          role="region"
          aria-label="Map of HAUS 99 in Jumeirah Village Triangle and nearby destinations"
        />
      ) : (
        <IllustrativeMap />
      )}

      <div className="location-card">
        <p className="eyebrow">{location.eyebrow}</p>
        <h2 className="display h3">{location.title}</h2>
        <p className="location-text">{location.text}</p>
        <ul className="distances">
          {PLACES.map((d) => (
            <li key={d.place}>
              {live && d.coords ? (
                <button
                  type="button"
                  className="distance-row"
                  aria-pressed={active === d.place}
                  onClick={() => select(d.place)}
                >
                  <span className="distance-place">
                    <span className="distance-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON_SVG(d.icon) }} />
                    {d.place}
                  </span>
                  <span className="distance-time">{d.time}</span>
                </button>
              ) : (
                <div className="distance-row">
                  <span className="distance-place">{d.place}</span>
                  <span className="distance-time">{d.time}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
        <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="btn btn-dark btn-block">
          Open in Google Maps
        </a>
      </div>
      <p className="map-note">{live ? "" : "Map is illustrative and not to scale. "}Drive times are approximate.</p>
    </section>
  );
}
