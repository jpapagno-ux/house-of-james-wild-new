import Image from "next/image";
import Link from "next/link";
import type { AdvisorStory } from "@/lib/content/advisors";

// Photo stories from an advisor's own journeys: their photos, the facts they stated, and (James, 18 Nov 2026) the
// hare watercolours of that trip, which appear only here, beside the story, and on the ship page of a voyage they sailed.
export default function AdvisorStories({ firstName, stories }: { firstName: string; stories: AdvisorStory[] }) {
  if (!stories.length) return null;
  return (
    <section className="mt-16 md:mt-20 border-t ledger-rule pt-8" aria-labelledby="stories-heading">
      <p className="ledger-eyebrow ledger-crimson">Photo stories</p>
      <h2 id="stories-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Where {firstName} Has Been</h2>
      {stories.map((s) => (
        <article key={s.id} className="mt-8">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="ledger-display text-[1.5rem] md:text-[1.75rem]">{s.title}</h3>
            <p className="ledger-eyebrow">{s.place} · {s.when}{s.ledgerIds.length ? <span className="ledger-id"> · {s.ledgerIds.join(" · ")}</span> : null}</p>
          </div>
          <p className="mt-2 text-[16px] ledger-muted max-w-2xl">{s.line}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-[1.6fr_1fr]">
            {s.photos.map((ph) => (
              <figure key={ph.url}>
                <div className="relative bg-paper-card overflow-hidden" style={{ aspectRatio: `${ph.w} / ${ph.h}` }}>
                  <Image src={ph.url} alt={ph.alt} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
                </div>
                <figcaption className="mt-2 text-[12.5px] ledger-muted">{ph.credit}</figcaption>
              </figure>
            ))}
          </div>
          {s.plates && s.plates.length > 0 && (
            <div className="mt-6">
              <p className="ledger-eyebrow">From the sketchbook</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {s.plates.map((pl) => (
                  <figure key={pl.url} className="bg-white border ledger-border p-3">
                    <div className="relative aspect-[4/3] overflow-hidden"><Image src={pl.url} alt={pl.alt} fill sizes="(min-width: 640px) 45vw, 100vw" className="object-contain" /></div>
                    <figcaption className="mt-2 text-[12.5px] ledger-muted">Watercolour, James Wild &amp; Co</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
          {s.journalSlug && <p className="mt-4"><Link href={`/journal/${s.journalSlug}`} className="ledger-btn">Read the full story</Link></p>}
        </article>
      ))}
    </section>
  );
}
