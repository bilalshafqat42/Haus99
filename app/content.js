/*
 * All copy, figures and image paths for the HAUS 99 page, in one place.
 *
 * Images in /public/images are low-resolution stand-ins cut from the Figma
 * export. Replace them with the full-resolution renders, keeping the same
 * file names, or change the paths here.
 *
 * Anything marked "TO CONFIRM" was not in the design and must be checked by
 * Sales before launch.
 */

export const site = {
  name: "HAUS 99",
  phoneLabel: "800 REFINE (733463)",
  phoneHref: "tel:800733463",
  email: "sales@refinedubai.com",
  address: "Dubai, United Arab Emirates",
  // TO CONFIRM: swap for the brochure PDF; until then it opens the register form
  brochureHref: "#register",
  privacyHref: "#", // TO CONFIRM: privacy policy page (required before the form goes live)
  mapsHref: "https://www.google.com/maps/search/?api=1&query=Jumeirah+Village+Triangle+Dubai", // TO CONFIRM: exact plot pin
};

export const nav = [
  { label: "Residences", href: "#residences" },
  { label: "Amenities", href: "#amenities" },
  { label: "Location", href: "#location" },
  { label: "Payment plan", href: "#payment-plan" },
];

export const hero = {
  title: "A Collection Apart",
  text: "Shaped by sweeping glass facades, generous natural light and an intimate architectural character.",
  tags: ["99 Residences", "Jumeirah Village Triangle", "Handover Q4 2028"],
  image: "/images/facade-south.jpg", // TO CONFIRM: the hero render in the design is a different view
};

export const stats = [
  { value: "99", label: "Private residences" },
  { value: "318 – 3,263", label: "Sq ft" },
  { value: "Q4 2028", label: "Completion" },
  { value: "30 / 70", label: "Payment plan" },
  { value: "AED 594,000", label: "Studios from" },
];

export const intro = {
  title: "A refined expression of contemporary living, brought to Jumeirah Village Triangle.",
  text: "Shaped by sweeping glass facades, generous natural light and an intimate architectural character, the design bridges interior spaces with the surrounding green landscape.",
};

export const project = {
  eyebrow: "The project",
  title: "Just 99. Each with more to offer.",
  text: "The adaptable sunroom becomes whatever the year asks of it.",
  footnote: "The sunroom, set five ways",
  // TO CONFIRM: only slide 1's caption is in the design; 2 to 5 describe the stand-in images
  slides: [
    { image: "/images/facade-south.jpg", caption: "A Facade from the South Street" },
    { image: "/images/amenity-pool.jpg", caption: "The Rooftop Pool" },
    { image: "/images/amenity-podium.jpg", caption: "The Landscaped Podium" },
    { image: "/images/amenity-lobby.jpg", caption: "The Double-Height Lobby" },
    { image: "/images/residence-bedroom.jpg", caption: "A Residence Interior" },
  ],
};

export const collection = {
  eyebrow: "The collection",
  title: "Just 99. Each with more to offer.",
  paragraphs: [
    "Meticulously proportioned studios, flexible one and two bedroom apartments, some with adaptable sunrooms, and exclusive multi-bedroom duplexes and townhouses.",
    "Every home is crafted to feel bright, airy and inherently expansive, balancing a bold modern aesthetic with private, relaxed comfort.",
  ],
  linkLabel: "See every residence type",
};

export const residences = {
  eyebrow: "The residences",
  title: "A home for every chapter",
  text: "Studios to four-bedroom townhouses, 318 to 3,263 sq ft, from AED 594,000.",
  // TO CONFIRM: the design shows 9 types but only names three, all with the studio's
  // figures. Types 4 to 9 and every price and size except the studio need Sales sign-off.
  items: [
    { name: "Studio", kind: "Apartment", price: "AED 594,000", size: "318 sq ft" },
    { name: "1 Bedroom", kind: "Apartment", price: "Price on request", size: "Size TBC" },
    { name: "2 Bedroom", kind: "Apartment", price: "Price on request", size: "Size TBC" },
    { name: "1 Bedroom + Sunroom", kind: "Apartment", price: "Price on request", size: "Size TBC" },
    { name: "2 Bedroom + Sunroom", kind: "Apartment", price: "Price on request", size: "Size TBC" },
    { name: "2 Bedroom Duplex", kind: "Duplex", price: "Price on request", size: "Size TBC" },
    { name: "3 Bedroom Duplex", kind: "Duplex", price: "Price on request", size: "Size TBC" },
    { name: "3 Bedroom", kind: "Townhouse", price: "Price on request", size: "Size TBC" },
    { name: "4 Bedroom", kind: "Townhouse", price: "Price on request", size: "3,263 sq ft" },
  ].map((item) => ({ ...item, image: "/images/residence-bedroom.jpg" })),
};

