import Link from "next/link";
import { ADVISORS } from "@/lib/content/advisors";
import { notFound } from "next/navigation";
import { niceDate, requireTraveler } from "@/lib/booking-live/account";
import { FLAGS } from "@/lib/booking-live/flags";
import { isUuid } from "@/lib/booking-live/validate";
import { AddNoteForm, AddSavedStay, InviteForm, RemoveButton } from "@/components/booking-live/Actions";
import { PathwayChips } from "@/components/pathways/Pathway";
import { pathwayChipsFor } from "@/lib/content/pathways";
import { PATHWAYS_ON, pathwayHref } from "@/lib/content/pathways/flag";

export const metadata = { title: "Journey" };

type Item = { id: string; notes: string | null; external_item_type: string | null; arrival_date: string | null; departure_date: string | null; property: { slug: string; name: string; country: string | null } | null };
type Member = { user_id: string; role: string; access_status: string };

// One journey. Access is decided by RLS: a Folio the traveler can't see
// returns no row, and the page 404s exactly as if it didn't exist.
export default async function FolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { sb, user } = await requireTraveler(`/account/folios/${id}`);
  const { data: folio } = await sb.from("folios").select("id, title, destination_summary, start_date, end_date, status, owner_user_id, ledger_id, advisor_adv, advisor_slug").eq("id", id).maybeSingle();
  if (!folio) notFound();
  const owner = folio.owner_user_id === user.id;
  const [{ data: items }, { data: members }, { data: favs }] = await Promise.all([
    sb.from("folio_items").select("id, notes, external_item_type, arrival_date, departure_date, property:properties(slug, name, country)").eq("folio_id", id).order("sort_order").returns<Item[]>(),
    sb.from("folio_members").select("user_id, role, access_status").eq("folio_id", id).eq("access_status", "active").returns<Member[]>(),
    sb.from("favorites").select("property:properties(slug, name)").returns<{ property: { slug: string; name: string } | null }[]>(),
  ]);
  const role = owner ? "owner" : members?.find((m) => m.user_id === user.id)?.role ?? "viewer";
  const canEdit = role === "owner" || role === "editor";
  const dates = [niceDate(folio.start_date), niceDate(folio.end_date)].filter(Boolean).join(" → ");

  return (
    <article className="grid gap-8">
      <header>
        <p className="ledger-eyebrow"><Link href="/account/folios" className="hover:opacity-60">Journeys</Link> · {owner ? folio.status : `shared with you · ${role}`}</p>
        <h1 className="ledger-display text-[2rem] md:text-[2.6rem] mt-2 leading-[1.1]">{folio.title}</h1>
        {folio.destination_summary && <p className="text-[17px] mt-2">{folio.destination_summary}</p>}
        {(folio.ledger_id || folio.advisor_adv) && (
          <p className="mt-3 text-[14px] ledger-muted">
            {folio.ledger_id && <span className="font-mono text-[12px] ledger-crimson tabular-nums mr-3">{folio.ledger_id}</span>}
            {folio.advisor_adv && (() => { const a = ADVISORS.find((x) => x.slug === folio.advisor_slug || x.desk?.adv === folio.advisor_adv); return a ? <>Open with <Link href={a.profileHref ?? "/about/team#advisors"} className="underline underline-offset-4">{a.name}</Link> ({folio.advisor_adv}) · <Link href={`/plan?advisor=${a.slug}${folio.ledger_id ? `&folio=${folio.ledger_id}` : ""}`} className="underline underline-offset-4">Plan with {a.firstName}</Link></> : <>Open with {folio.advisor_adv}</>; })()}
          </p>
        )}
        {dates && <p className="text-[14px] ledger-muted mt-1">{dates}</p>}
        <p className="text-[13px] ledger-muted mt-3 max-w-xl">A journey is a plan, not a booking. Nothing here holds a room or charges a card.</p>
      </header>

      <section>
        <h2 className="ledger-eyebrow">In this journey</h2>
        {(items ?? []).length === 0 ? <p className="mt-3 text-[16px]">Empty for now. Add a saved stay or a note below.</p> : (
          <ol className="mt-3 divide-y ledger-rule border-y ledger-rule">
            {items!.map((it) => (
              <li key={it.id} className="flex flex-wrap justify-between gap-4 py-4">
                <div>
                  {it.property ? <Link href={`/stays/${it.property.slug}`} className="ledger-display text-[19px] hover:ledger-crimson">{it.property.name}</Link>
                    : <p className="ledger-eyebrow">{it.external_item_type}</p>}
                  {PATHWAYS_ON && it.property && (() => { const c = pathwayChipsFor(it.property.slug); return c ? <div className="mt-1.5"><PathwayChips primary={c.primary} secondary={c.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div> : null; })()}
                  {it.notes && <p className="text-[15px] mt-1 whitespace-pre-line">{it.notes}</p>}
                  {(it.arrival_date || it.departure_date) && <p className="text-[13px] ledger-muted">{[niceDate(it.arrival_date), niceDate(it.departure_date)].filter(Boolean).join(" → ")}</p>}
                </div>
                {canEdit && <RemoveButton path={`/api/v1/me/folios/${id}/items/${it.id}`} />}
              </li>
            ))}
          </ol>
        )}
      </section>

      {canEdit && (
        <section className="grid gap-6 border ledger-rule p-5">
          <AddSavedStay folioId={id} options={(favs ?? []).flatMap((f) => (f.property ? [f.property] : []))} />
          <AddNoteForm folioId={id} />
        </section>
      )}

      {owner && FLAGS.share && (
        <section className="grid gap-4">
          <h2 className="ledger-eyebrow">Travelling with</h2>
          {(members ?? []).length > 0 && (
            <ul className="divide-y ledger-rule border-y ledger-rule">
              {members!.map((m) => (
                <li key={m.user_id} className="flex justify-between gap-4 py-3 text-[15px]">
                  <span>Guest · {m.role === "editor" ? "can add & edit" : "can view"}</span>
                  <RemoveButton path={`/api/v1/me/folios/${id}/members/${m.user_id}`} label="Remove access" confirm="Remove their access to this journey?" />
                </li>
              ))}
            </ul>
          )}
          <InviteForm folioId={id} />
        </section>
      )}

      {owner && (
        <div><RemoveButton path={`/api/v1/me/folios/${id}`} label="Delete this journey" confirm="Delete this journey and everything in it? This can't be undone." /></div>
      )}
    </article>
  );
}
