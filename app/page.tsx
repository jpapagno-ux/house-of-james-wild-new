import SiteHeader from "@/components/ledger/SiteHeader";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import OverlandStamp from "@/components/ledger/OverlandStamp";
import { Reveal, StampPress } from "@/components/ledger/Motion";
import { buildMetadata } from "@/lib/seo";
import { VOLUMES } from "@/lib/site";

// Step 2 placeholder home: proves the shell (header, footer, tokens, motion,
// stamp, schema) on a preview. Replaced in step 3 by the approved Base44 home
// page: film hero, quote card, volume doors, Overland routes, film, FAQ.
export const metadata = buildMetadata({
  title: "James Wild & Co | Vetted Safaris, Stays & Voyages",
  description:
    "A founder-led travel house exploring since 1982. Safaris, stays, family residences, small-ship voyages and overland routes, each vetted in person and filed in the Ledger.",
  path: "/",
  noindex: true,
});

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="max-w-ledger mx-auto px-5 md:px-10 pt-14">
        <p className="ledger-eyebrow ledger-crimson">Build step 2 · the shell · not for publication</p>
        <h1 className="ledger-display text-4xl md:text-6xl mt-4 leading-tight max-w-4xl">
          Vetted Safaris, Stays &amp; Voyages — Designed from 44 Years on the Road
        </h1>
        <AnswerBlock>
          James Wild &amp; Co is a founder-led travel house in Miami, shaped by 44 years of exploring since 1982. Its five
          volumes — Stays, Safaris, Gatherings, Voyages and Overland — hold only places and routes vetted in person, each
          filed in the Ledger under a permanent ID.
        </AnswerBlock>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {VOLUMES.map((v, i) => (
            <li key={v.href}>
              <Reveal delay={i * 0.08} className="h-full">
                <a href={v.href} className="relative block h-full overflow-hidden ledger-paper border ledger-border p-5 hover:-translate-y-1 transition-transform">
                  <p className="ledger-eyebrow">Volume {String(i + 1).padStart(2, "0")}</p>
                  <p className="ledger-display text-2xl mt-1">{v.label}</p>
                  <p className="mt-3 text-[15px] ledger-muted">{v.intro}</p>
                  {v.label === "Overland" && (
                    <StampPress className="absolute top-2 right-2 w-16 h-16 rounded-full bg-paper p-1 shadow">
                      <OverlandStamp tested={false} bottom="OVERLAND · ROUTES BY" footer="SINCE 1983" className="w-full h-full" />
                    </StampPress>
                  )}
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
