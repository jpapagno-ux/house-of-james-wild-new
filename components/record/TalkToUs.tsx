import Link from "next/link";
import { CalendarClock, Mail, PenLine, Phone } from "lucide-react";
import { SITE } from "@/lib/site";

// "Talk to the house" — the four ways in, on every stay, camp and reserve,
// in the house voice. Each carries the place's name so the enquiry lands
// already knowing what it's about.
const HOUSE_CALENDLY = "https://calendly.com/jameswildco/meet-your-host"; // placeholder until the live link is set

export default function TalkToUs({ name, planHref }: { name: string; planHref: string }) {
  const subject = encodeURIComponent(`${name}: a question for the house`);
  const ways = [
    { icon: Phone, title: "Call the house", line: "A real person picks up. Ask the awkward questions; they're usually the useful ones.", label: SITE.phone.display, href: `tel:${SITE.phone.tel}`, event: "call_click" },
    { icon: PenLine, title: "Send an enquiry", line: "Two minutes: your dates, your people, your wish list. We come back with options, not a sales pitch.", label: `Enquire about ${name}`, href: planHref, event: "enquire_click", internal: true },
    { icon: CalendarClock, title: "Book thirty minutes", line: "Video or phone, at a time that suits you. Bring the whole family if they have opinions.", label: "Pick a time", href: HOUSE_CALENDLY, event: "book_call_click" },
    ...(SITE.email ? [{ icon: Mail, title: "Write to us", line: "Prefer it in writing? So do we, sometimes. We read every one.", label: SITE.email, href: `mailto:${SITE.email}?subject=${subject}`, event: "email_click" }] : []),
  ];
  return (
    <section id="talk" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-40 border-t ledger-rule pt-10" aria-labelledby="talk-heading">
      <p className="ledger-eyebrow ledger-crimson">Talk to the house</p>
      <h2 id="talk-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Questions About {name}? Good. Ask Them Out Loud.</h2>
      <p className="mt-3 text-[16px] ledger-muted max-w-3xl">Forty-four years on the road taught James that the best trips start with a conversation, not a checkout. Pick whichever way suits you; nobody here will rush you.</p>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ways.map((w) => (
          <li key={w.title} className="border ledger-border bg-paper p-5 flex flex-col">
            <w.icon className="w-5 h-5 ledger-crimson" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="ledger-display text-xl mt-3">{w.title}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed flex-1">{w.line}</p>
            {w.internal
              ? <Link href={w.href} className="mt-4 ledger-btn self-start" data-event={w.event}>{w.label}</Link>
              : <a href={w.href} className="mt-4 ledger-btn-ghost self-start break-all" data-event={w.event}>{w.label}</a>}
          </li>
        ))}
      </ul>
    </section>
  );
}

// The bottom bar on record pages (phones), replacing the global quick bar:
// call, ask by email, and enquire, all about this place.
export function ContactBar({ name, planHref, from }: { name: string; planHref: string; from?: string }) {
  const subject = encodeURIComponent(`${name}: a question for the house`);
  return (
    <div id="record-bar" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur border-t ledger-border pb-[env(safe-area-inset-bottom)]">
      <div className="h-16 px-4 flex items-center gap-2.5">
        <div className="mr-auto leading-tight min-w-0">
          <span className="ledger-eyebrow block !text-[9.5px] truncate">{from ? `From ${from}` : "Ask us anything"}</span>
          <span className="ledger-display text-[1.05rem] truncate block">{name}</span>
        </div>
        <a href={`tel:${SITE.phone.tel}`} aria-label="Call the house" className="w-11 h-11 shrink-0 border ledger-border flex items-center justify-center" data-event="call_click"><Phone className="w-4 h-4" strokeWidth={1.5} /></a>
        {SITE.email && <a href={`mailto:${SITE.email}?subject=${subject}`} aria-label="Email the house" className="w-11 h-11 shrink-0 border ledger-border flex items-center justify-center" data-event="email_click"><Mail className="w-4 h-4" strokeWidth={1.5} /></a>}
        <Link href={planHref} className="ledger-btn ledger-btn--solid !h-11 shrink-0" data-event="enquire_click">Enquire</Link>
      </div>
    </div>
  );
}

// Desktop: a quiet card, bottom right.
export function ContactPill({ name, planHref }: { name: string; planHref: string }) {
  return (
    <div className="hidden lg:flex fixed bottom-6 right-6 z-30 items-center gap-3 bg-paper/95 backdrop-blur border ledger-border shadow-[0_8px_30px_rgba(0,0,0,0.12)] pl-4 pr-2 py-2">
      <span className="text-[13px]"><span className="ledger-eyebrow block !text-[9.5px]">Ask about {name.length > 26 ? "this place" : name}</span><a href={`tel:${SITE.phone.tel}`} className="hover:ledger-crimson" data-event="call_click">{SITE.phone.display}</a></span>
      <Link href={planHref} className="ledger-btn !py-2 !px-3.5" data-event="enquire_click">Enquire</Link>
    </div>
  );
}
