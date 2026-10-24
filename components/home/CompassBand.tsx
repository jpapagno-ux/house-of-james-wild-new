import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, UserRound } from "lucide-react";
import CompassRose from "@/components/ledger/CompassRose";

// Home-page invitation to the James Wild Compass: a teaser, not the tool.
// The four "Where are you drawn?" doors open /compass at that answer.
const DOORS = [
  ["Rainforest & volcanoes", "rainforest"],
  ["Savanna & safari", "safari"],
  ["Reefs & islands", "reef"],
  ["Ice & the poles", "ice"],
] as const;

export default function CompassBand() {
  return (
    <section className="mt-16 md:mt-24 text-paper bg-ink bg-[radial-gradient(90%_80%_at_100%_0%,rgba(34,101,110,0.55),transparent_62%),radial-gradient(70%_60%_at_0%_100%,rgba(139,37,37,0.28),transparent_60%)] -mx-5 md:mx-0 px-5 md:px-12 py-12 md:py-14 relative overflow-hidden" aria-labelledby="compass-band-heading">
      <div className="pointer-events-none absolute inset-3 md:inset-4 border border-coast-light/20" aria-hidden="true" />
      <div className="relative grid lg:grid-cols-[1fr_auto] gap-10 items-center">
        <div>
          <p className="ledger-eyebrow !text-white/70">The James Wild Compass</p>
          <h2 id="compass-band-heading" className="ledger-display text-[2rem] md:text-5xl mt-3 leading-tight">Not Sure Where? <span className="italic">A Few Questions, and the Compass Finds It.</span></h2>
          <p className="mt-4 text-[16px] md:text-[17px] text-white/75 max-w-2xl leading-relaxed">Tell it the kind of place you&rsquo;re drawn to, who&rsquo;s travelling and when. It reads the Ledger, drafts a route, and hands you to a person to finish it.</p>
          <ul className="mt-6 grid sm:grid-cols-3 gap-4 text-[14.5px] text-white/80 max-w-3xl">
            <li className="flex gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-crimson-light" strokeWidth={1.5} aria-hidden="true" />Only places James has vetted</li>
            <li className="flex gap-2"><Lock className="w-4 h-4 mt-0.5 shrink-0 text-crimson-light" strokeWidth={1.5} aria-hidden="true" />One hidden place he doesn&rsquo;t publish</li>
            <li className="flex gap-2"><UserRound className="w-4 h-4 mt-0.5 shrink-0 text-crimson-light" strokeWidth={1.5} aria-hidden="true" />It ends with a person, not a checkout</li>
          </ul>
        </div>
        <CompassRose bearing={320} className="hidden lg:block w-[200px] h-[200px]" />
      </div>
      <div className="relative mt-8">
        <p className="ledger-eyebrow !text-white/60">Where are you drawn?</p>
        <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
          {DOORS.map(([label, id]) => (
            <Link key={id} href={`/compass?drawn=${id}#compass`} className="border border-coast-light/30 hover:border-crimson-light px-4 py-3 ledger-display text-[17px] flex items-center justify-between gap-3">{label}<ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" /></Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <Link href="/compass" className="bg-crimson hover:bg-crimson-deep transition-colors px-6 py-3 text-[12px] uppercase tracking-[0.18em]">Take the Compass</Link>
          <Link href="/plan" className="text-[14px] text-white/80 hover:text-white border-b border-white/30">Or plan with James</Link>
        </div>
      </div>
    </section>
  );
}