export const paymentPlan = {
  eyebrow: "Payment plan",
  title: "30 / 70",
  text: "30% during construction, 70% on handover. Completion is scheduled for the fourth quarter of 2028.",
  steps: [
    { label: "On booking", value: "5% + DLD" },
    { label: "After 1 month from booking", value: "5%" },
    { label: "After 2 months from booking", value: "5%" },
    { label: "After 3 months from booking", value: "5%" },
    { label: "After 7 months from booking", value: "5%" },
    { label: "After 11 months from booking", value: "5%" },
    { label: "On completion, Q4 2028", value: "70%" },
  ],
};

export const amenities = {
  eyebrow: "Amenities",
  title: "An Invitation to Enjoy More",
  text: "Spanning two thoughtfully curated levels, the amenity collection extends your living space into an effortless world of leisure, wellness and quiet connection.",
  footnote: "Basement 1 and 2: resident and visitor parking.",
  // TO CONFIRM: the design counts five amenities but only three are visible
  items: [
    { title: "Infinity Pool", text: "A rooftop pool and sun deck with the skyline beyond.", image: "/images/amenity-pool.jpg" },
    { title: "Landscaped Podium", text: "Gardens, a yoga deck and a sunken fire pit lounge.", image: "/images/amenity-podium.jpg" },
    { title: "Double-Height Lobby", text: "An attended arrival with direct lift access.", image: "/images/amenity-lobby.jpg" },
  ],
};

export const location = {
  eyebrow: "The location",
  title: "The city within reach",
  text: "Jumeirah Village Triangle, minutes from Al Khail Road and Sheikh Mohammed Bin Zayed Road.",
  distances: [
    { place: "Al Khail Road", time: "2 min" },
    { place: "Skylight Mall", time: "5 min" },
    { place: "Dubai Marina", time: "15 min" },
    { place: "Palm Jumeirah", time: "15 min" },
    { place: "Mall of the Emirates", time: "18 min" },
    { place: "Burj Khalifa", time: "22 min" },
  ],
};

export const developers = {
  eyebrow: "The developers",
  title: "Vision, and the discipline to deliver it",
  refine:
    "Delivered as Refine's turnkey project, HAUS 99 reflects a commitment to execution excellence under a single platform. Refine is a UAE-based development management company overseeing the entire real estate lifecycle, from land acquisition and feasibility through construction oversight, sales and post-handover administration.",
  hausen:
    "A boutique developer of residential and commercial addresses defined by architectural integrity and timeless design. Established in 2009 and backed by an alliance of seven private companies across Georgia, Romania and Dubai, Hausen pairs development with construction, engineering and logistics.",
};

export const enquiry = {
  eyebrow: "Register your interest",
  title: "Speak to the HAUS 99 sales team",
  text: "Leave your details and we will call you back with availability, the full price list and the floor-plan set.",
};

export const footer = {
  blurb: "A collection of 99 private residences in Jumeirah Village Triangle, Dubai.",
  explore: [
    { label: "The collection", href: "#collection" },
    { label: "Residences", href: "#residences" },
    { label: "Amenities", href: "#amenities" },
    { label: "Location", href: "#location" },
    { label: "Payment", href: "#payment-plan" },
  ],
  // TO CONFIRM: these pages do not exist yet
  legal: [
    { label: "Privacy policy", href: "#" },
    { label: "Terms of use", href: "#" },
    { label: "Cookie notice", href: "#" },
  ],
  copyright: "© 2026 Refine and Hausen Developments",
  regulatory: "RERA / DLD registration details to be confirmed",
};
