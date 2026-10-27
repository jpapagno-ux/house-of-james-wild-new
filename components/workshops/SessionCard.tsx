import Image from "next/image";
import Link from "next/link";
import type { Session } from "@/lib/content/workshops";

// One House Session: date and length, the title, who's speaking, what it's
// about (linked to the stay, ship or route), then reserve or watch.
export const sessionDate = (s: Session) => s.start ? new Date(s.start).toLocaleString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" }) : "Date to be posted";

export default function SessionCard({ s, compact = false }: { s: Session; compact?: boolean }) {
  const past = s.start ? Date.parse(s.start) < Date.now() : false;
  const action = past || !s.registerUrl ? (s.recordingUrl ? { label: "Watch the recording", href: s.recordingUrl } : null) : { label: "Reserve a seat", href: s.registerUrl };
  return (
    <article className="border ledger-border bg-paper flex flex-col h-full">
      {!compact && <div className="relative aspect-[16/10] overflow-hidden"><Image src={s.image.url} alt={s.image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /></div>}
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <p className="ledger-eyebrow ledger-crimson">{sessionDate(s)} · {s.duration}</p>
        <h3 className="ledger-display text-[1.3rem] leading-snug mt-2">{s.title}</h3>
        {s.hosts.length > 0 && <p className="mt-1 text-[14px] ledger-muted">With {s.hosts.join(", ")}</p>}
        <p className="mt-3 text-[15px] leading-relaxed ledger-muted flex-1">{s.description}</p>
        {s.about.length > 0 && (
          <p className="mt-4 text-[14px]"><span className="ledger-eyebrow mr-2">About</span>{s.about.map((a, i) => <span key={a.href}>{i > 0 && " · "}<Link href={a.href} className="underline underline-offset-4 decoration-crimson/40 hover:decoration-crimson">{a.name}</Link></span>)}</p>
        )}
        {action && <a href={action.href} target="_blank" rel="noopener" className="mt-5 self-start ledger-btn">{action.label}</a>}
      </div>
    </article>
  );
}

/** The cross-link back: on a stay, ship or voyage page, the sessions about it. Renders nothing until one exists. */
export function SessionsFor({ sessions, name }: { sessions: Session[]; name: string }) {
  if (!sessions.length) return null;
  return (
    <section aria-labelledby="sessions-for-h" className="mt-16 border-t ledger-rule pt-8">
      <p className="ledger-eyebrow ledger-crimson">House Sessions</p>
      <h2 id="sessions-for-h" className="ledger-display text-2xl md:text-3xl mt-2">{name}, Live</h2>
      <p className="mt-2 text-[15px] ledger-muted max-w-2xl">A live workshop about {name}. Ask the people who run it, or watch the recording.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-5">{sessions.map((s) => <SessionCard key={s.slug} s={s} compact />)}</div>
      <p className="mt-4"><Link href="/workshops" className="ledger-btn-ghost">All House Sessions →</Link></p>
    </section>
  );
}
