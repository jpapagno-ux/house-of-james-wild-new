import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/booking-live/supabase/server";
import { isUuid } from "@/lib/booking-live/validate";

export const metadata = { title: "Your request" };

type Night = { date: string; season: string; totalMinor: number };
type Charge = { id: string; name: string; kind: string; included: boolean; amountMinor: number };

const fmt = (minor: number, currency: string) => {
  const digits = new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  const s = new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(minor / 10 ** digits);
  return currency === "USD" ? s.replace(/^\$/, "US$") : `${s} ${currency}`;
};
const nice = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const STATE: Record<string, [string, string]> = {
  pending: ["Waiting for the house", "Your request is with the house. We're confirming the room with the property and will reply within 24 hours. Nothing has been charged."],
  approved: ["Confirmed by the house", "The property has confirmed the room at this price. The house will send the deposit details."],
  declined: ["Not available", "The property couldn't hold these dates. The house will suggest the closest alternatives."],
};

// Shows a stored, immutable quote. RLS: only its traveler (or an advisor) can read it.
export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { sb, user } = await currentUser();
  if (!user) redirect(`/account/sign-in?next=${encodeURIComponent(`/booking/quote/${id}`)}`);
  const { data: q } = await sb.from("quotes").select("*, property:properties(name, slug)").eq("id", id).maybeSingle();
  if (!q) notFound();
  const [title, line] = STATE[q.advisor_status] ?? STATE.pending;
  const b = q.price_breakdown as { nights: Night[]; discounts: { code: string; label: string; amountMinor: number }[]; charges: Charge[] };
  const p = q.policy_snapshot as { cancellation: { summary: string }; room: { name: string }; plan: { name: string } };
  const cur = q.currency as string;
  const expired = q.advisor_status === "pending" && new Date(q.expires_at) < new Date();
  return (
    <article className="grid gap-6 max-w-3xl">
      <p className="ledger-eyebrow">Request {q.public_reference} · <Link href="/account" className="hover:opacity-60">My Folio</Link></p>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] leading-[1.1]">{p.room?.name} at {(q.property as { name: string } | null)?.name}</h1>
      <div className="border-l-2 ledger-crimson-border pl-4">
        <p className="ledger-display text-xl">{expired ? "This price has expired" : title}</p>
        <p className="text-[15.5px] mt-1">{expired ? "Prices on contracted cards are held for 72 hours. Check your dates again for a fresh price." : line}</p>
      </div>
      <dl className="border-t ledger-rule text-[15px]">
        <div className="flex justify-between py-2.5 border-b ledger-rule"><dt className="ledger-muted">Dates</dt><dd>{nice(q.arrival_date)} → {nice(q.departure_date)}</dd></div>
        <div className="flex justify-between py-2.5 border-b ledger-rule"><dt className="ledger-muted">Guests</dt><dd>{q.adults} adult{q.adults === 1 ? "" : "s"}{q.children ? `, ${q.children} child${q.children === 1 ? "" : "ren"}` : ""}</dd></div>
        <div className="flex justify-between py-2.5 border-b ledger-rule"><dt className="ledger-muted">Rate</dt><dd>{p.plan?.name}</dd></div>
        {b.nights.map((n) => <div key={n.date} className="flex justify-between py-1.5 border-b ledger-border text-[14px]"><dt className="ledger-muted">{nice(n.date)} · {n.season}</dt><dd>{fmt(n.totalMinor, cur)}</dd></div>)}
        {b.discounts.map((d) => <div key={d.code} className="flex justify-between py-2.5 border-b ledger-rule"><dt className="ledger-muted">{d.label}</dt><dd>− {fmt(d.amountMinor, cur)}</dd></div>)}
        {b.charges.filter((c) => !c.included).map((c) => <div key={c.id} className="flex justify-between py-2.5 border-b ledger-rule"><dt className="ledger-muted">{c.name}</dt><dd>{fmt(c.amountMinor, cur)}</dd></div>)}
        <div className="flex justify-between py-3 border-b ledger-rule"><dt className="ledger-display text-xl">Total</dt><dd className="ledger-display text-xl ledger-crimson">{fmt(Number(q.grand_total_minor), cur)}</dd></div>
        <div className="flex justify-between py-2.5 border-b ledger-rule"><dt className="ledger-muted">Deposit to confirm</dt><dd>{fmt(Number(q.deposit_due_minor), cur)}</dd></div>
        {q.balance_due_date && <div className="flex justify-between py-2.5 border-b ledger-rule"><dt className="ledger-muted">Balance due</dt><dd>{nice(q.balance_due_date)}</dd></div>}
      </dl>
      <p className="text-[14.5px]"><strong>Cancellation:</strong> {p.cancellation?.summary}</p>
      <p className="text-[12px] ledger-muted">Price reference {String(q.price_revision).split("#")[1]} · from the house&rsquo;s contracted rate card, confirmed with the property before anything is charged.</p>
      <div className="flex gap-3"><Link href={`/plan?trip=${encodeURIComponent((q.property as { name: string } | null)?.name ?? "")}`} className="ledger-btn">Talk to James</Link></div>
    </article>
  );
}
