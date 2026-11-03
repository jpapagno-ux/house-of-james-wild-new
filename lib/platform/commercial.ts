// Partner commercial data (D-26, James, 3 Nov 2026): currencies, banking details, cancellation and
// refund policies. Pure: shared by the pages, the API routes and the tests.

/** Currencies the desk offers (ISO 4217): the house's markets first, then the rest A to Z. */
export const CURRENCIES: { code: string; name: string }[] = [
  { code: "USD", name: "US dollar" }, { code: "ZAR", name: "South African rand" }, { code: "IDR", name: "Indonesian rupiah" },
  { code: "EUR", name: "Euro" }, { code: "GBP", name: "British pound" },
  { code: "AUD", name: "Australian dollar" }, { code: "BRL", name: "Brazilian real" }, { code: "BWP", name: "Botswana pula" },
  { code: "CAD", name: "Canadian dollar" }, { code: "CHF", name: "Swiss franc" }, { code: "CNY", name: "Chinese yuan" },
  { code: "CRC", name: "Costa Rican colón" }, { code: "EGP", name: "Egyptian pound" }, { code: "INR", name: "Indian rupee" },
  { code: "ISK", name: "Icelandic króna" }, { code: "JPY", name: "Japanese yen" }, { code: "KES", name: "Kenyan shilling" },
  { code: "MAD", name: "Moroccan dirham" }, { code: "MUR", name: "Mauritian rupee" }, { code: "MXN", name: "Mexican peso" },
  { code: "MYR", name: "Malaysian ringgit" }, { code: "NAD", name: "Namibian dollar" }, { code: "NOK", name: "Norwegian krone" },
  { code: "NZD", name: "New Zealand dollar" }, { code: "PHP", name: "Philippine peso" }, { code: "RWF", name: "Rwandan franc" },
  { code: "SCR", name: "Seychelles rupee" }, { code: "SEK", name: "Swedish krona" }, { code: "SGD", name: "Singapore dollar" },
  { code: "THB", name: "Thai baht" }, { code: "TZS", name: "Tanzanian shilling" }, { code: "UGX", name: "Ugandan shilling" },
  { code: "VND", name: "Vietnamese dong" }, { code: "XPF", name: "CFP franc (French Polynesia)" }, { code: "ZMW", name: "Zambian kwacha" },
];
const CODES = new Set(CURRENCIES.map((c) => c.code));
export const MAX_OTHER_CURRENCIES = 6;

type Fail = { ok: false; message: string; field: string };
const fail = (message: string, field: string): Fail => ({ ok: false, message, field });
const str = (raw: Record<string, unknown>, k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");

export function parseCurrencies(raw: Record<string, unknown>): { ok: true; value: { primary_currency: string; other_currencies: string[] } } | Fail {
  const primary = str(raw, "primaryCurrency").toUpperCase();
  if (!CODES.has(primary)) return fail("Choose your main currency", "primaryCurrency");
  const list = Array.isArray(raw.otherCurrencies) ? raw.otherCurrencies : [];
  const others = [...new Set(list.map((c) => String(c).toUpperCase()))].filter((c) => c !== primary);
  if (others.some((c) => !CODES.has(c))) return fail("Choose currencies from the list", "otherCurrencies");
  if (others.length > MAX_OTHER_CURRENCIES) return fail(`Up to ${MAX_OTHER_CURRENCIES} other currencies`, "otherCurrencies");
  return { ok: true, value: { primary_currency: primary, other_currencies: others } };
}

// ===== banking details
export type BankInput = {
  currency: string; account_holder: string; bank_name: string; bank_country: string; bank_address: string | null;
  account_number: string | null; iban: string | null; swift_bic: string | null; routing_code: string | null; intermediary_bank: string | null; note: string | null;
};
export function parseBankAccount(raw: Record<string, unknown>): { ok: true; value: BankInput } | Fail {
  const currency = str(raw, "currency").toUpperCase();
  if (!CODES.has(currency)) return fail("Choose the account's currency", "currency");
  const account_holder = str(raw, "accountHolder");
  if (account_holder.length < 2 || account_holder.length > 160) return fail("Enter the account holder's name, as the bank has it", "accountHolder");
  const bank_name = str(raw, "bankName");
  if (bank_name.length < 2 || bank_name.length > 160) return fail("Enter the bank's name", "bankName");
  const bank_country = str(raw, "bankCountry").toUpperCase();
  if (!/^[A-Z]{2}$/.test(bank_country)) return fail("Use the two-letter country code, like ZA or ID", "bankCountry");
  const account_number = str(raw, "accountNumber").replace(/\s+/g, " ") || null;
  if (account_number && !/^[A-Za-z0-9 -]{4,40}$/.test(account_number)) return fail("Use letters, digits, spaces and dashes only", "accountNumber");
  const iban = str(raw, "iban").replace(/[\s-]/g, "").toUpperCase() || null;
  if (iban && !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/.test(iban)) return fail("That IBAN doesn't look right", "iban");
  if (iban && !ibanChecksum(iban)) return fail("That IBAN doesn't check out. Please copy it again from the bank letter", "iban");
  if (!account_number && !iban) return fail("Enter the account number or the IBAN", "accountNumber");
  const swift_bic = str(raw, "swiftBic").replace(/\s+/g, "").toUpperCase() || null;
  if (swift_bic && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift_bic)) return fail("A SWIFT/BIC code has 8 or 11 characters", "swiftBic");
  const routing_code = str(raw, "routingCode") || null;
  if (routing_code && !/^[A-Za-z0-9 -]{3,20}$/.test(routing_code)) return fail("Use letters, digits, spaces and dashes only", "routingCode");
  const cap = (k: string, n: number) => str(raw, k).slice(0, n) || null;
  return { ok: true, value: { currency, account_holder, bank_name, bank_country, bank_address: cap("bankAddress", 400), account_number, iban, swift_bic, routing_code, intermediary_bank: cap("intermediaryBank", 400), note: cap("note", 500) } };
}
/** ISO 13616 mod-97 check. */
export function ibanChecksum(iban: string): boolean {
  const s = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rem = 0;
  for (const ch of s) rem = (rem * 10 + Number(ch)) % 97;
  return rem === 1;
}
/** Never show a full number on screen: "…7890". */
export const maskNumber = (v: string | null) => (v ? `…${v.replace(/[\s-]/g, "").slice(-4)}` : "—");

