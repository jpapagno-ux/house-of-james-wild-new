import { requireDesk } from "@/lib/platform/membership";
import { Empty, Notice, PageHead, Section, StatusPill } from "@/components/platform/ui";
import { HostToggle, ProposeHost, WithdrawHost } from "@/components/platform/HostForms";
import { HOST_STATUS, VOLUME_LABEL } from "@/lib/platform/hosts";

// Hosts (James, 4 Nov 2026): every page this partner has on the website that carries a "Meet your host"
// card (stays, safari camps and reserves, Gatherings, The Other Europe, voyages and overland routes), who
// hosts it, and one switch per page. The house approves who; the partner decides whether the card is on.
export const dynamic = "force-dynamic";
export const metadata = { title: "Hosts · Partner Desk", robots: { index: false, follow: false } };

type Page = { page_key: string; label: string; volume: string | null; place: string | null };
type HostRow = { id: string; page_key: string; name: string; card_line: string | null; status: string; show_on_site: boolean; review_note: string | null; created_at: string };

export default async function Hosts() {
  const desk = await requireDesk("/partner/hosts");
  const canEdit = desk.canAdmin || desk.memberships.some((m) => m.status === "active" && m.organization.id === desk.org.id && m.role === "partner_manager")
    || desk.memberships.some((m) => m.status === "active" && m.organization.type === "internal");
  const [{ data: pages }, { data: hosts }, { data: contacts }] = await Promise.all([
    desk.sb.from("host_pages").select("page_key, label, volume, place").eq("organization_id", desk.org.id).order("volume").order("label"),
    desk.sb.from("site_hosts").select("id, page_key, name, card_line, status, show_on_site, review_note, created_at").eq("organization_id", desk.org.id).in("status", ["approved", "proposed", "declined"]).order("created_at", { ascending: false }),
    desk.sb.from("contacts").select("id, first_name, last_name, title").eq("organization_id", desk.org.id).neq("status", "archived").order("last_name"),
  ]);
  const P = (pages ?? []) as Page[], H = (hosts ?? []) as HostRow[];
  const live = new Map(H.filter((h) => h.status === "approved").map((h) => [h.page_key, h]));
  const waiting = (k: string) => H.filter((h) => h.page_key === k && h.status === "proposed");
  const declined = (k: string) => H.find((h) => h.page_key === k && h.status === "declined" && !live.has(k) && !waiting(k).length);
  const groups = [...new Set(P.map((p) => p.volume ?? "stays"))];
  const opts = (contacts ?? []).map((c) => ({ id: c.id as string, name: [c.first_name, c.last_name].filter(Boolean).join(" "), title: (c.title as string) ?? null }));

  return (
    <>
      <PageHead eyebrow="Hosts" title="Meet your host"
        lead="Travellers can book a short group call with your host before they commit. Choose who hosts each page and switch the card on or off. The house checks a new host before the card changes; the switch works at once." />
      {!P.length ? <div className="mt-8"><Empty title="No pages yet">The house adds your pages here as they go live on the website.</Empty></div> : (
        <>
          {canEdit && <div className="mt-8"><ProposeHost pages={P.map((p) => ({ key: p.page_key, label: p.label }))} contacts={opts} company={desk.org.name} /></div>}
          {groups.map((g) => (
            <Section key={g} title={VOLUME_LABEL[g] ?? "Pages"} aside={<span className="ledger-muted">{P.filter((p) => (p.volume ?? "stays") === g).length}</span>}>
              <ul className="divide-y divide-ink/10 border-y ledger-border">
                {P.filter((p) => (p.volume ?? "stays") === g).map((p) => {
                  const h = live.get(p.page_key), w = waiting(p.page_key), d = declined(p.page_key);
                  return (
                    <li key={p.page_key} className="py-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="font-medium">{p.label}{p.place ? <span className="ml-2 text-[13px] ledger-muted">{p.place}</span> : null}</p>
                        {h ? <p className="text-[14px] mt-0.5">{h.name}<span className="ledger-muted">{h.card_line ? ` · ${h.card_line.replace(/^Your host · /, "")}` : ""}</span></p>
                          : <p className="text-[14px] ledger-muted mt-0.5">No host yet: the house takes the call on this page.</p>}
                        {w.map((x) => (
                          <p key={x.id} className="mt-1 text-[13.5px] flex flex-wrap items-center gap-2"><StatusPill {...HOST_STATUS.proposed} /> {x.name}{canEdit && <WithdrawHost id={x.id} />}</p>
                        ))}
                        {d && <p className="mt-1 text-[13.5px]"><StatusPill {...HOST_STATUS.declined} /> {d.name}{d.review_note ? `: ${d.review_note}` : ""}</p>}
                      </div>
                      <div className="sm:justify-self-end">{h ? <HostToggle id={h.id} on={h.show_on_site} label={p.label} canEdit={canEdit} /> : null}</div>
                    </li>
                  );
                })}
              </ul>
            </Section>
          ))}
          <div className="mt-8"><Notice title="What travellers see">The host&rsquo;s name, job title and company, the time where they are, and a button to book the call. Never an email address or phone number.</Notice></div>
        </>
      )}
    </>
  );
}
