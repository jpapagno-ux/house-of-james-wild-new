"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/platform/client";

// House desk · partners (James, 19 Nov 2026): invite a partner in one step, and file a request to join.
// A group with several brands or lodges is one partner; its entries are connected to it, and each person can be
// limited to some of them (a lodge manager sees their own lodge, the group's sales office sees all).

export type EntryOption = { id: string; name: string; country: string | null; brand: string | null };
export type OrgOption = { id: string; name: string; code: string | null; entries: string[]; brands: string[]; members: number; open: { email: string; role: string; expires: string }[] };
type Preset = { application: string; orgName: string; name: string; email: string; match: string | null } | null;
type Msg = { ok: boolean; text: string } | null;

const input = "mt-1 w-full bg-white border ledger-border px-3 py-2 text-[15px]";
const lab = "block text-[13px] ledger-muted";
const Note = ({ m }: { m: Msg }) => (m ? <p role={m.ok ? "status" : "alert"} className={`text-[14px] ${m.ok ? "text-[#11705A]" : "ledger-crimson"}`}>{m.text}</p> : null);

export function InvitePartner({ orgs, entries, preset, mailLive }: { orgs: OrgOption[]; entries: EntryOption[]; preset: Preset; mailLive: boolean }) {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string>(preset?.match ?? (preset ? "new" : orgs[0]?.id ?? "new"));
  const org = orgs.find((o) => o.id === orgId) ?? null;
  const [orgName, setOrgName] = useState(preset?.orgName ?? "");
  const [name, setName] = useState(preset?.name ?? "");
  const [email, setEmail] = useState(preset?.email ?? "");
  const [role, setRole] = useState<"partner_admin" | "partner_contributor">("partner_admin");
  const [connect, setConnect] = useState<string[]>([]);
  const [entityRole, setEntityRole] = useState("operator");
  const [limit, setLimit] = useState(false);
  const [access, setAccess] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const owned = new Set(org?.entries ?? []);
  const all = new Set([...owned, ...connect]);
  const shown = entries.filter((e) => !owned.has(e.id) && (!filter || `${e.name} ${e.brand ?? ""} ${e.country ?? ""}`.toLowerCase().includes(filter.toLowerCase()))).slice(0, 40);
  const byId = new Map(entries.map((e) => [e.id, e]));
  const toggle = (list: string[], set: (v: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  async function send(viaEmail: boolean) {
    setBusy(true); setMsg(null); setLink(null);
    const r = await api<{ link: string; emailed: boolean; code: string | null }>("POST", "/api/v1/desk/partners/invite", {
      application: preset?.application ?? null, org: org ? org.id : null, orgName: org ? null : orgName, name, email, role,
      propertyIds: connect, entityRole, access: limit ? access : [], send: viaEmail,
    });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    setLink(r.data.link);
    setMsg({ ok: true, text: `${r.data.code ? `${r.data.code}. ` : ""}${r.data.emailed ? "Emailed. The link below is the same one, in case they ask." : viaEmail ? "Email from the desk is not switched on yet, so nothing was sent. Copy the link below and send it yourself." : "Ready. Copy the link below and send it yourself."}` });
    setConnect([]); router.refresh();
  }

  return (
    <div className="grid gap-5 max-w-3xl">
      <div className="grid gap-4 md:grid-cols-2">
        <label className={lab}>Partner
          <select value={orgId} onChange={(e) => { setOrgId(e.target.value); setConnect([]); setAccess([]); }} className={input}>
            <option value="new">A new partner…</option>
            {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}{o.code ? ` · ${o.code}` : ""}</option>)}
          </select>
        </label>
        {!org && <label className={lab}>New partner&rsquo;s name (the company or group)<input value={orgName} onChange={(e) => setOrgName(e.target.value)} className={input} /></label>}
        {org && <p className="text-[14px] ledger-muted self-end pb-2">{org.brands.length ? `Brands: ${org.brands.join(", ")}. ` : ""}{org.entries.length} {org.entries.length === 1 ? "entry" : "entries"} connected · {org.members ? `${org.members} signed in` : "no one signed in yet"}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className={lab}>Contact name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" className={input} /></label>
        <label className={lab}>Their email (they sign in with it)<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" className={input} /></label>
      </div>

      <fieldset className="grid gap-2">
        <legend className={lab}>What they can do</legend>
        <label className="flex items-start gap-2 text-[15px]"><input type="radio" name={`role-${preset?.application ?? "d"}`} checked={role === "partner_admin"} onChange={() => setRole("partner_admin")} className="mt-1" /><span><strong className="font-medium">Admin</strong>: runs the desk. Completes the set-up (company, contacts, rooms, rates, documents, commercial terms, banking) and invites their own team.</span></label>
        <label className="flex items-start gap-2 text-[15px]"><input type="radio" name={`role-${preset?.application ?? "d"}`} checked={role === "partner_contributor"} onChange={() => setRole("partner_contributor")} className="mt-1" /><span><strong className="font-medium">Contributor</strong>: keeps the record current and answers the house&rsquo;s requests. No commercial terms or banking.</span></label>
      </fieldset>

      <div className="border-t ledger-border pt-4">
        <p className="ledger-eyebrow">Connect Ledger entries {org ? "(add to what is connected)" : ""}</p>
        <p className="mt-1 text-[13.5px] ledger-muted">The properties, camps, villas or vessels this partner runs. A group with several brands or locations is one partner with all its entries. Not in the Ledger yet? Invite them anyway; connect entries later.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Find an entry by name, brand or country" className={input.replace("mt-1 ", "")} />
          <label className={`${lab} flex items-center gap-2`}>As
            <select value={entityRole} onChange={(e) => setEntityRole(e.target.value)} className="bg-white border ledger-border px-2 py-2 text-[14px]">
              <option value="operator">Operator</option><option value="owner">Owner</option><option value="sales_representative">Sales representative</option>
              <option value="marketing_representative">Marketing representative</option><option value="booking_partner">Booking partner</option><option value="dmc">DMC</option>
            </select></label>
        </div>
        <ul className="mt-3 max-h-56 overflow-y-auto border ledger-border divide-y divide-ink/10">
          {shown.map((e) => (
            <li key={e.id}><label className="flex items-center gap-3 px-3 py-2 text-[14.5px] hover:bg-[#F7F5F2]">
              <input type="checkbox" checked={connect.includes(e.id)} onChange={() => toggle(connect, setConnect, e.id)} />
              <span>{e.name}<span className="ledger-muted">{e.brand ? ` · ${e.brand}` : ""}{e.country ? ` · ${e.country}` : ""}</span></span>
            </label></li>
          ))}
          {shown.length === 0 && <li className="px-3 py-2 text-[14px] ledger-muted">No entries match.</li>}
        </ul>
        {connect.length > 0 && <p className="mt-2 text-[13.5px]">Connecting: {connect.map((id) => byId.get(id)?.name).join(", ")}</p>}
      </div>

      {all.size > 1 && (
        <div className="border-t ledger-border pt-4">
          <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" checked={limit} onChange={(e) => setLimit(e.target.checked)} />Limit this person to some of the partner&rsquo;s entries (a lodge or villa manager)</label>
          {limit && <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {[...all].map((id) => <li key={id}><label className="flex items-center gap-2 text-[14.5px]"><input type="checkbox" checked={access.includes(id)} onChange={() => toggle(access, setAccess, id)} />{byId.get(id)?.name ?? "Entry"}</label></li>)}
          </ul>}
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t ledger-border pt-4">
        <button type="button" disabled={busy || !email || (!org && !orgName.trim())} onClick={() => send(true)} className="ledger-btn ledger-btn--solid disabled:opacity-50">{busy ? "Working…" : "Email the invitation"}</button>
        <button type="button" disabled={busy || !email || (!org && !orgName.trim())} onClick={() => send(false)} className="ledger-btn disabled:opacity-50">Make a link only</button>
      </div>
      {!mailLive && <p className="text-[13px] ledger-muted">Email from the desk is not switched on yet: you will get a link to send yourself.</p>}
      {org && org.open.length > 0 && <p className="text-[13px] ledger-muted">Already invited: {org.open.map((i) => `${i.email} until ${i.expires}`).join(", ")}. A new invitation to the same address replaces the open one.</p>}
      <Note m={msg} />
      {link && <div className="grid gap-2"><code className="block bg-[#F4F2EF] border ledger-border px-3 py-2 text-[12.5px] break-all">{link}</code>
        <button type="button" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); }} className="ledger-btn justify-self-start">{copied ? "Copied" : "Copy the link"}</button>
        <p className="text-[13px] ledger-muted">Shown once. It works once, only for that address, for 14 days.</p></div>}
    </div>
  );
}

export function ApplicationActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function file(next: "reviewing" | "declined" | "new") {
    setBusy(true); setMsg(null);
    const r = await api("PATCH", `/api/v1/desk/partner-applications/${id}`, { status: next });
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: r.message }); return; }
    router.refresh();
  }
  return (
    <div className="flex flex-wrap items-center gap-4 text-[14px]">
      {status === "new" && <button type="button" disabled={busy} onClick={() => file("reviewing")} className="underline underline-offset-2">Mark as reviewing</button>}
      {(status === "new" || status === "reviewing") && <button type="button" disabled={busy} onClick={() => file("declined")} className="underline underline-offset-2 ledger-muted">Decline</button>}
      {status === "declined" && <button type="button" disabled={busy} onClick={() => file("new")} className="underline underline-offset-2 ledger-muted">Reopen</button>}
      <Note m={msg} />
    </div>
  );
}
