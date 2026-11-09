// Advisor Desk · Step 3 · the advisor's file. Pure helpers, no imports, so plain Node can test them.
// The database decides who may read and write (supabase/migrations/*_advisor_onboarding.sql); these
// shape the forms, the document paths, the agreement text on screen, and the checklist.

export type FileState = {
  details: boolean; plan: boolean; agreement: boolean; agreement_placeholder: boolean;
  tax_form: boolean; eo_insurance: boolean; tax_form_accepted: boolean; eo_insurance_accepted: boolean;
  dna: boolean; dna_approved: boolean;
};

export type StepKey = "details" | "plan" | "agreement" | "documents" | "dna";
export type Step = { key: StepKey; title: string; line: string; href: string; done: boolean; waiting: boolean };

/** The five parts of the file, in the order an advisor does them. */
export function fileSteps(s: FileState): Step[] {
  const docsFiled = s.tax_form && s.eo_insurance;
  const docsAccepted = s.tax_form_accepted && s.eo_insurance_accepted;
  return [
    { key: "details", title: "Your details", line: "Name, address, registration and insurance, as the agreement's Schedule B.", href: "/advisor/file/details", done: s.details, waiting: false },
    { key: "plan", title: "Your compensation plan", line: "Your tier, your share, the program fee and how you are paid.", href: "/advisor/file/plan", done: s.plan, waiting: false },
    { key: "agreement", title: "The Independent Marketing Agreement", line: "Read it in full and sign with your legal name.", href: "/advisor/file/agreement", done: s.agreement, waiting: false },
    { key: "documents", title: "Your documents", line: "Your tax form and errors and omissions insurance; registrations and certificates as they apply.", href: "/advisor/file/documents", done: docsFiled, waiting: docsFiled && !docsAccepted },
    { key: "dna", title: "Your Advisor DNA", line: "Your Pathways, the countries you know first-hand and the stays you have slept at: what the website shows travellers.", href: "/advisor/file/dna", done: s.dna, waiting: s.dna && !s.dna_approved },
  ];
}

export const fileComplete = (s: FileState) => s.details && s.plan && s.agreement && s.tax_form && s.eo_insurance && s.dna;
export const readyToActivate = (s: FileState) => s.details && s.plan && s.agreement && s.tax_form_accepted && s.eo_insurance_accepted && s.dna_approved;

// ===== details (Schedule B)
export type Details = {
  legal_name: string; business_name: string | null; entity_type: string | null; mailing_address: string; notice_email: string;
  mobile: string | null; residence_state: string | null; residence_country: string; sot_registration: string | null; memberships: string | null;
  eo_insurer: string | null; eo_policy_number: string | null; eo_expires_on: string | null; years_selling: number | null; languages: string[]; specialties: string | null;
};
export const ENTITY_TYPES: [string, string][] = [["individual", "Individual"], ["llc", "LLC"], ["corporation", "Corporation"], ["partnership", "Partnership"], ["other", "Other"]];
type Result<T> = { ok: true; value: T } | { ok: false; message: string; field: string };

// Looks like a tax or bank number: 9+ digits in a row once spaces and dashes go. Those never go in the form.
const looksLikeNumberId = (v: string) => /\d{9,}/.test(v.replace(/[\s-]/g, ""));

export function parseDetails(f: Record<string, unknown>): Result<Details> {
  const s = (k: string, max: number) => (typeof f[k] === "string" ? (f[k] as string).trim().replace(/\s+/g, " ").slice(0, max) : "");
  const opt = (k: string, max: number) => s(k, max) || null;
  const legal_name = s("legal_name", 160);
  if (legal_name.length < 2) return { ok: false, message: "Enter your full legal name", field: "legal_name" };
  const mailing_address = typeof f.mailing_address === "string" ? f.mailing_address.trim().slice(0, 400) : "";
  if (mailing_address.length < 5) return { ok: false, message: "Enter your mailing address", field: "mailing_address" };
  const notice_email = s("notice_email", 254).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(notice_email)) return { ok: false, message: "Enter an email for notices", field: "notice_email" };
  const residence_country = s("residence_country", 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(residence_country)) return { ok: false, message: "Choose your country of residence", field: "residence_country" };
  const entity_type = opt("entity_type", 20);
  if (entity_type && !ENTITY_TYPES.some(([k]) => k === entity_type)) return { ok: false, message: "Choose how you trade", field: "entity_type" };
  const eo_expires_on = opt("eo_expires_on", 10);
  if (eo_expires_on && !/^\d{4}-\d{2}-\d{2}$/.test(eo_expires_on)) return { ok: false, message: "Use a full date", field: "eo_expires_on" };
  const ys = s("years_selling", 3);
  const years_selling = ys ? Number(ys) : null;
  if (years_selling !== null && (!Number.isInteger(years_selling) || years_selling < 0 || years_selling > 80)) return { ok: false, message: "Years selling travel, as a whole number", field: "years_selling" };
  const languages = s("languages", 300).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 20);
  const out: Details = {
    legal_name, business_name: opt("business_name", 160), entity_type, mailing_address, notice_email, mobile: opt("mobile", 40),
    residence_state: opt("residence_state", 80), residence_country, sot_registration: opt("sot_registration", 160), memberships: opt("memberships", 300),
    eo_insurer: opt("eo_insurer", 160), eo_policy_number: opt("eo_policy_number", 80), eo_expires_on, years_selling, languages,
    specialties: typeof f.specialties === "string" ? f.specialties.trim().slice(0, 1000) || null : null,
  };
  for (const k of ["business_name", "mobile", "sot_registration", "memberships", "eo_insurer", "specialties"] as const) {
    const v = out[k];
    if (k !== "mobile" && typeof v === "string" && looksLikeNumberId(v)) return { ok: false, message: "Leave tax and bank numbers out; they go only on your uploaded tax form", field: k };
  }
  return { ok: true, value: out };
}

