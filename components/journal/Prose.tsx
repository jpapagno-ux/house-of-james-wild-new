import type { ReactNode } from "react";

// A small Markdown reader for Journal posts: ## and ### headings (given
// stable ids for the contents list and deep links), paragraphs, bullet and
// numbered lists, **bold**, *italic* and [links](/path). Enough for James's
// library stories without pulling in a Markdown library.

export const slugify = (s: string) => s.toLowerCase().replace(/[’']/g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");

export type Block =
  | { t: "h2"; id: string; text: string }
  | { t: "h3"; id: string; text: string }
  | { t: "p"; text: string }
  | { t: "ul" | "ol"; items: string[] };

export function parse(md: string): Block[] {
  return md.trim().split(/\n{2,}/).map((chunk): Block => {
    const c = chunk.trim();
    if (c.startsWith("### ")) { const text = c.slice(4); return { t: "h3", id: slugify(text), text }; }
    if (c.startsWith("## ")) { const text = c.slice(3); return { t: "h2", id: slugify(text), text }; }
    const lines = c.split("\n");
    if (lines.every((l) => /^- /.test(l))) return { t: "ul", items: lines.map((l) => l.slice(2)) };
    if (lines.every((l) => /^\d+\. /.test(l))) return { t: "ol", items: lines.map((l) => l.replace(/^\d+\. /, "")) };
    return { t: "p", text: lines.join(" ") };
  });
}

/** Group blocks into sections: the lead (before the first ##) and one per ##. */
export function sections(blocks: Block[]) {
  const out: { id: string; title?: string; blocks: Block[] }[] = [{ id: "lead", blocks: [] }];
  for (const b of blocks) {
    if (b.t === "h2") out.push({ id: b.id, title: b.text, blocks: [] });
    else out[out.length - 1].blocks.push(b);
  }
  return out;
}

export function words(md: string) { return md.split(/\s+/).filter(Boolean).length; }

export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0; let m: RegExpExecArray | null; let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={k++} className="font-semibold">{m[1]}</strong>);
    else if (m[2]) parts.push(<em key={k++}>{m[2]}</em>);
    else parts.push(<a key={k++} href={m[4]} className="underline decoration-crimson/40 underline-offset-4 hover:decoration-crimson">{m[3]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function Blocks({ blocks, lead = false }: { blocks: Block[]; lead?: boolean }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.t === "p") return <p key={i} className={lead && i === 0 ? "journal-lead" : undefined}><Inline text={b.text} /></p>;
        if (b.t === "h3") return <h3 key={i} id={b.id} className="ledger-display text-[1.35rem] leading-snug pt-2 scroll-mt-28">{b.text}</h3>;
        if (b.t === "ul") return <ul key={i} className="journal-list">{b.items.map((x) => <li key={x}><Inline text={x} /></li>)}</ul>;
        if (b.t === "ol") return <ol key={i} className="journal-steps">{b.items.map((x, n) => <li key={x}><span className="font-mono text-[12px] tracking-[0.14em] ledger-crimson">{String(n + 1).padStart(2, "0")}</span><span><Inline text={x} /></span></li>)}</ol>;
        return null;
      })}
    </>
  );
}
