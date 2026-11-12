import * as defaults from "../content";
import { safeHref, toPlainText } from "./values";

/*
 * What the Refine Admin panel may edit on this site, and how its values
 * map back onto the content shape the page renders (app/content.js).
 *
 * app/content.js stays the source of every default: each field's default
 * below is read from it, so the panel starts out showing exactly the copy
 * that is on the page, and the site falls back to that same copy whenever
 * the panel is unreachable or a value is missing.
 *
 * Pure (no fetch, no server-only), so the manifest push, the page and the
 * tests all share it.
 */

const text = (key, label, value, extra = {}) => ({ key, label, type: "TEXT", default: value ?? "", ...extra });
const long = (key, label, value, extra = {}) => text(key, label, value, { multiline: true, ...extra });
const link = (key, label, value, extra = {}) => ({ key, label, type: "LINK", default: value ?? "", ...extra });
const image = (key, label, value, extra = {}) => ({ key, label, type: "IMAGE", default: value ?? "", ...extra });
const list = (key, label, itemLabel, itemFields, items) => ({
  key,
  label,
  type: "LIST",
  itemLabel,
  itemFields,
  default: items,
});

const { site, nav, hero, stats, intro, project, collection, residences, paymentPlan, amenities, location, developers, enquiry, footer } =
  defaults;

export const SECTION_GROUPS = [
  { key: "homepage", label: "Homepage" },
  { key: "settings", label: "Site settings" },
];

