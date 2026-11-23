import Link from "next/link";
import { Empty, Notice, PageHead, Section } from "@/components/platform/ui";
import { requireHouse } from "@/lib/platform/membership";
import { atlasBuild } from "@/lib/atlas/build";
import { CATEGORY_LABEL, type Category } from "@/lib/atlas/match";
import FEEDERS from "@/lib/atlas/feeders.json";

export const metadata = { title: "Atlas: needs a ruling" };

// /desk/atlas (James, 23 Nov 2026): what the Atlas holds after this build, by feeder, and the records the rules could
// not file. A record here is found by name and place but under no category until an editor files its category in
// lib/atlas/category-decisions.json. House editors only.
export default async function AtlasDesk() {
  await requireHouse("/desk/atlas");
  const { rows, rulings, feeders } = atlasBuild();
  const outside = (FEEDERS as { outside: { sections: Record<string, string> } }).outside.sections;
  const waiting = Object.entries(outside).filter(([, why]) => /James to rule/.test(why));
  const byFeeder = feeders.map((f) => ({ ...f, list: rulings.filter((r) => r.feeder === f.id) })).filter((f) => f.list.length);
  return (
    <div className="max-w-4xl">
      <PageHead eyebrow="House desk" title="Atlas: needs a ruling" lead={`The Atlas holds ${rows.length.toLocaleString("en-US")} records after this build. ${rulings.length ? `${rulings.length} wait for a category.` : "Every record has its category."}`} />
      <Section title="What feeds the Atlas">
        <table className="w-full text-[15px]">
          <thead><tr className="text-left ledger-muted"><th className="py-2 font-normal">Feeder</th><th className="py-2 font-normal text-right">Records</th><th className="py-2 font-normal text-right">Need a ruling</th></tr></thead>
          <tbody>
            {feeders.map((f) => (
              <tr key={f.id} className="border-t ledger-border"><td className="py-2">{f.label}</td><td className="py-2 text-right tabular-nums">{f.rows.toLocaleString("en-US")}</td><td className="py-2 text-right tabular-nums">{rulings.filter((r) => r.feeder === f.id).length || ""}</td></tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Records waiting for a category">
        {!byFeeder.length ? <Empty title="Nothing is waiting.">Every record the Atlas holds has a confirmed category.</Empty> : byFeeder.map((f) => (
          <div key={f.id} className="mb-8">
            <h3 className="ledger-eyebrow">{f.label} · {f.list.length}</h3>
            <ul className="mt-2 border-t ledger-border">
              {f.list.map((r) => (
                <li key={r.id} className="border-b ledger-border py-3">
                  <p><Link href={r.href} className="underline underline-offset-4">{r.name}</Link> <span className="ledger-muted">· filed as {r.filedAs}</span></p>
                  <p className="text-[14.5px] mt-1">Proposed: <strong>{CATEGORY_LABEL[r.proposed as Category] ?? r.proposed}</strong>. {r.reason}.</p>
                  <p className="text-[13px] ledger-muted mt-1">Key for the decision file: <code>{r.key}</code></p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>
      <Section title="Sections outside the Atlas, waiting for your ruling">
        {waiting.length ? (
          <ul className="border-t ledger-border">{waiting.map(([s, why]) => <li key={s} className="border-b ledger-border py-2"><span className="font-medium">/{s}</span> <span className="ledger-muted">· {why}</span></li>)}</ul>
        ) : <Empty title="None." />}
        <Notice title="How a new volume joins">A new section or record page cannot ship unlisted: the build check stops it until it has a feeder or a written reason in the Atlas register.</Notice>
      </Section>
    </div>
  );
}