// ===== documents
export type AdvDocKind = "tax_form" | "seller_of_travel" | "eo_insurance" | "business_registration" | "certificate" | "other" | "portrait";
export const ADV_DOC_KINDS: { key: AdvDocKind; label: string; line: string; required: boolean }[] = [
  { key: "tax_form", label: "Tax form", line: "Form W-9 in the United States, or Form W-8BEN outside it.", required: true },
  { key: "eo_insurance", label: "Errors and omissions insurance", line: "The current certificate, showing the insurer, the amount and the expiry.", required: true },
  { key: "seller_of_travel", label: "Seller of travel registration", line: "Florida independent agent registration, or what your state requires.", required: false },
  { key: "business_registration", label: "Business registration", line: "If you trade through an LLC or company.", required: false },
  { key: "certificate", label: "Certificate", line: "Destination training or professional certificates.", required: false },
  { key: "portrait", label: "Portrait", line: "A recent photograph of you for your card: JPG or PNG, at least 1200 pixels tall, natural light, no logo. You confirm you may let the house use it.", required: false },
  { key: "other", label: "Other", line: "Anything else the house asks you for.", required: false },
];
export const ADV_DOC_LABEL = Object.fromEntries(ADV_DOC_KINDS.map((k) => [k.key, k.label])) as Record<AdvDocKind, string>;
export const ADV_MAX_BYTES = 20 * 1024 * 1024;
export const ADV_MIME: Record<string, string> = { "application/pdf": "PDF", "image/jpeg": "JPG", "image/png": "PNG" };

export function safeName(name: string): string {
  const base = (name || "document").normalize("NFKD").replace(/[̀-ͯ]/g, "");
  const dot = base.lastIndexOf(".");
  const stem = (dot > 0 ? base.slice(0, dot) : base).replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "document";
  const ext = dot > 0 ? base.slice(dot + 1).replace(/[^A-Za-z0-9]/g, "").toLowerCase().slice(0, 8) : "";
  return ext ? `${stem}.${ext}` : stem;
}
/** <advisor_id>/<kind>/<id8>-<file>, matching the table's check. */
export const advisorDocPath = (advisorId: string, kind: AdvDocKind, fileName: string, id: string) =>
  `${advisorId}/${kind}/${id.replace(/-/g, "").slice(0, 8)}-${safeName(fileName)}`;

export function parseDocument(f: Record<string, unknown>, file: { name: string; type: string; size: number } | null): Result<{ kind: AdvDocKind; title: string; expiresOn: string | null; note: string | null; mime: string }> {
  const s = (k: string) => (typeof f[k] === "string" ? (f[k] as string).trim() : "");
  const kind = s("kind") as AdvDocKind;
  if (!ADV_DOC_KINDS.some((k) => k.key === kind)) return { ok: false, message: "Choose what this document is", field: "kind" };
  const title = s("title").slice(0, 160) || ADV_DOC_LABEL[kind];
  const expiresOn = s("expiresOn") || null;
  if (expiresOn && !/^\d{4}-\d{2}-\d{2}$/.test(expiresOn)) return { ok: false, message: "Use a full date", field: "expiresOn" };
  if (!file || !file.size) return { ok: false, message: "Choose a file to upload", field: "file" };
  if (file.size > ADV_MAX_BYTES) return { ok: false, message: "Files can be up to 20 MB", field: "file" };
  if (!ADV_MIME[file.type]) return { ok: false, message: "Upload a PDF, JPG or PNG", field: "file" };
  if (kind === "portrait" && file.type === "application/pdf") return { ok: false, message: "Upload your portrait as a JPG or PNG", field: "file" };
  return { ok: true, value: { kind, title, expiresOn, note: s("note").slice(0, 1000) || null, mime: file.type } };
}

// ===== the agreement on screen: "## " lines are headings, blank lines separate paragraphs. Plain text only.
export type AgreementBlock = { kind: "heading" | "para"; text: string };
export function agreementBlocks(body: string): AgreementBlock[] {
  return body.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
    .map((b) => (b.startsWith("## ") ? { kind: "heading" as const, text: b.slice(3).trim() } : { kind: "para" as const, text: b.replace(/\s*\n\s*/g, " ") }));
}
export const sameName = (a: string, b: string) => a.trim().replace(/\s+/g, " ").toLowerCase() === b.trim().replace(/\s+/g, " ").toLowerCase();

// ===== the plan in words
export type Plan = { tier: string; tier_assigned: boolean; share_bp: number; program_fee_minor: number | null; fee_currency: string; fee_period: "none" | "month" | "year"; payment_terms: string | null };
export const TIER_NAME: Record<string, string> = { tier_1: "Tier 1", tier_2: "Tier 2", tier_3: "Tier 3" };
export function feeText(p: Pick<Plan, "program_fee_minor" | "fee_currency" | "fee_period">): string {
  if (p.fee_period === "none" || !p.program_fee_minor) return "No program fee";
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: p.fee_currency, maximumFractionDigits: p.program_fee_minor % 100 ? 2 : 0 }).format(p.program_fee_minor / 100).replace(/ /g, " ");
  return `${amount} a ${p.fee_period}`;
}
/** The worked example on a $10,000 commissionable amount at a 20% supplier commission. */
export function example(shareBp: number) {
  const gross = 2000_00; // 20% of $10,000, in cents
  const advisor = Math.round((gross * shareBp) / 10000);
  return { commissionable: 10000_00, supplierRateBp: 2000, gross, advisor, house: gross - advisor };
}
