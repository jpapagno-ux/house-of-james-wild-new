import { AddContact, ContactCardActions } from "@/components/platform/forms";
import { Empty, Notice, PageHead, StatusPill } from "@/components/platform/ui";
import { requireDesk } from "@/lib/platform/membership";
import { contacts, portfolio } from "@/lib/platform/queries";
import { niceDate } from "@/lib/platform/labels";
import { CONTACT_ROLE_LABEL } from "@/lib/platform/validate";

export const metadata = { title: "Contacts" };

const COMMS: Record<string, string> = { email: "Email", phone: "Phone", whatsapp: "WhatsApp", video: "Video call" };

export default async function Contacts() {
  const desk = await requireDesk("/partner/contacts");
  const [list, entities] = await Promise.all([contacts(desk), portfolio(desk)]);
  const canEdit = desk.canAdmin || desk.houseEditor;
  const name = new Map(entities.map((e) => [e.id, e.name]));
  const ents = entities.map((e) => ({ id: e.id, name: e.name }));
  return (
    <div>
      <PageHead eyebrow="Contacts" title="Who the house should reach"
        lead="Reservations, sales, marketing, finance and who to call on the ground. Changes here take effect straight away; no approval needed." />
      {!canEdit && <div className="mt-6"><Notice>Your partner admin keeps this list. Tell them, or the house, if something is out of date.</Notice></div>}
      {canEdit && <div className="mt-6"><AddContact entities={ents} /></div>}
      {list.length === 0 && <div className="mt-8"><Empty title="No contacts yet">Add the people the house should write to.</Empty></div>}
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {list.map((c) => {
          const full = [c.first_name, c.last_name].filter(Boolean).join(" ") || c.title || "Contact";
          return (
            <li key={c.id} className={`border p-4 md:p-5 ${c.status === "to_verify" ? "border-rust/50" : "ledger-border"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="ledger-display text-[1.3rem] leading-tight">{full}</p>{c.title && full !== c.title && <p className="text-[13.5px] ledger-muted">{c.title}</p>}</div>
                {c.status === "to_verify" && <StatusPill label="To confirm" tone="attention" />}
              </div>
              {c.roles.length > 0 && <p className="mt-2 flex flex-wrap gap-1.5">{c.roles.map((r) => <span key={r} className="border ledger-border px-2 py-[2px] text-[11.5px]">{CONTACT_ROLE_LABEL[r] ?? r}</span>)}</p>}
              <dl className="mt-3 grid grid-cols-[90px_1fr] gap-x-3 gap-y-1 text-[14px]">
                {c.email && <><dt className="ledger-muted">Email</dt><dd className="break-all"><a href={`mailto:${c.email}`} className="underline underline-offset-2">{c.email}</a></dd></>}
                {c.mobile && <><dt className="ledger-muted">Mobile</dt><dd>{c.mobile}</dd></>}
                {c.whatsapp && <><dt className="ledger-muted">WhatsApp</dt><dd>{c.whatsapp}</dd></>}
                {(c.country || c.timezone) && <><dt className="ledger-muted">Where</dt><dd>{[c.country, c.timezone, c.territory].filter(Boolean).join(" · ")}</dd></>}
                {c.languages.length > 0 && <><dt className="ledger-muted">Languages</dt><dd>{c.languages.join(", ")}</dd></>}
                {c.preferred_communication && <><dt className="ledger-muted">Prefers</dt><dd>{COMMS[c.preferred_communication]}</dd></>}
                <dt className="ledger-muted">Looks after</dt><dd>{c.contact_entities.length ? c.contact_entities.map((x) => name.get(x.property_id)).filter(Boolean).join(", ") : "Every property"}</dd>
                <dt className="ledger-muted">Verified</dt><dd>{niceDate(c.last_verified_at)}</dd>
              </dl>
              {c.notes && <p className="mt-2 text-[13.5px] ledger-muted whitespace-pre-line">{c.notes}</p>}
              {canEdit && (
                <ContactCardActions entities={ents} contact={{
                  id: c.id, firstName: c.first_name ?? "", lastName: c.last_name ?? "", title: c.title ?? "", email: c.email ?? "", mobile: c.mobile ?? "", whatsapp: c.whatsapp ?? "",
                  country: c.country ?? "", timezone: c.timezone ?? "", territory: c.territory ?? "", languages: c.languages.join(", "), roles: c.roles,
                  preferredCommunication: c.preferred_communication ?? "", newsletterOptIn: c.newsletter_opt_in, tradeOptIn: c.trade_opt_in, notes: c.notes ?? "",
                  entities: c.contact_entities.map((x) => x.property_id),
                }} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
