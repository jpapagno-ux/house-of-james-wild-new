import { FieldIcon, type FieldIconName } from "@/components/ledger/FieldIcon";
import AccordionRow from "./AccordionRow";
import SectionHead from "./SectionHead";

// JWC-STYLE-01, Stage 7. The detail, folded away: what you get on the left, why it is in the Ledger on the right,
// each as accordion rows with house icons. The first row of each is open; every answer stays in the page.
export type DetailRow = { title: string; body: string };
const LEFT: FieldIconName[] = ["sun", "frond", "tree-ring", "coral"];
const RIGHT: FieldIconName[] = ["coral", "frond", "tree-ring", "sun"];

function Column({ eyebrow, title, rows, icons, id }: { eyebrow: string; title: string; rows: DetailRow[]; icons: FieldIconName[]; id?: string }) {
  if (!rows.length) return null;
  return (
    <div id={id}>
      <p className="font-mono text-[10px] tracking-[0.24em] uppercase text-stone-text">{eyebrow}</p>
      <h3 className="font-display font-medium text-[26px] text-graphite mt-1.5">{title}</h3>
      <div className="mt-4 border border-[color:var(--jw-hairline)] border-t-2 border-t-[color:var(--jw-stone)] px-5 [&>div:first-child]:border-t-0">
        {rows.map((r, i) => <AccordionRow key={r.title} as="h4" title={r.title} defaultOpen={i === 0} icon={<FieldIcon name={icons[i % icons.length]} height={18} />}>{r.body}</AccordionRow>)}
      </div>
    </div>
  );
}

export default function JournalDetail({ no, features, reasons }: { no: string; features: DetailRow[]; reasons: DetailRow[] }) {
  if (!features.length && !reasons.length) return null;
  return (
    <section id="detail" aria-label="Features and why it is here" className="bg-white">
      <SectionHead no={no} label="The detail, folded away" title="Features, and Why It Is Here" lede="Open what you want to read. The first row of each is open." />
      <div className="mt-9 grid lg:grid-cols-2 gap-10 items-start">
        <Column eyebrow="Features of the stay" title="What You Get" rows={features} icons={LEFT} />
        <Column eyebrow="Why it is in the Ledger" title="Why We Vetted It" rows={reasons} icons={RIGHT} />
      </div>
    </section>
  );
}
