// Booking Live emails, pure: the words the traveler and the house receive at
// each step. Sent from myfolio@ with the reference in the subject (James, 25
// Oct 2026). No imports, so plain Node tests them (tests/notify.test.ts).

export type Mail = { subject: string; text: string; html: string };
export type Money = { minor: number | string; currency: string };
export type Stay = { propertyName: string; roomName: string | null; arrival: string; departure: string; adults: number; children: number };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export const money = ({ minor, currency }: Money) => { const d = new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2; const s = new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(Number(minor) / 10 ** d); return currency === "USD" ? s.replace(/^\$/, "US$") : `${s} ${currency}`; };
const nice = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const party = (s: Stay) => `${s.adults} adult${s.adults === 1 ? "" : "s"}${s.children ? `, ${s.children} child${s.children === 1 ? "" : "ren"}` : ""}`;
const where = (s: Stay) => `${s.roomName ? `${s.roomName} at ` : ""}${s.propertyName}`;

function wrap(eyebrow: string, title: string, paras: string[], cta: { label: string; url: string } | null, foot: string): string {
  return `<div style="font-family:Georgia,serif;color:#2D2A26;max-width:620px"><p style="font:12px/1.4 monospace;letter-spacing:.12em;text-transform:uppercase;color:#8B2525;margin:0 0 6px">${esc(eyebrow)}</p><h1 style="font-size:22px;margin:0 0 16px">${esc(title)}</h1>${paras.map((p) => `<p style="font-size:16px;line-height:1.5">${p}</p>`).join("")}${cta ? `<p style="margin:20px 0"><a href="${esc(cta.url)}" style="display:inline-block;padding:10px 18px;border:1px solid #8B2525;color:#8B2525;text-decoration:none;font:12px/1 monospace;letter-spacing:.14em;text-transform:uppercase">${esc(cta.label)}</a></p>` : ""}<p style="font-size:12px;color:#8a857d;margin-top:24px">${esc(foot)}</p></div>`;
}
const lines = (s: Stay) => [`${where(s)}`, `${nice(s.arrival)} → ${nice(s.departure)} · ${party(s)}`];
const FOOT = "James Wild & Co · Nothing is charged without you; the house confirms every room with the property first.";

/** To the traveler: Request to Reserve received. */
export function requestReceived(o: { first: string | null; reference: string; stay: Stay; total: Money; deposit: Money; expiresAt: string; tripsUrl: string }): Mail {
  const subject = `Your request ${o.reference} · ${o.stay.propertyName}`;
  const body = [`Dear ${o.first ?? "there"},`, `Your request is with the house: ${lines(o.stay).join(" · ")}.`, `Total ${money(o.total)} with every tax shown; deposit to confirm ${money(o.deposit)}. This price is held until ${new Date(o.expiresAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC.`, `We confirm the room with the property and reply within 24 hours. Nothing has been charged.`];
  return { subject, text: [...body, "", o.tripsUrl, "", FOOT].join("\n"), html: wrap("Request received", `${o.reference} · ${where(o.stay)}`, body.map(esc), { label: "See your trips", url: o.tripsUrl }, FOOT) };
}

/** To the house: a new request to work. */
export function requestForHouse(o: { reference: string; travelerName: string; travelerEmail: string | null; stay: Stay; total: Money; deposit: Money; deskUrl: string }): Mail {
  const subject = `Request ${o.reference}: ${o.travelerName} · ${where(o.stay)}`;
  const body = [`${o.travelerName}${o.travelerEmail ? ` (${o.travelerEmail})` : ""} asks to reserve ${lines(o.stay).join(" · ")}.`, `Stored quote ${money(o.total)} · deposit ${money(o.deposit)}. Confirm the room with the property, then Hold / Confirm / Decline on the desk.`];
  return { subject, text: [...body, "", o.deskUrl].join("\n"), html: wrap("New request", subject, body.map(esc), { label: "Open the desk", url: o.deskUrl }, "Booking Live · Advisor Desk") };
}

/** To the traveler: room on hold until a date. */
export function roomHeld(o: { first: string | null; reference: string; stay: Stay; heldUntil: string; note: string | null; tripsUrl: string }): Mail {
  const until = new Date(o.heldUntil).toLocaleString("en-US", { dateStyle: "medium", timeZone: "UTC" });
  const subject = `Room on hold until ${until} · ${o.reference} · ${o.stay.propertyName}`;
  const body = [`Dear ${o.first ?? "there"},`, `${o.stay.propertyName} is holding ${o.stay.roomName ?? "the room"} for you (${nice(o.stay.arrival)} → ${nice(o.stay.departure)}) until ${until}.`, ...(o.note ? [o.note] : []), `Say the word and the house confirms it; nothing is charged until then.`];
  return { subject, text: [...body, "", o.tripsUrl, "", FOOT].join("\n"), html: wrap("Room on hold", subject, body.map(esc), { label: "See your trips", url: o.tripsUrl }, FOOT) };
}

