// FieldIcon — the hand-drawn icons from wildearthstays.com, kept for the
// stay and vessel pages. Each SVG lives once in /public/icons/field and is
// painted with CSS mask, so it takes the text colour (Ledger crimson, a
// setting ink, or white on a photo), costs one cached request, and adds no
// JavaScript. Decorative: always beside a visible heading, so aria-hidden.
//
// Where each one goes (the land / water swap follows the old site):
//   tree-ring     → Rooms & suites (stays) · Cabins (vessels)
//   mountain-sun  → Adventures, on land          wave  → Adventures, on water
//   frond         → Features, on land            coral → Features, on water
//   sun           → Only here

export type FieldIconName = "tree-ring" | "mountain-sun" | "wave" | "frond" | "coral" | "sun";

const RATIO: Record<FieldIconName, number> = {
  "tree-ring": 34 / 36,
  "mountain-sun": 44 / 25,
  wave: 59 / 22,
  frond: 38 / 32,
  coral: 36 / 42,
  sun: 45 / 41,
};

export function FieldIcon({ name, height = 32, className = "" }: { name: FieldIconName; height?: number; className?: string }) {
  const url = `url(/icons/field/${name}.svg)`;
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        height,
        width: Math.round(height * RATIO[name]),
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

// Section icons for a record page, choosing land or water versions.
export function sectionIcon(section: "rooms" | "adventures" | "features" | "only-here", by: "land" | "water"): FieldIconName {
  if (section === "rooms") return "tree-ring";
  if (section === "only-here") return "sun";
  if (section === "adventures") return by === "water" ? "wave" : "mountain-sun";
  return by === "water" ? "coral" : "frond";
}

// HandCta — James's handwritten calls to action ("Request Itinerary",
// "Create your Itinerary", "Schedule a Call"), drawn as artwork. The visible
// words are part of the drawing, so the link carries the same words as real
// text for screen readers and search engines.
const HAND = {
  "request-itinerary": { label: "Request itinerary", ratio: 202 / 48 },
  "create-itinerary": { label: "Create your itinerary", ratio: 274 / 54 },
  "schedule-call": { label: "Schedule a call", ratio: 194 / 49 },
} as const;

export function HandCta({ kind, href, height = 44, className = "" }: { kind: keyof typeof HAND; href: string; height?: number; className?: string }) {
  const h = HAND[kind];
  const url = `url(/icons/field/hand-${kind}.svg)`;
  return (
    <a href={href} className={`group inline-flex ledger-crimson hover:opacity-80 transition-opacity ${className}`}>
      <span className="sr-only">{h.label}</span>
      <span
        aria-hidden="true"
        className="inline-block bg-current group-hover:translate-x-0.5 transition-transform"
        style={{
          height,
          width: Math.round(height * h.ratio),
          WebkitMaskImage: url,
          maskImage: url,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    </a>
  );
}
