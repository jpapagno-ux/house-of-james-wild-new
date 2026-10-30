import { permanentRedirect } from "next/navigation";

// /voyages/<waters> has no page of its own: it sends the traveller to the place guide for
// those waters, which lists every voyage there (navigation audit, 30 Oct 2026).
const TO: Record<string, string> = { "raja-ampat": "/destinations/asia/indonesia/raja-ampat", komodo: "/destinations/asia/indonesia/komodo" };
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(TO).map((waters) => ({ waters })); }
export default async function VoyageWaters({ params }: { params: Promise<{ waters: string }> }) {
  const { waters } = await params;
  permanentRedirect(TO[waters] ?? "/voyages");
}
