import { EXCEPTIONAL_FEW_LIVE, efEntityId } from "@/lib/content/exceptional-few";
import { EF_CARDS, EF_PATH } from "@/lib/content/exceptional-few-cards";
import { assetFor, mediaUrl } from "@/lib/content/media-assets";
import { STAY_FILMS } from "@/lib/content/stay-films";
import EFEntranceReel, { type EFSlide } from "@/components/home/EFEntranceReel";

// Homepage: the Exceptional Few entrance (James, 16 Nov 2026: "where is the exceptional few big photo and video
// entrance on home"). A full-bleed reel of the designations, newest first, each on its own approved hero photograph
// (Media Assets, role hero) and, where the brand's own film is filed for the stay (lib/content/stay-films.ts, hero),
// that film. Everything is read from the designation and its records; nothing is typed in here.
export default function ExceptionalFewEntrance() {
  const slides: EFSlide[] = [];
  for (const e of [...EXCEPTIONAL_FEW_LIVE].sort((a, b) => b.collectionNumber - a.collectionNumber)) {
    const a = assetFor(efEntityId(e), "hero");
    const card = EF_CARDS.find((c) => c.id === e.id);
    if (!a || !card) continue;
    const f = e.staySlug ? STAY_FILMS[e.staySlug] : undefined;
    const film = f && f.kind === "mp4" && f.hero ? { src: f.src, srcMobile: f.srcMobile, credit: f.credit } : null;
    slides.push({
      id: e.id, no: e.collectionNumber, label: card.label, name: card.name, href: card.href, place: card.place, line: card.line,
      image: { wide: mediaUrl(a, { ratio: "16:10", width: 2400 }), tall: mediaUrl(a, { ratio: "4:5", width: 1100 }), alt: a.alt, credit: a.credit ?? "" },
      film,
    });
  }
  if (!slides.length) return null;
  return <EFEntranceReel slides={slides} total={EF_CARDS.length} allHref={EF_PATH} />;
}
