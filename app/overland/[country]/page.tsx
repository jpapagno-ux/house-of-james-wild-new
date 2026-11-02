import { permanentRedirect } from "next/navigation";

// /overland/<country> has no page of its own: it sends the traveller to the country's
// destination page, which lists every route there (navigation audit, 30 Oct 2026).
const TO: Record<string, string> = { "costa-rica": "/destinations/central-america/costa-rica", "south-africa": "/destinations/africa/south-africa", botswana: "/destinations/africa/botswana", mexico: "/destinations/caribbean-mexico/mexico", guatemala: "/destinations/central-america/guatemala", belize: "/destinations/central-america/belize" };
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(TO).map((country) => ({ country })); }
export default async function OverlandCountry({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  permanentRedirect(TO[country] ?? "/overland");
}
