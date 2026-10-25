import Image from "next/image";
import { FieldIcon } from "@/components/ledger/FieldIcon";
import { IGGI_IMG, TAGS, type ChatSample as Sample, type Tag } from "@/lib/content/iggi";

// ChatSample: a static mock of Iggi embedded on a page, showing the page it
// knows it's on, his opener, the standing prompts, and one answer built
// layer by labelled layer. Sample only; nothing here calls a model.

const TAG_STYLE: Record<Tag, string> = {
  ledger: "border ledger-border ledger-muted",
  founder: "border border-crimson text-crimson",
  james: "bg-crimson text-paper",
  partner: "border border-coast text-coast-deep",
  check: "border border-dashed border-rust text-rust",
};

export function TagChip({ tag }: { tag: Tag }) {
  return <span className={`inline-block px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase font-mono whitespace-nowrap ${TAG_STYLE[tag]}`}>{TAGS[tag].label}</span>;
}

export default function ChatSample({ s }: { s: Sample }) {
  return (
    <figure className="m-0 h-full bg-paper border ledger-rule shadow-[0_10px_28px_rgba(45,42,38,0.10)] flex flex-col">
      <div className="flex items-center gap-3 border-b ledger-rule px-4 py-3 bg-coast-deep text-paper">
        <span className="relative w-9 h-9 rounded-full overflow-hidden bg-paper shrink-0"><Image src={IGGI_IMG.url} alt="" fill sizes="36px" className="object-contain p-0.5" /></span>
        <div className="min-w-0">
          <p className="text-[15px] leading-tight">Iggi</p>
          <p className="text-[11px] tracking-[0.12em] uppercase text-coast-light truncate">On this page · {s.where}</p>
        </div>
        <FieldIcon name={s.icon} height={22} className="ml-auto text-coast-light" />
      </div>
      <div className="p-4 space-y-3 flex-1 text-[14.5px] leading-relaxed">
        <p className="bg-coast-mist px-3 py-2 max-w-[90%]">{s.opener}</p>
        <div className="flex flex-wrap gap-1.5" aria-label="Suggested questions">
          {s.prompts.map((p) => <span key={p} className="border border-coast/40 text-coast-deep px-2.5 py-1 text-[12.5px] rounded-full">{p}</span>)}
        </div>
        <p className="ml-auto max-w-[85%] bg-paper-card px-3 py-2 text-right"><span className="sr-only">Traveller: </span>{s.q}</p>
        <div className="space-y-2.5">
          {s.answer.map((a) => (
            <div key={a.text.slice(0, 20)} className="border-l-2 border-coast pl-3">
              <TagChip tag={a.tag} />
              <p className="mt-1">{a.text}</p>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="border-t ledger-border px-4 py-2 text-[12px] ledger-muted">Sample conversation · Iggi isn&rsquo;t live yet</figcaption>
    </figure>
  );
}
