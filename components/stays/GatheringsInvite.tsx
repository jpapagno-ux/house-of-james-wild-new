// "Need more than a room?" invite to the stay's house page on the Wild & Co
// Gatherings site, for families, groups and celebrations. Volume III colours.
import { GATHERINGS_LINKS, GATHERINGS_SITE } from "@/lib/content/gatherings-links";

export default function GatheringsInvite({ slug, name }: { slug: string; name: string }) {
  const g = GATHERINGS_LINKS[slug];
  if (!g) return null;
  return (
    <aside className="theme-vol-gatherings mt-14 md:mt-20 ledger-card border-t-[3px] p-6 md:p-8" style={{ borderColor: "#651D22" }} aria-label={`${name} on Wild & Co Gatherings`}>
      <p className="ledger-eyebrow ledger-crimson">Families, groups &amp; celebrations · Wild &amp; Co Gatherings · {g.entry}</p>
      <h2 className="ledger-display text-2xl md:text-3xl mt-2">Need more than a room?</h2>
      <p className="mt-3 text-[15px] leading-relaxed max-w-2xl">{g.line} Our Gatherings team plans the whole house, the group and the days around it.</p>
      <a href={`${GATHERINGS_SITE}${g.path}`} className="ledger-btn mt-5 inline-block">See the Gatherings house page</a>
    </aside>
  );
}