/** To the traveler: confirmed by the house (price and room), or declined. */
export function decision(o: { first: string | null; reference: string; stay: Stay; decision: "approved" | "declined"; total: Money; deposit: Money; tripsUrl: string }): Mail {
  if (o.decision === "declined") {
    const subject = `Those dates aren't available · ${o.reference} · ${o.stay.propertyName}`;
    const body = [`Dear ${o.first ?? "there"},`, `${o.stay.propertyName} couldn't hold ${o.stay.roomName ?? "the room"} for ${nice(o.stay.arrival)} → ${nice(o.stay.departure)}.`, `The house will come back with the closest alternatives; reply to this email with anything that would help.`];
    return { subject, text: [...body, "", o.tripsUrl, "", FOOT].join("\n"), html: wrap("Not available", subject, body.map(esc), { label: "See your trips", url: o.tripsUrl }, FOOT) };
  }
  const subject = `Confirmed by the house · ${o.reference} · ${o.stay.propertyName}`;
  const body = [`Dear ${o.first ?? "there"},`, `${o.stay.propertyName} has confirmed ${o.stay.roomName ?? "the room"} for ${nice(o.stay.arrival)} → ${nice(o.stay.departure)} at ${money(o.total)}.`, `A deposit of ${money(o.deposit)} secures it. The house records the booking and sends the payment details next.`];
  return { subject, text: [...body, "", o.tripsUrl, "", FOOT].join("\n"), html: wrap("Confirmed", subject, body.map(esc), { label: "See your trips", url: o.tripsUrl }, FOOT) };
}

/** To the traveler: the booking is recorded. */
export function bookingRecorded(o: { first: string | null; reference: string; stay: Stay; total: Money; deposit: Money; balanceDue: string | null; partnerRef: string | null; note: string | null; payUrl: string; canPayOnline: boolean }): Mail {
  const subject = `Booked · ${o.reference} · ${o.stay.propertyName}`;
  const body = [`Dear ${o.first ?? "there"},`, `Your booking is recorded: ${lines(o.stay).join(" · ")}.${o.partnerRef ? ` ${o.stay.propertyName}'s reference: ${o.partnerRef}.` : ""}`, `Total ${money(o.total)} · deposit ${money(o.deposit)}${o.balanceDue ? ` · balance due ${nice(o.balanceDue)}` : ""}.`, o.canPayOnline ? `Pay the deposit from your trips whenever you're ready.` : `The house will send the deposit details.`, ...(o.note ? [o.note] : [])];
  return { subject, text: [...body, "", o.payUrl, "", FOOT].join("\n"), html: wrap("Booked", subject, body.map(esc), { label: o.canPayOnline ? "Pay the deposit" : "See your trips", url: o.payUrl }, FOOT) };
}

/** To the traveler: a payment settled (receipt). */
export function paymentReceived(o: { first: string | null; reference: string; receipt: string; stay: Stay; kind: string; amount: Money; paid: Money; outstanding: Money; balanceDue: string | null; tripsUrl: string }): Mail {
  const what = o.kind === "deposit" ? "Deposit" : o.kind === "balance" ? "Balance" : "Payment";
  const subject = `${what} received · ${money(o.amount)} · ${o.reference} · ${o.stay.propertyName}`;
  const settled = Number(o.outstanding.minor) <= 0;
  const body = [`Dear ${o.first ?? "there"},`, `Thank you. ${what} of ${money(o.amount)} received for ${where(o.stay)}, ${nice(o.stay.arrival)} → ${nice(o.stay.departure)}. Receipt ${o.receipt}.`, settled ? `Your booking is paid in full. The house sends your travel documents before you go.` : `Paid so far ${money(o.paid)}; ${money(o.outstanding)} remains${o.balanceDue ? `, due ${nice(o.balanceDue)}` : ""}.`];
  return { subject, text: [...body, "", o.tripsUrl, "", FOOT].join("\n"), html: wrap("Receipt", subject, body.map(esc), { label: "See your trips", url: o.tripsUrl }, FOOT) };
}

/** To the house: money arrived. */
export function paymentForHouse(o: { reference: string; receipt: string; travelerName: string; stay: Stay; kind: string; amount: Money; provider: string; outstanding: Money; deskUrl: string }): Mail {
  const subject = `${o.kind} received ${money(o.amount)} · ${o.reference} · ${o.travelerName} · ${o.stay.propertyName}`;
  const body = [`${o.travelerName} paid ${money(o.amount)} (${o.provider}, receipt ${o.receipt}) on ${where(o.stay)}, ${nice(o.stay.arrival)} → ${nice(o.stay.departure)}.`, Number(o.outstanding.minor) <= 0 ? "The booking is paid in full." : `${money(o.outstanding)} remains.`];
  return { subject, text: [...body, "", o.deskUrl].join("\n"), html: wrap("Payment", subject, body.map(esc), { label: "Open the desk", url: o.deskUrl }, "Booking Live · Advisor Desk") };
}
