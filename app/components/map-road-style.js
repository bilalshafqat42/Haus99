/*
 * The location map's roads, identical to the Eden House The Park site so
 * the two maps match: the whole network as fine hairlines in one soft
 * tone (the treatment first used on the Mövenpick site, same Mapbox
 * account and Studio style).
 * Seen at city scale, the network reads as a calm texture rather than a
 * diagram, and the destination callouts carry the information.
 *
 * Applied over the Studio style once it loads:
 * - the main and connector roads (motorway to tertiary, with their
 *   links), without the small inner streets, drawn on the ground and
 *   bridge layers alike, so flyovers and canal crossings do not leave gaps;
 * - one opaque tone, so crossing roads do not darken where they overlap;
 * - widths that stay hairline at city zoom and grow when zoomed in;
 * - tunnels, paths and bridge casings hidden.
 *
 * Everything else (land, water) still comes from the Studio style. A
 * layer the style does not have is skipped, so a Studio change cannot
 * break the map.
 */

const ROAD_TONE = "hsl(75, 9%, 76%)";

// Which road classes show at each zoom (Mapbox's standard steps, without
// the small inner streets: street, street_limited and service roads are
// never drawn, so neighbourhoods read as calm blocks)
const ROADS = ["motorway", "motorway_link", "trunk", "trunk_link", "primary", "primary_link", "secondary", "secondary_link", "tertiary", "tertiary_link"];
const CLASSES_BY_ZOOM = [
  "step", ["zoom"],
  ["match", ["get", "class"], ["motorway", "trunk"], true, false],
  6, ["match", ["get", "class"], ["motorway", "trunk", "primary"], true, false],
  8, ["match", ["get", "class"], ["motorway", "trunk", "primary", "secondary"], true, false],
  10, ["match", ["get", "class"], ROADS, true, false],
];

const STRUCTURES = {
  "road-simple": ["match", ["get", "structure"], ["none", "ford"], true, false],
  "bridge-simple": ["==", ["get", "structure"], "bridge"],
};

const HIDDEN = [
  "tunnel-simple", "tunnel-path-trail", "tunnel-path-cycleway-piste", "tunnel-path", "tunnel-steps", "tunnel-pedestrian",
  "bridge-case-simple",
];

const byClass = (main, mid, minor) => [
  "match", ["get", "class"],
  ["motorway", "trunk", "primary"], main,
  ["secondary", "tertiary"], mid,
  minor,
];

// Hairlines at city zoom (about 10-11), growing as you zoom in
export const ROAD_WIDTH = [
  "interpolate", ["exponential", 1.99], ["zoom"],
  5, byClass(0.45, 0.06, 0),
  13, byClass(2.4, 1.5, 0.45),
  18, byClass(19.2, 15.6, 7),
];

export function roadFilter(layerId) {
  return ["all", STRUCTURES[layerId], CLASSES_BY_ZOOM, ["==", ["geometry-type"], "LineString"]];
}

export function applyRoadStyle(map) {
  for (const id of HIDDEN) {
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "none");
  }
  for (const id of Object.keys(STRUCTURES)) {
    if (!map.getLayer(id)) continue;
    map.setFilter(id, roadFilter(id));
    map.setPaintProperty(id, "line-color", ROAD_TONE);
    map.setPaintProperty(id, "line-width", ROAD_WIDTH);
    map.setLayoutProperty(id, "line-cap", "round");
    map.setLayoutProperty(id, "line-join", "round");
    map.setLayoutProperty(id, "visibility", "visible");
    map.setLayerZoomRange(id, 0, 24);
  }
}
