"use client";

import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import IllustrativeMap from "./IllustrativeMap";
import { applyRoadStyle } from "./map-road-style";
import { location } from "../content";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const STYLE_URL = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || "mapbox://styles/mapbox/light-v11";

// content.js keeps Google Maps order [lat, lng]; Mapbox wants [lng, lat].
const lngLat = (coords) => (Array.isArray(coords) && coords.length === 2 ? [coords[1], coords[0]] : null);

const PROJECT = { name: location.project?.name || "HAUS 99", coords: lngLat(location.project?.coords) };
const PLACES = location.distances.map((d) => ({ name: d.place, coords: lngLat(d.coords) })).filter((p) => p.coords);

/*
 * A square brand pin with the place's name beside it. Names are set with
 * textContent, never as HTML. The project pin carries the monogram.
 */
function markerElement(name, kind) {
  const el = document.createElement("div");
  el.className = `map-marker map-marker--${kind}`;
  el.setAttribute("aria-hidden", "true");
  const pin = document.createElement("span");
  pin.className = "map-marker__pin";
  if (kind === "project") {
    const img = document.createElement("img");
    img.src = "/brand/monogram.png";
    img.alt = "";
    pin.append(img);
  }
  const label = document.createElement("span");
  label.className = "map-marker__label";
  label.textContent = name;
  el.append(pin, label);
  return el;
}

/*
 * The location map: Mapbox with the same Studio style and road treatment
 * as the Eden House The Park site. Mapbox GL is only downloaded when the
 * section comes within a screen of the viewport. Without an access token
 * (local development, or before the Render variable is set) the drawn,
 * illustrative map shows instead.
 *
 * The map fills the section behind the white location card, so on wide
 * screens the view is framed in the space to the card's right.
 */
export default function LocationMap() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!TOKEN || !container) return undefined;

    let cancelled = false;
    let map = null;
    const markers = [];

    /*
     * Places close together would draw over each other. In list order (the
     * project pin first): a marker whose pin lands on one already placed
     * folds away; one whose label would overlap keeps its pin and hides its
     * name. Both come back on hover or once the map is zoomed in to fit.
     */
    const layoutLabels = () => {
      const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      const taken = [];
      for (const el of markers) {
        el.classList.remove("is-label-hidden", "is-folded");
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

    // On wide screens the card sits over the map's left side: frame the pins
    // in the space to its right. On phones the card is below the map.
    const framePadding = (phone) => {
      if (phone) return { top: 84, bottom: 36, left: 24, right: 120 }; // room for labels, which sit to the right of their pins
      const card = container.parentElement?.querySelector(".location-card");
      const box = container.getBoundingClientRect();
      const cardBox = card?.getBoundingClientRect();
      const left = cardBox ? Math.max(60, cardBox.right - box.left + 60) : 60;
      return { top: 80, bottom: 80, left, right: 80 };
    };

    const init = async () => {
      const { default: mapboxgl } = await import("mapbox-gl");
      if (cancelled) return;

      const phone = window.matchMedia("(max-width: 767px)").matches;
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
        options.fitBoundsOptions = { padding: framePadding(phone), maxZoom: phone ? 11.5 : 12.5 };
      }

      map = new mapboxgl.Map(options);
      map.addControl(new mapboxgl.AttributionControl({ compact: true }));

      map.on("load", () => {
        applyRoadStyle(map);
        if (PROJECT.coords) {
          const el = markerElement(PROJECT.name, "project");
          markers.push(el);
          new mapboxgl.Marker({ element: el, anchor: "left", offset: [-15, 0] }).setLngLat(PROJECT.coords).addTo(map);
        }
        for (const place of PLACES) {
          const el = markerElement(place.name, "place");
          markers.push(el);
          new mapboxgl.Marker({ element: el, anchor: "left", offset: [-12, 0] }).setLngLat(place.coords).addTo(map);
        }
        layoutLabels();
      });
      map.on("moveend", layoutLabels);
    };

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
      map?.remove();
    };
  }, []);

  if (!TOKEN) return <IllustrativeMap />;

  return (
    <div
      ref={containerRef}
      className="map-live"
      role="region"
      aria-label="Map of HAUS 99 in Jumeirah Village Triangle and nearby destinations"
    />
  );
}
