import { Inter, Archivo, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import { getSiteUrl } from "./site-url";
import { isStagingSite } from "./staging";
import "./globals.css";

// Headings: Butler (Light for headlines, Medium available for emphasis)
const display = localFont({
  src: [
    { path: "./fonts/Butler-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Butler-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

// Paragraphs: Inter 18pt Light, the exact cut used in the design
const body = localFont({
  src: "./fonts/Inter-18pt-Light.woff2",
  weight: "300",
  variable: "--font-body",
  display: "swap",
});

// Labels, figures and navigation (the heavier Inter weights)
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Calls to action: buttons and text links
const cta = Archivo({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-cta",
  display: "swap",
});

// The HAUS 99 wordmark only, until the logo SVG is supplied
const wordmark = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-wordmark",
  display: "swap",
});

const title = "HAUS 99 | 99 Private Residences in Jumeirah Village Triangle";
const description =
  "Studios to four-bedroom townhouses in Jumeirah Village Triangle, Dubai, from AED 594,000. 30/70 payment plan, handover Q4 2028. Developed by Hausen, powered by Refine.";
const shareImage = { url: "/images/og-share.jpg", width: 1200, height: 630, alt: "HAUS 99, Jumeirah Village Triangle" };

/** @type {import("next").Metadata} */
export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "HAUS 99",
    locale: "en_AE",
    title: "HAUS 99 | A Collection Apart",
    description: "99 private residences in Jumeirah Village Triangle, Dubai. Handover Q4 2028.",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "HAUS 99 | A Collection Apart",
    description: "99 private residences in Jumeirah Village Triangle, Dubai. Handover Q4 2028.",
    images: [shareImage.url],
  },
  ...(isStagingSite() ? { robots: { index: false, follow: false } } : {}),
};

/** @type {import("next").Viewport} */
export const viewport = {
  themeColor: "#5b6147",
};

const fontVars = [display, body, sans, cta, wordmark].map((f) => f.variable).join(" ");

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