export const SECTIONS = [
  {
    slug: "hero",
    label: "Hero",
    group: "homepage",
    fields: [
      text("title", "Heading", hero.title),
      long("text", "Text", hero.text),
      list("tags", "Tags", "Tag", [text("label", "Tag")], hero.tags.map((label) => ({ label }))),
      image("image", "Background image", hero.image),
    ],
  },
  {
    slug: "stats",
    label: "Key figures",
    group: "homepage",
    fields: [
      list(
        "items",
        "Figures",
        "Figure",
        [text("value", "Figure"), text("label", "Label")],
        stats.map(({ value, label }) => ({ value, label }))
      ),
    ],
  },
  {
    slug: "intro",
    label: "Introduction",
    group: "homepage",
    fields: [long("title", "Heading", intro.title), long("text", "Text", intro.text)],
  },
  {
    slug: "project",
    label: "The project",
    group: "homepage",
    fields: [
      text("eyebrow", "Small heading", project.eyebrow),
      text("title", "Heading", project.title),
      long("text", "Text", project.text),
      text("footnote", "Footnote", project.footnote),
      list(
        "slides",
        "Slides",
        "Slide",
        [image("image", "Image"), text("caption", "Caption")],
        project.slides.map(({ image, caption }) => ({ image, caption }))
      ),
    ],
  },
  {
    slug: "collection",
    label: "The collection",
    group: "homepage",
    fields: [
      text("eyebrow", "Small heading", collection.eyebrow),
      text("title", "Heading", collection.title),
      list("paragraphs", "Paragraphs", "Paragraph", [long("text", "Paragraph")], collection.paragraphs.map((p) => ({ text: p }))),
      text("linkLabel", "Link text", collection.linkLabel),
    ],
  },
  {
    slug: "residences",
    label: "Residences",
    group: "homepage",
    fields: [
      text("eyebrow", "Small heading", residences.eyebrow),
      text("title", "Heading", residences.title),
      long("text", "Text", residences.text),
      list(
        "items",
        "Residence types",
        "Residence type",
        [text("name", "Name"), text("kind", "Kind"), text("price", "Price"), text("size", "Size"), image("image", "Image")],
        residences.items.map(({ name, kind, price, size, image }) => ({ name, kind, price, size, image }))
      ),
    ],
  },
  {
    slug: "paymentPlan",
    label: "Payment plan",
    group: "homepage",
    fields: [
      text("eyebrow", "Small heading", paymentPlan.eyebrow),
      text("title", "Headline figure", paymentPlan.title),
      long("text", "Text", paymentPlan.text),
      list(
        "steps",
        "Instalments",
        "Instalment",
        [text("label", "When"), text("value", "Amount")],
        paymentPlan.steps.map(({ label, value }) => ({ label, value }))
      ),
    ],
  },
  {
    slug: "amenities",
    label: "Amenities",
    group: "homepage",
    fields: [
      text("eyebrow", "Small heading", amenities.eyebrow),
      text("title", "Heading", amenities.title),
      long("text", "Text", amenities.text),
      text("footnote", "Footnote", amenities.footnote),
      list(
        "items",
        "Amenities",
        "Amenity",
        [text("title", "Name"), long("text", "Text"), image("image", "Image")],
        amenities.items.map(({ title, text: body, image }) => ({ title, text: body, image }))
      ),
    ],
  },
  {
    slug: "location",
    label: "Location",
    group: "homepage",
    fields: [
      text("eyebrow", "Small heading", location.eyebrow),
      text("title", "Heading", location.title),
      long("text", "Text", location.text),
      list(
        "distances",
        "Drive times",
        "Place",
        [text("place", "Place"), text("time", "Drive time")],
        location.distances.map(({ place, time }) => ({ place, time }))
      ),
    ],
  },
  {
    slug: "developers",
    label: "The developers",
    group: "homepage",
    fields: [
      text("eyebrow", "Small heading", developers.eyebrow),
      text("title", "Heading", developers.title),
      long("refine", "About Refine", developers.refine),
      long("hausen", "About Hausen", developers.hausen),
      image("hausenLogo", "Hausen logo (dark, on light backgrounds)", developers.hausenLogo, {
        helperText: "Shown in this section and the footer. A transparent PNG or SVG, at least 400px wide.",
      }),
      image("hausenLogoLight", "Hausen logo (white, on the hero photo)", developers.hausenLogoLight, {
        helperText: "Shown at the bottom right of the hero. A white transparent PNG or SVG, at least 400px wide.",
      }),
      image("refineLogo", "Refine logo (dark, on light backgrounds)", developers.refineLogo, {
        helperText: "Shown in this section and the footer. A transparent PNG or SVG, at least 400px wide.",
      }),
    ],
  },
  {
    slug: "enquiry",
    label: "Register interest",
    group: "homepage",
    fields: [
      text("eyebrow", "Small heading", enquiry.eyebrow),
      text("title", "Heading", enquiry.title),
      long("text", "Text", enquiry.text),
    ],
  },
  {
    slug: "contact",
    label: "Contact and links",
    group: "settings",
    fields: [
      text("phoneLabel", "Phone, as shown", site.phoneLabel),
      link("phoneHref", "Phone link", site.phoneHref, { helperText: "For example tel:800733463" }),
      text("email", "Email", site.email),
      text("address", "Address", site.address),
      link("brochureHref", "Brochure link", site.brochureHref, { helperText: "The brochure PDF, or #register for the form" }),
      link("privacyHref", "Privacy policy link", site.privacyHref),
      link("mapsHref", "Google Maps link", site.mapsHref),
    ],
  },
  {
    slug: "navigation",
    label: "Menu",
    group: "settings",
    fields: [list("items", "Menu links", "Link", [text("label", "Label"), link("href", "Link")], nav)],
  },
  {
    slug: "footer",
    label: "Footer",
    group: "settings",
    fields: [
      long("blurb", "Short description", footer.blurb),
      list("explore", "Explore links", "Link", [text("label", "Label"), link("href", "Link")], footer.explore),
      list("legal", "Legal links", "Link", [text("label", "Label"), link("href", "Link")], footer.legal),
      text("copyright", "Copyright line", footer.copyright),
      text("regulatory", "Regulatory line (RERA / DLD)", footer.regulatory),
    ],
  },
];

