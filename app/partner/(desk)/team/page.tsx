import { InviteForm, RevokeInvite, TeamRowActions } from "@/components/platform/forms";
import { Empty, Notice, PageHead, Section, StatusPill } from "@/components/platform/ui";
import { requireDesk } from "@/lib/platform/membership";
import { portfolio } from "@/lib/platform/queries";
import { niceDate } from "@/lib/platform/labels";
import { ROLE_LABEL, ROLE_LINE } from "@/lib/platform/roles";

export const metadata = { title: "Team" };

export default async function Team() {
  const desk = await requireDesk("/partner/team");
  const manage = desk.canAdmin;
  const [members, invites, entities, access] = await Promise.all([
    desk.sb.from("organization_memberships").select("id, user_id, role, status, created_at").eq("organization_id", desk.org.id).order("created_at"),
    desk.sb.from("org_invitations").select("id, email, role, entity_ids, expires_at, accepted_at, revoked_at, created_at").eq("organization_id", desk.org.id).order("created_at", { ascending: false }),
    portfolio(desk),
    desk.sb.from("entity_access").select("membership_id, property_id"),
  ]);
  const ids = (members.data ?? []).map((m) => m.user_id as string);
  const { data: people } = ids.length ? await desk.sb.from("profiles").select("id, first_name, last_name, email").in("id", ids) : { data: [] };
  const person = new Map((people ?? []).map((p) => [p.id, p]));
  const name = new Map(entities.map((e) => [e.id, e.name]));
  const narrowed = (mid: string) => (access.data ?? []).filter((a) => a.membership_id === mid).map((a) => name.get(a.property_id) ?? "a property");
  const openInvites = (invites.data ?? []).filter((i) => !i.accepted_at && !i.revoked_at && new Date(i.expires_at) > new Date());
  const rows = members.data ?? [];

  return (
    <div>
      <PageHead eyebrow="Team" title={`People at the desk for ${desk.org.name}`}
        lead="Partner admins manage the team, company details and contacts. Contributors answer requests and send updates for the properties they're given." />
      {!manage && rows.length === 0 && <div className="mt-6"><Notice>Your partner admin manages the team. You&rsquo;re signed in as {desk.user.email}.</Notice></div>}

      <Section title="Members" aside={<span className="ledger-muted">{rows.filter((m) => m.status === "active").length} active</span>}>
        {rows.length === 0 ? <p className="text-[15px] ledger-muted">Only partner admins see the full team.</p> : (
          <ul className="divide-y divide-ink/10 border-y ledger-border">
            {rows.map((m) => {
              const p = person.get(m.user_id), self = m.user_id === desk.user.id, n = narrowed(m.id);
              return (
                <li key={m.id} className="py-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="font-medium">{[p?.first_name, p?.last_name].filter(Boolean).join(" ") || p?.email || "Member"}{self && <span className="ledger-muted font-normal"> · you</span>}</p>
                    <p className="text-[13px] ledger-muted break-all">{p?.email} · {ROLE_LABEL[m.role] ?? m.role}{n.length ? ` · only ${n.join(", ")}` : ""}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    {m.status !== "active" && <StatusPill label="Access removed" tone="closed" />}
                    {manage && !self && m.status === "active" && ["partner_admin", "partner_contributor", "partner_manager", "partner_editor"].includes(m.role) && <TeamRowActions membershipId={m.id} role={m.role} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {manage && (
        <div className="grid gap-x-8 lg:grid-cols-[1.2fr_1fr]">
          <Section title="Invite someone">
            <InviteForm entities={entities.map((e) => ({ id: e.id, name: e.name }))} />
            <dl className="mt-6 grid gap-2 text-[13.5px]">{Object.entries(ROLE_LINE).map(([k, v]) => <div key={k}><dt className="font-medium inline">{ROLE_LABEL[k]}: </dt><dd className="inline ledger-muted">{v}</dd></div>)}</dl>
          </Section>
          <Section title="Open invitations">
            {openInvites.length === 0 ? <Empty title="None open" /> : (
              <ul className="divide-y divide-ink/10 border-y ledger-border">
                {openInvites.map((i) => (
                  <li key={i.id} className="py-3">
                    <p className="font-medium break-all">{i.email}</p>
                    <p className="text-[13px] ledger-muted">{ROLE_LABEL[i.role]}{i.entity_ids.length ? ` · ${i.entity_ids.map((x: string) => name.get(x)).filter(Boolean).join(", ")}` : ""} · expires {niceDate(i.expires_at)}</p>
                    <RevokeInvite id={i.id} />
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
