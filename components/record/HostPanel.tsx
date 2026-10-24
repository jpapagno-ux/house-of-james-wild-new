import Image from "next/image";
import Link from "next/link";
import { CalendarClock, MessageCircle } from "lucide-react";

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
          The team at {stayName} isn&rsquo;t taking calls through us yet. James and the house know it first-hand and will answer your questions about the rooms, the days and the dates.
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

  return (
    <section id="host" className="scroll-mt-32" aria-labelledby="host-heading">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-start">
        <div>
          <p className="ledger-eyebrow ledger-crimson">Meet your host</p>
          <h2 id="host-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2 leading-tight">Connections matter.</h2>
          <div className="mt-7 flex items-center gap-5">
            <div className="relative">
              <Portrait host={host} />
              {host.metInPerson && (
                <span className="absolute -bottom-2 -right-3 w-14 h-14 rounded-full border-2 border-crimson ledger-crimson bg-paper flex flex-col items-center justify-center rotate-[-12deg] text-center leading-none">
                  <span className="text-[7px] tracking-[0.14em] uppercase">Met by</span>
                  <span className="ledger-hand text-[15px]">J.W.</span>
                  <span className="text-[7px] tracking-[0.14em]">{host.metInPerson}</span>
                </span>
              )}
            </div>
            <div>
              <p className="ledger-display text-2xl leading-tight">{host.name}</p>
              <p className="ledger-eyebrow ledger-crimson mt-1">{host.role}</p>
            </div>
          </div>
          {host.bio && <p className="mt-6 text-[16px] leading-relaxed">{host.bio}</p>}
          <p className="mt-4 text-[16px] leading-relaxed ledger-muted">
            A live conversation with your host and a member of the James Wild &amp; Co team, at a time that suits you. No obligation to book.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a href={host.calendlyUrl} className="ledger-btn inline-flex items-center gap-2 !bg-crimson !text-paper hover:!bg-ink hover:!border-ink" data-event="host_call_click" data-host-state="available">
              <CalendarClock className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Book a time with {host.name.split(" ")[0]}
            </a>
            <span className="text-[13px] ledger-muted">Opens Calendly · 30 minutes · video or phone</span>
          </div>
        </div>
        <div className="ledger-paper border ledger-border p-6 md:p-7">
          <p className="ledger-eyebrow flex items-center gap-2"><MessageCircle className="w-3.5 h-3.5 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /> The conversation can cover</p>
          <ul className="mt-4 space-y-3">
            {host.topics.map((t) => (
              <li key={t} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="ledger-crimson select-none" aria-hidden="true">·</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
