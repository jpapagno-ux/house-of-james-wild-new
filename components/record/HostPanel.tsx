import Image from "next/image";
import Link from "next/link";
import { CalendarClock, ListChecks, Users } from "lucide-react";
import TimeBridge from "./TimeBridge";
import Signature from "./Signature";

// HostPanel — "Meet Your Host" on every record page (stay, camp, ship,
// residence, reserve). Its state comes from the record's host_connect switch
// in the Ledger, never guessed:
//   available    → the host, their headshot, the conversation topics and a
//                  Calendly button (host_call_click is tracked)
//   not_linking  → the partner hasn't approved host calls: the house offers
//                  its own conversation instead (house Calendly)
//   off          → no panel; the page keeps its Plan with James action
// The host mark (met in person + year) shows only from the Person record's
// met_in_person field. Email and phone are private and never rendered.

export type HostConnect = "available" | "not_linking" | "off";
export type Host = {
  name: string;
  role: string;
  photo?: string | null;
  bio?: string;
  topics: string[];
  calendlyUrl: string;
  metInPerson?: number | null;
  /** Group connect: the host's IANA time zone, the place name and zone label shown to travellers. */
  tz?: string;
  place?: string;
  zoneLabel?: string;
  /** Up to this many travellers on the call (family or group). */
  seats?: number;
  /** True while the host details are a sample awaiting the partner's sign-off. */
  sample?: boolean;
};

// Placeholder from the Base44 sample until the live house link is set.
const HOUSE_CALENDLY = "https://calendly.com/jameswildco/meet-your-host";

function Portrait({ host, size = 112 }: { host: Pick<Host, "name" | "role" | "photo">; size?: number }) {
  const initials = host.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2);
  return host.photo ? (
    <Image src={host.photo} alt={`${host.name}, ${host.role}`} width={size} height={size} className="rounded-full object-cover shrink-0 border-2 border-paper shadow" />
  ) : (
    <span style={{ width: size, height: size }} className="rounded-full shrink-0 border ledger-rule bg-paper-card flex items-center justify-center" aria-hidden="true">
      <span className="ledger-display text-4xl ledger-muted">{initials}</span>
    </span>
  );
}

export default function HostPanel({ state, host, stayName }: { state: HostConnect; host?: Host; stayName: string }) {
  if (state === "off") return null;

  if (state === "not_linking" || !host) {
    return (
      <section id="host" className="scroll-mt-32 ledger-paper border ledger-border p-6 md:p-8" aria-labelledby="host-heading">
        <p className="ledger-eyebrow ledger-crimson">Meet your host</p>
        <h2 id="host-heading" className="ledger-display text-2xl md:text-3xl mt-2">Speak with the house instead.</h2>
        <p className="mt-4 text-[16px] leading-relaxed max-w-2xl">
          The team at {stayName} isn&rsquo;t taking calls through us yet, so the house takes the call instead: rooms, the shape of the days, the dates that work and the ones that don&rsquo;t. Bring your questions; we&rsquo;ll bring straight answers.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a href={HOUSE_CALENDLY} className="ledger-btn inline-flex items-center gap-2" data-event="host_call_click" data-host-state="not_linking">
            <CalendarClock className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Book a time with the house
          </a>
          <Link href="/plan" className="text-[15px] underline underline-offset-4">Or plan with James</Link>
        </div>
      </section>
    );
  }

  const seats = host.seats ?? 6;
  return (
    <section id="host" className="scroll-mt-32" aria-labelledby="host-heading">
      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start">
        <div>
          <p className="ledger-eyebrow ledger-crimson">Group connect · live with the host</p>
          <h2 id="host-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2 leading-tight text-balance">Meet the people before you send the money.</h2>
          <blockquote className="mt-5 border-l-2 border-crimson pl-4">
            <p className="ledger-display italic text-[1.1rem] md:text-[1.25rem] leading-relaxed">&ldquo;One call with the people who&rsquo;ll actually look after you beats three weeks of emails. It takes a little extra effort to set up. That&rsquo;s exactly why it works.&rdquo;</p>
            <footer className="mt-2 flex items-center gap-3 text-[13px] ledger-muted"><Signature className="w-14" /> James Wild</footer>
          </blockquote>
          <div className="mt-7 flex items-center gap-5">
            <div className="relative">
              <Portrait host={host} size={96} />
              {host.metInPerson && (
                <span className="absolute -bottom-2 -right-3 w-14 h-14 rounded-full border-2 border-crimson ledger-crimson bg-paper flex flex-col items-center justify-center rotate-[-12deg] text-center leading-none">
                  <span className="text-[7px] tracking-[0.14em] uppercase">Met by</span>
                  <span className="ledger-hand text-[15px]">J.W.</span>
                  <span className="text-[7px] tracking-[0.14em]">{host.metInPerson}</span>
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="ledger-display text-xl md:text-2xl leading-tight">{host.name}</p>
              <p className="ledger-eyebrow ledger-crimson mt-1">{host.role}</p>
              {host.sample && <p className="mt-1 text-[12px] ledger-muted">Sample host card · names confirmed by the property before going live</p>}
            </div>
          </div>
          {host.bio && <p className="mt-5 text-[16px] leading-relaxed">{host.bio}</p>}
          <div className="mt-6">
            <p className="ledger-eyebrow flex items-center gap-2"><Users className="w-3.5 h-3.5 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /> Who&rsquo;s on the call</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3 text-[14px]">
              <span className="flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-crimson text-paper flex items-center justify-center text-[11px]" aria-hidden="true">H</span>Your host</span>
              <span className="flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-ink text-paper flex items-center justify-center ledger-display text-[11px]" aria-hidden="true">JW</span>A James Wild &amp; Co advisor</span>
              <span className="flex items-center gap-2"><span className="flex -space-x-1.5" aria-hidden="true">{Array.from({ length: seats }, (_, i) => <span key={i} className="w-5 h-5 rounded-full border border-ink/40 bg-paper" />)}</span>Up to {seats} of you</span>
            </div>
            <p className="mt-2 text-[13px] ledger-muted">Families and groups: bring whoever has a say, or a veto. Everyone hears the same answers at once.</p>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a href={host.calendlyUrl} className="ledger-btn inline-flex items-center gap-2 !bg-crimson !text-paper hover:!bg-ink hover:!border-ink" data-event="host_call_click" data-host-state="available" data-call="group">
              <CalendarClock className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Book the group call
            </a>
            <span className="text-[13px] ledger-muted">Calendly · 30–45 minutes · video · no obligation to book</span>
          </div>
        </div>
        <div className="ledger-paper border ledger-border p-6 md:p-7">
          <p className="ledger-eyebrow flex items-center gap-2"><ListChecks className="w-3.5 h-3.5 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /> Start with the facts</p>
          <p className="mt-2 text-[14px] ledger-muted">What one call usually settles, in this order:</p>
          <ol className="mt-4 space-y-3">
            {host.topics.map((t, i) => (
              <li key={t} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="font-mono text-[11px] ledger-crimson tabular-nums pt-1 w-5 shrink-0" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[14px] leading-relaxed"><span className="ledger-display italic">Then the people.</span> <span className="ledger-muted">You&rsquo;ll know within ten minutes whether this is your place. That&rsquo;s the whole point.</span></p>
          {host.tz && <TimeBridge tz={host.tz} place={host.place ?? stayName} zoneLabel={host.zoneLabel ?? host.tz} />}
        </div>
      </div>
    </section>
  );
}
