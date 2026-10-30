// Iggi's mark — the chameleon whose coiled tail holds the house compass.
// Candidate A from the Iggi Candidate Register, chosen by James on 30 Oct 2026
// ("use the compass; we can extract a better image later"). Stroke-only so it
// takes any colour through currentColor: Iggi's green on chat surfaces, a
// Pathway accent on collection pages, espresso on paper. The same paths live
// in the Iggi Core (IggiCompass.jsx); change both or neither.

export default function IggiMark({ size = 40, className = "", title = "Iggi, Field Guide of James Wild & Co", decorative = false }: { size?: number; className?: string; title?: string; decorative?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role={decorative ? undefined : "img"} aria-hidden={decorative ? true : undefined} aria-label={decorative ? undefined : title}>
      <g stroke="currentColor" strokeWidth="23" strokeLinecap="round" strokeLinejoin="round">
        <path d="M354 125 329 92l-22 27c-23-22-54-37-90-37-70 0-126 55-126 125 0 56 34 99 83 120 26 11 47 31 55 55" />
        <path d="M352 125c38 4 66 25 79 53l-27 12 27 17c-15 32-51 52-93 50-29-1-49 10-62 31" />
        <path d="M158 152c-21 26-29 58-20 90 11 37 41 60 78 63" />
        <circle cx="357" cy="169" r="18" />
        <circle cx="357" cy="169" r="4" fill="currentColor" stroke="none" />
        <path d="M379 218c17 0 31-4 42-11" />
        <path d="M191 238c25-19 57-19 82 1" />
        <path d="M276 288c27 31 35 73 17 109-19 39-61 60-103 50-45-10-73-53-63-97 9-40 48-66 88-57 33 7 55 39 47 72-7 26-33 43-59 37-25-6-43-23-43-44" />
      </g>
      <g fill="currentColor">
        <path d="m211 329 9 28-9 28-9-28Z" />
        <path d="m183 357 28-9 28 9-28 9Z" />
      </g>
    </svg>
  );
}
