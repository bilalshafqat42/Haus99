import Script from "next/script";

/*
 * Google Tag Manager, only when NEXT_PUBLIC_GTM_ID is set (see app/gtm.mjs);
 * otherwise nothing is added to the page. Loaded after the page becomes
 * interactive, so it never delays the first paint. The site has no cookie
 * banner yet: once one is added, render this only after the visitor accepts
 * analytics cookies.
 */
export default function GoogleTagManager({ id }) {
  if (!id) return null;
  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(id)});`}
    </Script>
  );
}