/*
 * The panel's values for one section, merged over that section's defaults:
 * a value the panel does not have (or an unreachable panel) keeps the
 * default; an empty string an editor saved is kept as empty. TEXT is reduced
 * to plain text (formatting tags removed, React escapes the rest), and links
 * pass through safeHref, so nothing from the panel is ever rendered as HTML.
 */
function sectionValues(slug, panel) {
  const config = SECTIONS.find((s) => s.slug === slug);
  const stored = panel?.[slug] ?? {};
  const out = {};
  for (const field of config.fields) {
    out[field.key] = cleanValue(field, stored[field.key]);
  }
  return out;
}

/*
 * Images can only come from this site or the hosts next.config.mjs allows
 * (IMAGE_HOSTS, default media.refinedubai.com). next/image refuses any other
 * host with an error that would take the whole page down, so an image from
 * elsewhere falls back to the default instead.
 */
const IMAGE_HOSTS = (process.env.IMAGE_HOSTS ?? "media.refinedubai.com")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

function safeImage(value, fallback) {
  const href = safeHref(value);
  if (href === "" || href === "#") return fallback;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && IMAGE_HOSTS.includes(url.hostname.toLowerCase()) ? href : fallback;
  } catch {
    return fallback;
  }
}

function cleanScalar(type, value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") return fallback;
  if (type === "LINK") return safeHref(value);
  if (type === "IMAGE") return safeImage(value, fallback);
  return toPlainText(value);
}

function cleanValue(field, value) {
  if (field.type !== "LIST") return cleanScalar(field.type, value, field.default);
  if (!Array.isArray(value)) return field.default;
  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const cleaned = {};
      for (const itemField of field.itemFields) {
        cleaned[itemField.key] = cleanScalar(itemField.type, item[itemField.key], "");
      }
      return cleaned;
    });
}

// Coordinates and icons for the map pins stay in code; a place keeps its pin
// and icon while its name matches one of the defaults.
const defaultPlace = (place) => location.distances.find((d) => d.place === place);
const coordsFor = (place) => defaultPlace(place)?.coords ?? null;
const iconFor = (place) => defaultPlace(place)?.icon ?? null;

/*
 * The whole page's content, in exactly the shape app/content.js exports, with
 * the panel's values applied. `panel` is { slug: { key: value } } as the
 * panel's content API returns it, or {} to render the defaults.
 */
export function buildSiteContent(panel = {}) {
  const v = Object.fromEntries(SECTIONS.map(({ slug }) => [slug, sectionValues(slug, panel)]));

  return {
    site: { ...site, ...v.contact },
    nav: v.navigation.items,
    hero: { ...hero, ...v.hero, tags: v.hero.tags.map((t) => t.label).filter(Boolean) },
    stats: v.stats.items,
    intro: { ...intro, ...v.intro },
    project: { ...project, ...v.project },
    collection: { ...collection, ...v.collection, paragraphs: v.collection.paragraphs.map((p) => p.text).filter(Boolean) },
    residences: {
      ...residences,
      ...v.residences,
      // A residence type with no image of its own uses the shared render.
      items: v.residences.items.map((item) => ({ ...item, image: item.image || "/images/residence-bedroom.jpg" })),
    },
    paymentPlan: { ...paymentPlan, ...v.paymentPlan },
    amenities: { ...amenities, ...v.amenities },
    location: {
      ...location,
      ...v.location,
      distances: v.location.distances.map((d) => ({ ...d, coords: coordsFor(d.place), icon: iconFor(d.place) })),
    },
    developers: { ...developers, ...v.developers },
    enquiry: { ...enquiry, ...v.enquiry },
    footer: { ...footer, ...v.footer },
  };
}

/*
 * The manifest the panel builds its editor from (POST /api/v1/manifest).
 * Every field's default is today's copy, so a first push seeds the panel
 * with exactly what the page shows.
 */
export function buildManifest() {
  return { groups: SECTION_GROUPS, sections: SECTIONS };
}
