import type { ReactNode } from "react";
import { RecordHero } from "@/components/record/Sections";
import type { StayEditorial, StayImage } from "@/lib/stay-page/contract";

// The Stay hero from the contract: one large editorial image, the name, the
// place line ("Franschhoek · South Africa"), the tagline, and whatever
// Ledger marks the page passes through (founder stamp, hero mark, glance).
// No extra overlays; pathway chips are shown further down in the intro.
export default function StayHero({ editorial, slides, stamp, glance, tag }: { editorial: StayEditorial; slides?: StayImage[]; stamp?: ReactNode; glance?: ReactNode; tag?: ReactNode }) {
  const image = editorial.hero ?? slides?.[0];
  if (!image) return null;
  return (
    <RecordHero image={{ url: image.url, alt: image.alt }} slides={slides?.map((s) => ({ url: s.url, alt: s.alt }))} eyebrow={`${editorial.place ?? editorial.country ?? "The Ledger"} · Stay`} title={editorial.name} tagline={editorial.tagline ?? undefined} stamp={stamp} glance={glance} tag={tag} />
  );
}
