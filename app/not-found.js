import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Page not found | HAUS 99" };

export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <div className="not-found-inner">
        <Image src="/brand/monogram.png" alt="" width={44} height={41} className="monogram" />
        <p className="wordmark wordmark-dark">HAUS 99</p>
        <h1 className="display h2">This page could not be found</h1>
        <p className="body">The link may be out of date. Everything about HAUS 99 is on the main page.</p>
        <Link href="/" className="btn btn-dark">
          Back to HAUS 99
        </Link>
      </div>
    </main>
  );
}
