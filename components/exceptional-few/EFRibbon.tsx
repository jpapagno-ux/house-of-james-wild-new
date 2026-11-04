import Image from "next/image";
import SafeLink from "@/components/ledger/SafeLink";
import { EFStamp } from "@/components/exceptional-few/EFBadge";
import { EF_CARDS, EF_PATH, type EFCard } from "@/lib/content/exceptional-few-cards";

// The Exceptional Few as a ribbon: a crimson-edged strip that runs across the Ledger (and, with `items`, across
// one country's page). Each entry is the number, a thumbnail, the name and where. Not a volume: a ribbon laid
// across the volumes.
export default function EFRibbon({ items = EF_CARDS, title, eyebrow = "The Exceptional Few™ · A ribbon across the Ledger", stamp = true }: { items?: EFCard[]; title?: string; eyebrow?: string; stamp?: boolean }) {
  if (!items.length) return null;
  return (
    <section className="mt-12 md:mt-16 border-y-2 border-[#8B2525] bg-white" aria-labelledby="ef-ribbon-h">
      <div className="py-6 md:py-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <p className="ledger-eyebrow text-house">{eyebrow}</p>
          <h2 id="ef-ribbon-h" className="ledger-display text-[1.6rem] md:text-[2rem] mt-1">{title ?? `${items.length} Places, Hand-Numbered and Signed`}</h2>
        </div>
        {stamp && <div className="hidden md:block" aria-hidden="true"><EFStamp no={items[0].no} size={170} rotate={-6} /></div>}
      </div>
      <ul className="flex gap-4 overflow-x-auto snap-x pb-6 md:pb-8">
        {items.map((c) => (
          <li key={c.id} className="snap-start shrink-0 w-[240px]">
            <SafeLink href={c.href} className="group flex gap-3 items-center border ledger-rule p-2 hover:border-[#8B2525]">
              <span className="relative w-16 h-20 shrink-0 overflow-hidden bg-mist">{c.image && <Image src={c.image.url} alt="" fill sizes="64px" className="object-cover" />}</span>
              <span className="min-w-0">
                <span className="block font-display text-[1.05rem] text-house leading-none">{c.label}</span>
                <span className="block ledger-display text-[1.05rem] leading-snug mt-1 truncate group-hover:underline underline-offset-4">{c.name}</span>
                <span className="block ledger-eyebrow !text-[9.5px] mt-1 truncate">{c.place}</span>
              </span>
            </SafeLink>
          </li>
        ))}
      </ul>
      <p className="pb-6"><SafeLink href={EF_PATH} className="ledger-btn-ghost">Open The Exceptional Few</SafeLink></p>
    </section>
  );
}
