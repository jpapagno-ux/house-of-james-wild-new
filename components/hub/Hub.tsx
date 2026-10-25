import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import SafeLink from "@/components/ledger/SafeLink";
import { PlanClose } from "@/components/about/Parts";
import { GUARD_ON, isBuilt } from "@/lib/routes";
import type { NavLink } from "@/lib/site";

// Hub shells: one frame for the volume and index pages (Stays, Safaris,
// Gatherings, Voyages, Overland, Destinations, Journal). Each shows what's
// filed today and fills from the Ledger export as the volume grows.

export function HubShell({ eyebrow, title, intro, answer, path, name, browse = [], filling, children, closeTitle }: {
  eyebrow: string; title: string; intro: string; answer: string; path: string; name: string; browse?: NavLink[]; filling: string; children: React.ReactNode; closeTitle?: string;
}) {
  const chips = browse.filter((b) => !GUARD_ON || isBuilt(b.href));
  return (
    <main id="main" className="pt-6 md:pt-10 pb-20">
      <div className="max-w-ledger mx-auto px-5 md:px-10">
        <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name, path }]} /></div>
        <header className="max-w-3xl">
          <p className="ledger-eyebrow ledger-crimson">{eyebrow}</p>
          <h1 className="ledger-display text-[2.3rem] leading-[1.1] md:text-[3.3rem] mt-3">{title}</h1>
          <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed">{intro}</p>
          {chips.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={`Browse ${name}`}>
              {chips.map((b) => <li key={b.href}><Link href={b.href} className="inline-block border ledger-border px-3 py-1.5 text-[14.5px] hover:border-crimson">{b.label}</Link></li>)}
            </ul>
          )}
        </header>
        <AnswerBlock>{answer}</AnswerBlock>
        {children}
        <p className="mt-12 border-l-2 border-coast pl-4 text-[15px] ledger-muted max-w-2xl"><span className="ledger-eyebrow !text-coast-deep block mb-1">Filling from the Ledger</span>{filling}</p>
        <PlanClose title={closeTitle} />
      </div>
    </main>
  );
}

export function HubSection({ eyebrow, title, id, children, more }: { eyebrow: string; title: string; id: string; children: React.ReactNode; more?: NavLink }) {
  return (
    <section className="mt-12 md:mt-16 border-t ledger-rule pt-8" aria-labelledby={id}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div><p className="ledger-eyebrow ledger-crimson">{eyebrow}</p><h2 id={id} className="ledger-display text-[1.75rem] md:text-4xl mt-2">{title}</h2></div>
        {more && <SafeLink href={more.href} className="ledger-btn-ghost self-start md:self-auto">{more.label}</SafeLink>}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

// A Ledger record card. Links only when the record's page is built (or in
// previews); otherwise it's a plain card, so production never 404s.
export function RecordCard({ name, id, line, image, href, eyebrow }: { name: string; id: string; line: string; image: { url: string; alt: string }; href: string; eyebrow?: string }) {
  const linked = !GUARD_ON || isBuilt(href);
  const body = (
    <>
      <div className="relative aspect-[4/3] bg-paper-card overflow-hidden"><Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" /></div>
      <div className="p-4 flex flex-col flex-1">
        {eyebrow && <p className="ledger-eyebrow ledger-crimson">{eyebrow}</p>}
        <h3 className="ledger-display text-[1.3rem] leading-snug mt-0.5">{name}</h3>
        <p className="mt-1.5 text-[14.5px] ledger-muted leading-snug">{line}</p>
        <p className="mt-auto pt-3 flex items-center justify-between"><span className="font-mono text-[11px] tracking-[0.08em] ledger-muted">{id}</span>{linked && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} aria-hidden="true" />}</p>
      </div>
    </>
  );
  const cls = "group h-full bg-paper border ledger-border flex flex-col";
  return linked ? <Link href={href} className={`${cls} hover:border-crimson`}>{body}</Link> : <article className={cls}>{body}</article>;
}
