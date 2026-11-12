import Image from "next/image";
import Header from "./components/Header";
import Carousel from "./components/Carousel";
import EnquiryForm from "./components/EnquiryForm";
import LocationExplorer from "./components/LocationExplorer";
import { getSiteUrl } from "./site-url";
import { getSiteContent } from "./panel/content-api";

const pad = (n) => String(n).padStart(2, "0");

/*
 * Structured data for search engines, using only facts already on the page.
 * Prices are left out until Sales confirms the full price list.
 */
function StructuredData({ site, intro }) {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${url}/#website`, url, name: site.name, inLanguage: "en" },
      {
        "@type": "ApartmentComplex",
        "@id": `${url}/#residence`,
        name: site.name,
        url,
        description: intro.text,
        image: `${url}/images/og-share.jpg`,
        numberOfAccommodationUnits: 99,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Jumeirah Village Triangle",
          addressRegion: "Dubai",
          addressCountry: "AE",
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function Monogram({ className = "" }) {
  return <Image src="/brand/monogram.png" alt="" width={44} height={41} className={`monogram ${className}`} />;
}

function RefineLogo({ tone = "dark", width = 200 }) {
  return (
    <Image src={`/brand/refine-${tone}.svg`} alt="Refine, Shaping Tomorrow" width={width} height={Math.round(width * 0.324)} />
  );
}

function HausenLogo({ tone = "dark", width = 130 }) {
  return (
    <Image src={`/brand/hausen-${tone}.png`} alt="Hausen Developments" width={width} height={Math.round(width * 0.594)} />
  );
}

export default async function Home() {
  // The copy in app/content.js, with any edits from the Refine Admin panel.
  const {
    site,
    nav,
    hero,
    stats,
    intro,
    project,
    collection,
    residences,
    paymentPlan,
    amenities,
    location,
    developers,
    enquiry,
    footer,
  } = await getSiteContent();

  return (
    <>
      <StructuredData site={site} intro={intro} />
      <Header nav={nav} />
      <main id="main" tabIndex={-1}>
        {/* Hero */}
        <section className="frame hero">
          <Image src={hero.image} alt="HAUS 99 exterior at dusk" fill preload sizes="100vw" className="hero-image" />
          <div className="hero-shade" aria-hidden="true" />
          <div className="container hero-content">
            <h1 className="display hero-title">{hero.title}</h1>
            <p className="hero-text">{hero.text}</p>
            <ul className="hero-tags">
              {hero.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="hero-actions">
              <a href="#register" className="btn btn-gold">
                Register interest
              </a>
              <a href={site.brochureHref} className="btn btn-outline">
                Download brochure
              </a>
            </div>
            <div className="hero-developer">
              <HausenLogo tone="white" width={156} />
            </div>
          </div>
        </section>

        {/* Key figures */}
        <section className="frame stats" aria-label="Key figures">
          <dl className="container container-wide stats-grid">
            {stats.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Intro */}
        <section className="intro">
          <div className="container container-text">
            <Monogram />
            <h2 className="display intro-title">{intro.title}</h2>
            <p className="lede">{intro.text}</p>
          </div>
        </section>

        {/* The project */}
        <section className="frame tint project" id="project">
          <div className="container section-head">
            <p className="eyebrow">{project.eyebrow}</p>
            <h2 className="display h2">{project.title}</h2>
            <p className="body">{project.text}</p>
          </div>
          <Carousel label="Project renders" className="carousel-wide" footnote={project.footnote}>
            {project.slides.map((s, i) => (
              <figure key={s.caption} className="render">
                <Image src={s.image} alt={s.caption} fill sizes="(max-width: 960px) 90vw, 80vw" />
                <figcaption>
                  <span>{pad(i + 1)}</span>
                  {s.caption}
                </figcaption>
              </figure>
            ))}
          </Carousel>
        </section>

        {/* The collection */}
        <section className="collection" id="collection">
          <div className="container split">
            <div>
              <p className="eyebrow">{collection.eyebrow}</p>
              <h2 className="display h2">{collection.title}</h2>
            </div>
            <div className="body-stack">
              {collection.paragraphs.map((p) => (
                <p key={p.slice(0, 20)} className="body">
                  {p}
                </p>
              ))}
              <a href="#residences" className="text-link">
                {collection.linkLabel}
              </a>
            </div>
          </div>
        </section>

        {/* Residences */}
        <section className="frame tint residences" id="residences">
          <Carousel
            label="Residence types"
            className="carousel-cards"
            controls="top"
            progress
            head={
              <div className="section-head section-head-flush">
                <p className="eyebrow">{residences.eyebrow}</p>
                <h2 className="display h2">{residences.title}</h2>
                <p className="body">{residences.text}</p>
              </div>
            }
          >
            {residences.items.map((r, i) => (
              <article key={r.name} className="residence-card">
                <Image src={r.image} alt="" fill sizes="(max-width: 640px) 80vw, 380px" />
                <div className="residence-card-top">
                  <span>{pad(i + 1)}</span>
                  <span>{r.kind}</span>
                </div>
                <h3 className="display">{r.name}</h3>
                <div className="residence-card-foot">
                  <span>{r.price}</span>
                  <span>{r.size}</span>
                </div>
              </article>
            ))}
          </Carousel>
        </section>

        {/* Payment plan */}
        <section className="payment" id="payment-plan">
          <div className="container container-wide split">
            <div>
              <p className="eyebrow eyebrow-rule">{paymentPlan.eyebrow}</p>
              <p className="display payment-figure">{paymentPlan.title}</p>
              <p className="body payment-text">{paymentPlan.text}</p>
              <a href="#register" className="btn btn-green">
                Speak to sales
              </a>
            </div>
            <ol className="payment-steps">
              {paymentPlan.steps.map((s, i) => (
                <li key={s.label}>
                  <span className="payment-num">{pad(i + 1)}</span>
                  <span className="payment-label">{s.label}</span>
                  <span className="payment-value">{s.value}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Amenities */}
        <section className="frame tint amenities" id="amenities">
          <div className="container section-head">
            <Monogram />
            <p className="eyebrow">{amenities.eyebrow}</p>
            <h2 className="display h2">{amenities.title}</h2>
            <p className="body">{amenities.text}</p>
          </div>
          <Carousel
            label="Amenities"
            className="carousel-amenities"
            controls="top"
            progress
            footnote={amenities.footnote}
          >
            {amenities.items.map((a, i) => (
              <article key={a.title} className="amenity">
                <div className="amenity-image">
                  <Image src={a.image} alt={a.title} fill sizes="(max-width: 640px) 80vw, 460px" />
                </div>
                <h3 className="display">
                  <span>{pad(i + 1)}</span>
                  {a.title}
                </h3>
                <p>{a.text}</p>
              </article>
            ))}
          </Carousel>
        </section>

        {/* Location */}
        <LocationExplorer />

        {/* Developers */}
        <section className="frame paper developers">
          <div className="container">
            <div className="developers-head">
              <p className="eyebrow">{developers.eyebrow}</p>
              <h2 className="display h2">{developers.title}</h2>
            </div>
            <div className="developers-grid">
              <div>
                <p className="eyebrow">Powered by</p>
                <div className="developer-logo">
                  <RefineLogo width={200} />
                </div>
                <p className="body">{developers.refine}</p>
              </div>
              <div>
                <p className="eyebrow">Developed by</p>
                <div className="developer-logo">
                  <HausenLogo width={130} />
                </div>
                <p className="body">{developers.hausen}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Register interest */}
        <section className="frame register" id="register">
          <div className="container register-inner">
            <p className="eyebrow eyebrow-light">{enquiry.eyebrow}</p>
            <h2 className="display h2">{enquiry.title}</h2>
            <p className="register-text">{enquiry.text}</p>
            <EnquiryForm site={site} />
            <p className="register-contact">
              <a href={site.phoneHref}>{site.phoneLabel}</a>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </div>
        </section>
      </main>

      <footer className="frame paper footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <p className="wordmark wordmark-dark">HAUS 99</p>
              <p className="footer-blurb">{footer.blurb}</p>
            </div>
            <nav aria-label="Explore">
              <p className="eyebrow">Explore</p>
              <ul>
                {footer.explore.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <p className="eyebrow">Contact</p>
              <ul>
                <li>
                  <a href={site.phoneHref}>{site.phoneLabel}</a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
                <li>{site.address}</li>
              </ul>
            </div>
            <nav aria-label="Legal">
              <p className="eyebrow">Legal</p>
              <ul>
                {footer.legal.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="footer-partners">
            <span>Developed by</span>
            <HausenLogo width={74} />
            <span>Powered by</span>
            <RefineLogo width={122} />
          </div>

          <div className="footer-bottom">
            <p>{footer.copyright}</p>
            <p>{footer.regulatory}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