// ===== cancellation and refund policies
export const POLICY_KINDS = ["cancellation", "refund"] as const;
export type PolicyKind = (typeof POLICY_KINDS)[number];
export const POLICY_LABEL: Record<PolicyKind, string> = { cancellation: "Cancellation policy", refund: "Refund policy" };
export const POLICY_STATUS: Record<string, { label: string; tone: "progress" | "good" | "attention" | "neutral" }> = {
  submitted: { label: "With the house", tone: "progress" }, approved: { label: "Approved", tone: "good" },
  rejected: { label: "Returned", tone: "attention" }, superseded: { label: "Replaced", tone: "neutral" },
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type PolicyInput = { kind: PolicyKind; property_id: string | null; body: string | null; document_id: string | null; effective_from: string | null };
export function parsePolicy(raw: Record<string, unknown>): { ok: true; value: PolicyInput } | Fail {
  const kind = str(raw, "kind") as PolicyKind;
  if (!POLICY_KINDS.includes(kind)) return fail("Cancellation or refund", "kind");
  const property_id = str(raw, "propertyId") || null;
  if (property_id && !UUID.test(property_id)) return fail("Choose a property", "propertyId");
  const document_id = str(raw, "documentId") || null;
  if (document_id && !UUID.test(document_id)) return fail("Choose a document", "documentId");
  const body = str(raw, "body").slice(0, 8000) || null;
  if (!body && !document_id) return fail("Write the policy or attach the document that sets it out", "body");
  const effective_from = str(raw, "effectiveFrom") || null;
  if (effective_from && !/^\d{4}-\d{2}-\d{2}$/.test(effective_from)) return fail("Use a date", "effectiveFrom");
  return { ok: true, value: { kind, property_id, body, document_id, effective_from } };
}

// ===== document expiry reminders (sent by the daily job)
export const REMINDER_STAGE_LABEL: Record<string, string> = { "60_days": "expires in two months", "30_days": "expires within a month", expired: "has expired" };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export function reminderEmail(o: { organization: string; title: string; kind: string; expiresOn: string; stage: string; link: string }) {
  const when = new Date(o.expiresOn + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const what = REMINDER_STAGE_LABEL[o.stage] ?? "needs renewing";
  const ask = o.kind === "contract" ? "Your James Wild & Co contact will be in touch about renewing the agreement." : "Please upload the renewed version on the Partner Desk.";
  const subject = `${o.title} ${what} · ${o.organization}`.slice(0, 180);
  const text = [`${o.title} for ${o.organization} ${what} (${when}).`, "", ask, "", o.link, "", "James Wild & Co · Partner Desk"].join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#1A1816;max-width:560px">
<p style="font:11px/1.4 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#8B2525;margin:0 0 8px">James Wild &amp; Co · Partner Desk</p>
<h1 style="font-size:22px;font-weight:normal;margin:0 0 12px">${esc(o.title)} ${esc(what)}</h1>
<p style="font-size:16px;line-height:1.5;margin:0 0 6px">${esc(o.organization)} · ${esc(when)}</p>
<p style="font-size:16px;line-height:1.5;margin:0 0 20px">${esc(ask)}</p>
<p style="margin:0"><a href="${esc(o.link)}" style="display:inline-block;border:1px solid #1A1816;color:#1A1816;text-decoration:none;font:12px Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;padding:12px 20px">Open your documents</a></p></div>`;
  return { subject, text, html };
}
