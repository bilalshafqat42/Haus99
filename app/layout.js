import { Inter, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Headlines: Ivy Presto Display Light (licensed face, copied from the Eden House project)
const display = localFont({
  src: "./fonts/IvyPrestoDisplay-Light.otf",
  variable: "--font-display",
  display: "swap",
});

// Body, labels and figures
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// The HAUS 99 wordmark only, until the logo SVG is supplied
const wordmark = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-wordmark",
  display: "swap",
});

/** @type {import("next").Metadata} */
export const metadata = {
  // SITE_URL (e.g. https://haus99.refinedubai.com) makes share images absolute
  metadataBase: new URL(process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000"),
  title: "HAUS 99 | 99 Private Residences in Jumeirah Village Triangle",
  description:
    "Studios to four-bedroom townhouses in Jumeirah Village Triangle, Dubai, from AED 594,000. 30/70 payment plan, handover Q4 2028. Developed by Hausen, powered by Refine.",
  openGraph: {
    type: "website",
    title: "HAUS 99 | A Collection Apart",
    description: "99 private residences in Jumeirah Village Triangle, Dubai. Handover Q4 2028.",
    images: [{ url: "/images/facade-south.jpg" }],
  },
};

/** @type {import("next").Viewport} */
export const viewport = {
  themeColor: "#5b6147",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${wordmark.variable}`}>
      <body>{children}</body>
    </html>
  );
}
