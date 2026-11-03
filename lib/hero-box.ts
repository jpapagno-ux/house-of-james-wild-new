// A photo hero's height as a floor, not a ceiling (hero arrows fix, 3 Nov 2026). Heroes are given Tailwind height
// classes ("h-[82svh] min-h-[620px]"); a fixed height let a long title, its tagline and the glance bar run up under
// the site header on short or narrow screens. heroBox() turns the fixed height into a min-height (the larger of the
// two when both are given), so the hero grows instead, and keeps every other class as it was.
export function heroBox(height: string): { className: string; style: { minHeight?: string } } {
  let h: string | undefined, min: string | undefined;
  const rest: string[] = [];
  for (const c of height.split(/\s+/).filter(Boolean)) {
    const m = c.match(/^(min-)?h-\[(.+)\]$/);
    if (m && m[1]) min = m[2];
    else if (m) h = m[2];
    else rest.push(c);
  }
  const floor = h && min ? `max(${h}, ${min})` : h ?? min;
  return { className: rest.join(" "), style: floor ? { minHeight: floor.replace(/_/g, " ") } : {} };
}
