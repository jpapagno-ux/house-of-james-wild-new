import cs from "./coming.module.css";
import { GRADIENT, HOUSE } from "@/lib/palette";

// The leather is the Ink to Garnet gradient's two garnet stops; the tip shading is Ink.
const [, , GARNET_DEEP, GARNET] = GRADIENT.stops;

// Ledger corners (James, 2 Nov 2026: "classic ledger books have leather corner pieces ... it should read as craft,
// not grunge"). Two right-angle leather guards, top left and bottom right, in the house oxblood:
// a gradient fill, a soft highlight just inside the hypotenuse, a faint dashed stitch parallel to it, a radial
// darkening at the tip and a fine feTurbulence grain at 5%, all clipped to the triangle. The other two corners get
// the slightest paper wear (a 3% vignette). Absolutely placed, aria-hidden, no pointer events, no layout shift.
// Under prefers-reduced-transparency or forced-colors the guards go flat (coming.module.css). Size comes from the
// --corner custom property set by the caller (28px on cards, 44px on the hero, smaller on phones).
export default function LedgerCorners({ id, wear = false }: { id: string; wear?: boolean }) {
  return (
    <span aria-hidden="true" className={cs.corners}>
      {wear && <span className={cs.wear} />}
      <Guard id={`${id}-tl`} className={cs.cornerTL} />
      <Guard id={`${id}-br`} className={cs.cornerBR} />
    </span>
  );
}

function Guard({ id, className }: { id: string; className: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`${cs.corner} ${className}`} focusable="false">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GARNET} /><stop offset="1" stopColor={GARNET_DEEP} />
        </linearGradient>
        <radialGradient id={`${id}-t`} cx="0" cy="0" r="0.75">
          <stop offset="0" stopColor={HOUSE.ink} stopOpacity="0.38" /><stop offset="1" stopColor={HOUSE.ink} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-n`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <clipPath id={`${id}-c`}><polygon points="0,0 100,0 0,100" /></clipPath>
      </defs>
      <polygon className={cs.cornerShape} points="0,0 100,0 0,100" fill={`url(#${id}-g)`} />
      <g clipPath={`url(#${id}-c)`} className={cs.cornerFx}>
        <rect width="100" height="100" fill={`url(#${id}-t)`} />
        <rect width="100" height="100" filter={`url(#${id}-n)`} opacity="0.05" />
        <line x1="0" y1="94" x2="94" y2="0" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="72" x2="72" y2="0" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}
