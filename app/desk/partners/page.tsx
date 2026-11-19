import { notFound } from "next/navigation";
import { requireHouse } from "@/lib/platform/membership";
import { PARTNER_DESK } from "@/lib/platform/flags";
import { mailLive } from "@/lib/platform/advisor-alerts";
import { StatusPill } from "@/components/platform/ui";
import { ApplicationActions, InvitePartner, type EntryOption, type OrgOption } from "@/components/platform/HousePartnerForms";

export const metadata = { title: "Partners" };

const APP_STATUS: Record<string, [string, "good" | "progress" | "attention" | "neutral"]> = {
  new: ["New", "attention"], reviewing: ["Reviewing", "progress"], invited: ["Invited", "good"], declined: ["Declined", "neutral"],
};

type AppRow = { id: string; organization_name: string; website: string | null; contact_name: string; role_title: string | null; email: string; phone: string | null; country: string | null; properties: string | null; message: string | null; status: string; created_at: string; house_note: string | null };

// /desk/partners (James, 19 Nov 2026): requests to join, and every partner with who is invited and who is in.
// A request is invited in one step (organization, Ledger entries, invitation and email); a group with several
// brands or lodges is one partner, and a lodge manager can be limited to their own lodge.
export default async function HousePartners() {
  if (!PARTNER_DESK) notFound();
  const desk = await requireHouse("/desk/partners");
  if (!desk.memberships.some((m) => m.role === "jw_admin")) notFound(); // inviting is house admins only (the database checks too)
  const [apps, orgs, eps, members, invs, props, brands] = await Promise.all([
    desk.sb.from("partner_applications").select("id, organization_name, website, contact_name, role_title, email, phone, country, properties, message, status, created_at, house_note").order("created_at", { ascending: false }).limit(200),
    desk.sb.from("organizations").select("id, name, partner_code").eq("type", "partner").order("name"),
    desk.sb.from("entity_partners").select("organization_id, property_id"),
    desk.sb.from("organization_memberships").select("organization_id, role, status"),
    desk.sb.from("org_invitations").select("organization_id, email, role, expires_at, accepted_at, revoked_at, created_at").order("created_at", { ascending: false }),
    desk.sb.from("properties").select("id, name, country, brand_id").order("name"),
    desk.sb.from("brands").select("id, name, organization_id"),
  ]);
  const brandName = new Map((brands.data ?? []).map((b) => [b.id as string, b.name as string]));
  const entries: EntryOption[] = (props.data ?? []).map((p) => ({ id: p.id, name: p.name, country: p.country ?? null, brand: p.brand_id ? brandName.get(p.brand_id) ?? null : null }));
  const entryName = new Map(entries.map((e) => [e.id, e.name]));
  const now = new Date().toISOString();
  const orgOptions: OrgOption[] = (orgs.data ?? []).map((o) => {
    const own = [...new Set((eps.data ?? []).filter((x) => x.organization_id === o.id).map((x) => x.property_id as string))];
    return { id: o.id, name: o.name, code: o.partner_code ?? null, entries: own,
      brands: (brands.data ?? []).filter((b) => b.organization_id === o.id).map((b) => b.name as string),
      members: (members.data ?? []).filter((m) => m.organization_id === o.id && m.status === "active").length,
      open: (invs.data ?? []).filter((i) => i.organization_id === o.id && !i.accepted_at && !i.revoked_at && i.expires_at > now).map((i) => ({ email: i.email as string, role: i.role as string, expires: (i.expires_at as string).slice(0, 10) })) };
  });
  const list = (apps.data ?? []) as AppRow[];
  const waiting = list.filter((a) => a.status === "new" || a.status === "reviewing");
  const done = list.filter((a) => a.status === "invited" || a.status === "declined");
  const live = mailLive();

  return (
    <div>
      <p className="ledger-eyebrow ledger-crimson">House desk</p>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] leading-[1.1]">Partners</h1>
      <p className="mt-3 max-w-2xl text-[15.5px] ledger-muted">Requests to join the Partner Desk, and every partner the house works with. Invite in one step: the partner, its Ledger entries and the person. They choose a password, set up their phone, then a guided set-up asks for everything the desk holds.</p>

      <section className="mt-10" aria-labelledby="req-h">
        <h2 id="req-h" className="ledger-display text-[1.6rem]">Requests to join{waiting.length ? ` · ${waiting.length}` : ""}</h2>
        {waiting.length === 0 ? <p className="mt-3 text-[15px] ledger-muted">No requests waiting. Partners ask at /partner/apply, or from the Partner trail in Sign in.</p> : (
          <ul className="mt-4 grid gap-5">
            {waiting.map((a) => (
              <li key={a.id} className="border ledger-border bg-white p-5 md:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="ledger-display text-[1.35rem]">{a.organization_name}</p>
                  <span className="flex items-center gap-3"><StatusPill label={APP_STATUS[a.status][0]} tone={APP_STATUS[a.status][1]} /><span className="text-[13px] ledger-muted">{a.created_at.slice(0, 10)}</span></span>
                </div>
                <p className="mt-1 text-[15px]">{a.contact_name}{a.role_title ? `, ${a.role_title}` : ""} · {a.email}{a.phone ? ` · ${a.phone}` : ""}{a.country ? ` · ${a.country}` : ""}</p>
                {a.website && <p className="text-[13.5px] ledger-muted break-all">{a.website}</p>}
                {a.properties && <div className="mt-3"><p className="ledger-eyebrow">Properties, brands or vessels</p><p className="mt-1 whitespace-pre-line text-[15px]">{a.properties}</p></div>}
                {a.message && <div className="mt-3"><p className="ledger-eyebrow">Their note</p><p className="mt-1 whitespace-pre-line text-[15px]">{a.message}</p></div>}
                <details className="mt-5 border-t ledger-border pt-4">
                  <summary className="cursor-pointer ledger-btn ledger-btn--solid inline-flex">Invite them</summary>
                  <div className="mt-5"><InvitePartner orgs={orgOptions} entries={entries} mailLive={live}
                    preset={{ application: a.id, orgName: a.organization_name, name: a.contact_name, email: a.email, match: orgOptions.find((o) => o.name.toLowerCase() === a.organization_name.toLowerCase())?.id ?? null }} /></div>
                </details>
                <div className="mt-4"><ApplicationActions id={a.id} status={a.status} /></div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14" aria-labelledby="inv-h">
        <h2 id="inv-h" className="ledger-display text-[1.6rem]">Invite a partner directly</h2>
        <p className="mt-2 max-w-2xl text-[15px] ledger-muted">For a partner the house already works with. Choose them below (or add a new one), connect their entries, and invite the person who will run their desk.</p>
        <div className="mt-5 border ledger-border bg-white p-5 md:p-6"><InvitePartner orgs={orgOptions} entries={entries} mailLive={live} preset={null} /></div>
      </section>

      <section className="mt-14" aria-labelledby="org-h">
        <h2 id="org-h" className="ledger-display text-[1.6rem]">Partners on file · {orgOptions.length}</h2>
        <ul className="mt-4 border-y ledger-border">
          {orgOptions.map((o) => (
            <li key={o.id} className="border-b ledger-border last:border-b-0 py-4 grid gap-1 md:grid-cols-[1.2fr_2fr_1fr] md:gap-6">
              <div><p className="font-medium">{o.name}</p>{o.code && <p className="ledger-id text-[12px]">{o.code}</p>}</div>
              <p className="text-[14px] ledger-muted">{o.brands.length ? `Brands: ${o.brands.join(", ")} · ` : ""}{o.entries.length} {o.entries.length === 1 ? "entry" : "entries"}{o.entries.length ? `: ${o.entries.slice(0, 4).map((id) => entryName.get(id)).filter(Boolean).join(", ")}${o.entries.length > 4 ? "…" : ""}` : ""}</p>
              <p className="text-[14px]">{o.members ? `${o.members} signed in` : "No one signed in yet"}{o.open.length ? <span className="block text-[13px] ledger-muted">Invited: {o.open.map((i) => `${i.email} (until ${i.expires})`).join(", ")}</span> : null}</p>
            </li>
          ))}
        </ul>
      </section>

      {done.length > 0 && (
        <section className="mt-14" aria-labelledby="past-h">
          <h2 id="past-h" className="ledger-display text-[1.6rem]">Earlier requests</h2>
          <ul className="mt-4 border-y ledger-border">
            {done.map((a) => (
              <li key={a.id} className="border-b ledger-border last:border-b-0 py-3 flex flex-wrap items-center justify-between gap-3">
                <span><span className="font-medium">{a.organization_name}</span> <span className="text-[14px] ledger-muted">· {a.contact_name} · {a.email}</span></span>
                <span className="flex items-center gap-3"><StatusPill label={APP_STATUS[a.status][0]} tone={APP_STATUS[a.status][1]} />{a.status === "declined" && <ApplicationActions id={a.id} status={a.status} />}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
