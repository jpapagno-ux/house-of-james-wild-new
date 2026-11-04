import FilmBand, { type FilmBandProps } from "./FilmBand";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import SafeLink from "@/components/ledger/SafeLink";
import { PlanClose } from "@/components/about/Parts";
import { GUARD_ON, isBuilt } from "@/lib/routes";
import type { NavLink } from "@/lib/site";
import { volumeInk, type VolumeKey } from "@/lib/volumes";
import type React from "react";
import { EFStamp } from "@/components/exceptional-few/EFBadge";
import { efForHref } from "@/lib/content/exceptional-few";

// Hub shells: one frame for the volume and index pages (Stays, Safaris,
// Gatherings, Voyages, Overland, Destinations, Journal). Each shows what's
// filed today and fills from the Ledger export as the volume grows.

export function HubShell({ eyebrow, title, intro, answer, path, name, browse = [], filling, children, closeTitle, trail, film, entrance }: {
  eyebrow: string; title: string; intro: string; answer: string; path: string; name: string; browse?: NavLink[]; filling: string; children: React.ReactNode; closeTitle?: string;
  /** Visible breadcrumb trail. Defaults to Home › name; nested hubs pass the same trail they give the BreadcrumbList schema. */
  trail?: { name: string; path: string }[];
  /** House chrome: a film band under the title (FilmBand props); under a grand entrance it moves below the answer. */
  film?: FilmBandProps;
  /** The page opens with a VolumeEntrance (components/entrance): it holds the page's h1, so the hub's title is
   *  the h2 that opens the volume (#volume, the target of "Open the volume"), and no film band repeats the hero. */
  entrance?: React.ReactNode;
}) {
  const Title = entrance ? "h2" : "h1";
  const chips = browse.filter((b) => !GUARD_ON || isBuilt(b.href));
  return (
    <main id="main" className={`${entrance ? "" : "pt-6 md:pt-10"} pb-20`}>
      {entrance}
      <div className={`max-w-ledger mx-auto px-5 md:px-10 ${entrance ? "pt-8 md:pt-12" : ""}`}>
        <div className="mb-6"><Breadcrumbs trail={trail ?? [{ name: "Home", path: "/" }, { name, path }]} /></div>
        <header id={entrance ? "volume" : undefined} className={`max-w-3xl ${entrance ? "jw-volume-open" : ""}`}>
          <p className="ledger-eyebrow ledger-crimson">{eyebrow}</p>
          <Title className="ledger-h1 mt-3">{title}</Title>
          <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed">{intro}</p>
          {chips.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={`Browse ${name}`}>
              {chips.map((b) => <li key={b.href}><Link href={b.href} className="inline-block border ledger-border px-3 py-1.5 text-[14.5px] hover:border-crimson">{b.label}</Link></li>)}
            </ul>
          )}
        </header>
        {film && !entrance && <FilmBand {...film} />}
        <AnswerBlock>{answer}</AnswerBlock>
        {/* Under an entrance a film band (a still and a link, never autoplay) sits after the answer, so it never repeats the hero. */}
        {film && entrance && <FilmBand {...film} />}
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
export function RecordCard({ name, id, line, image, href, eyebrow, volume }: { name: string; id: string; line: string; image: { url: string; alt: string }; href: string; eyebrow?: string; /** Ink the card by its volume (lib/volumes.ts): a top rule, the eyebrow and the hover border. */ volume?: VolumeKey }) {
  const ink = volume ? volumeInk(volume) : undefined;
  const linked = !GUARD_ON || isBuilt(href);
  const ef = efForHref(href);
  const body = (
    <>
      <div className="relative aspect-[4/3] bg-paper-card overflow-hidden"><Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />{ef && <EFStamp no={ef.collectionNumber} size={104} rotate={-7} onPhoto className="absolute right-2 bottom-2 pointer-events-none" />}</div>
      <div className="p-4 flex flex-col flex-1">
        {eyebrow && <p className={`ledger-eyebrow ${ink ? "" : "ledger-crimson"}`} style={ink ? { color: ink } : undefined}>{eyebrow}</p>}
        <h3 className="ledger-display text-[1.3rem] leading-snug mt-0.5">{name}</h3>
        <p className="mt-1.5 text-[14.5px] ledger-muted leading-snug">{line}</p>
        <p className="mt-auto pt-3 flex items-center justify-between"><span className="font-mono text-[11px] tracking-[0.08em] ledger-muted">{id}</span>{linked && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} aria-hidden="true" />}</p>
      </div>
    </>
  );
  const cls = "group h-full bg-paper border ledger-border flex flex-col";
  const st = ink ? ({ borderTop: `3px solid ${ink}`, ["--card-ink" as string]: ink } as React.CSSProperties) : undefined;
  return linked ? <Link href={href} className={`${cls} ${ink ? "hover:[border-color:var(--card-ink)]" : "hover:border-crimson"}`} style={st}>{body}</Link> : <article className={cls} style={st}>{body}</article>;
}
