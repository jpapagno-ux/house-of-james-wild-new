import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { isBuilt } from "@/lib/routes";

// A record card in its own pathway's colour (James, 10 Nov 2026, on the yachts under Amandari: "add some of the
// pathway colors and tints and gradients to this and really improve it for more of a stylish design"). The photograph
// carries the name over a deepening wash of the card's accent; the body takes a soft tint of the same accent fading to
// white; the rule, the eyebrow and the arrow share it. The accent is the record's own primary pathway, or the page's
// tone (--tone-path) when it has none. Pathway accents all carry AA on white, so the eyebrow reads in the accent itself.

export type ToneCardProps = { name: string; id?: string; line?: string; image: { url: string; alt: string }; href: string; eyebrow?: string; accent?: string; pathway?: string };

export default function ToneCard({ name, id, line, image, href, eyebrow, accent, pathway }: ToneCardProps) {
  const a = accent ?? "var(--tone-path, #2E2B28)";
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 92vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
        <div aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(to top, color-mix(in srgb, ${a} 72%, #1A1816) 0%, color-mix(in srgb, ${a} 35%, transparent) 34%, transparent 62%)` }} />
        {pathway && <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-white/92 px-2 py-1 text-[10px] tracking-[0.16em] uppercase text-[#2E2B28]"><span aria-hidden="true" className="w-[6px] h-[6px] rounded-full" style={{ background: a }} />{pathway}</span>}
        <h3 className="absolute left-4 right-4 bottom-3 ledger-display text-[1.55rem] leading-tight text-white [text-shadow:0_1px_12px_rgba(0,0,0,.35)]">{name}</h3>
      </div>
      <div className="flex flex-col flex-1 p-4 md:p-5" style={{ background: `linear-gradient(165deg, color-mix(in srgb, ${a} 11%, #FFFFFF) 0%, color-mix(in srgb, ${a} 3%, #FFFFFF) 55%, #FFFFFF 100%)` }}>
        {eyebrow && <p className="text-[11px] tracking-[0.16em] uppercase font-mono leading-relaxed" style={{ color: a }}>{eyebrow}</p>}
        {line && <p className="mt-2 text-[15px] leading-snug text-[#2E2B28]">{line}</p>}
        <p className="mt-auto pt-4 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] tracking-[0.08em] ledger-muted">{id}</span>
          <span aria-hidden="true" className="inline-flex items-center justify-center w-9 h-9 border transition-colors group-hover:text-white" style={{ borderColor: a, color: a, ["--a" as string]: a }}><ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.6} /></span>
        </p>
      </div>
    </>
  );
  const cls = "jw-tone-card group h-full flex flex-col border overflow-hidden transition-shadow duration-300 hover:shadow-[0_14px_30px_-18px_rgba(26,24,22,.55)]";
  const style = { borderColor: `color-mix(in srgb, ${a} 30%, #DCD7D0)`, borderTop: `3px solid ${a}`, ["--a" as string]: a } as React.CSSProperties;
  return isBuilt(href) ? <Link href={href} className={cls} style={style}>{body}</Link> : <article className={cls} style={style}>{body}</article>;
}
