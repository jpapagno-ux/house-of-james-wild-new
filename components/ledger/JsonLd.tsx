// Server-rendered JSON-LD. The data is our own Ledger content, serialised
// with "<" escaped so a stray tag in a record can never break out of the script.
export default function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
