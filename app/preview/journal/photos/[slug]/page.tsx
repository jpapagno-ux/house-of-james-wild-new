import Image from "next/image";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { JOURNAL_STAYS, journalStay, SECTION_LABEL } from "@/lib/journal-style/stay";

// Preview only, never linked and never indexed: JWC-STYLE-01. A contact sheet of one stay's photographs, numbered in
// the order the photograph viewer shows them, with the section each is filed under. It exists so photographs can be
// described (lib/journal-style/photo-notes.json) by looking at them.
// Any stay can be sheeted on request (James, 24 Nov 2026), so photographs are checked before a stay joins the template.
export const dynamicParams = true;
export function generateStaticParams() { return ["todo", ...JOURNAL_STAYS].map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return buildMetadata({ title: `Photograph sheet: ${slug} (preview)`, description: "A contact sheet for describing photographs.", path: `/preview/journal/photos/${slug}`, noindex: true });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // "todo": every stay with a photograph that has no section yet, on one sheet
  if (slug === "todo") {
    const todo = JOURNAL_STAYS.map((x) => journalStay(x)).filter((x): x is NonNullable<typeof x> => !!x && x.photos.some((p) => !p.section));
    return (
      <main className="bg-white p-3">
        {todo.map((t) => (
          <section key={t.s.slug} className="mb-3">
            <p className="font-mono text-[11px] text-graphite">{t.s.slug} · {t.photos.length}</p>
            <ol className="mt-1 grid grid-cols-8 gap-1.5">
              {t.photos.map((p, i) => (
                <li key={p.url}><div className="relative aspect-[4/3] bg-[color:var(--jw-hairline)]"><Image src={p.url} alt="" fill sizes="13vw" loading="eager" className="object-cover" /></div><p className="font-mono text-[10px] leading-none text-graphite">{i + 1}</p></li>
              ))}
            </ol>
          </section>
        ))}
      </main>
    );
  }
  const v = journalStay(slug);
  if (!v) notFound();
  return (
    <main className="bg-white p-3">
      <p className="font-mono text-[11px] text-graphite">{v.s.name} · {v.photos.length} photographs</p>
      <ol className="mt-2 grid grid-cols-6 gap-2">
        {v.photos.map((p, i) => (
          <li key={p.url}>
            <div className="relative aspect-[4/3] bg-[color:var(--jw-hairline)]"><Image src={p.url} alt={p.alt} fill sizes="17vw" className="object-cover" /></div>
            <p className="font-mono text-[10px] text-graphite">{i + 1} · {p.section ? SECTION_LABEL[p.section] : "none"}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
