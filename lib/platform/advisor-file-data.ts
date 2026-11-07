import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FileState, Plan } from "./advisor-file";

// Reads for the advisor's file, as the advisor (or the house): the database returns only what the
// caller may see.
export const EMPTY_STATE: FileState = { details: false, plan: false, agreement: false, agreement_placeholder: true, tax_form: false, eo_insurance: false, tax_form_accepted: false, eo_insurance_accepted: false, dna: false, dna_approved: false };

export async function myFileState(sb: SupabaseClient): Promise<FileState> {
  const { data } = await sb.rpc("my_advisor_file_state");
  return { ...EMPTY_STATE, ...((data as Partial<FileState>) ?? {}) };
}
export async function myPlan(sb: SupabaseClient): Promise<Plan | null> {
  const { data } = await sb.rpc("my_advisor_plan");
  return (data as Plan) ?? null;
}
export type Agreement = { id: string; version: string; title: string; body: string; status: string; is_placeholder: boolean; published_at: string | null };
export async function currentAgreement(sb: SupabaseClient): Promise<Agreement | null> {
  const { data } = await sb.from("advisor_agreements").select("id, version, title, body, status, is_placeholder, published_at").eq("status", "current").maybeSingle();
  return (data as Agreement) ?? null;
}
export type Signature = { id: string; agreement_id: string; version: string; typed_name: string; body_sha256: string; signed_at: string; aal: string };
export async function signatures(sb: SupabaseClient, advisorId: string): Promise<Signature[]> {
  const { data } = await sb.from("advisor_signatures").select("id, agreement_id, version, typed_name, body_sha256, signed_at, aal").eq("advisor_id", advisorId).order("signed_at", { ascending: false });
  return (data ?? []) as Signature[];
}
export type AdvDoc = { id: string; kind: string; title: string; mime_type: string; size_bytes: number; expires_on: string | null; status: string; note: string | null; house_note: string | null; created_at: string; decided_at: string | null };
export async function documents(sb: SupabaseClient, advisorId: string): Promise<AdvDoc[]> {
  const { data } = await sb.from("advisor_documents").select("id, kind, title, mime_type, size_bytes, expires_on, status, note, house_note, created_at, decided_at").eq("advisor_id", advisorId).neq("status", "archived").order("created_at", { ascending: false });
  return (data ?? []) as AdvDoc[];
}

// ===== Advisor DNA (part five)
export type DnaRow = { pathways: string[]; volumes: string[]; party_types: string[]; countries: string[]; languages: string[]; specialties: string[]; availability: "open" | "waitlist" | "closed"; match_note: string | null; marks: import("./advisor-dna").DnaMark[]; approved_at: string; confirmed_at: string };
export type DnaProposal = { id: string; payload: import("./advisor-dna").DnaInput; status: string; house_note: string | null; created_at: string; decided_at: string | null };
export async function publishedDna(sb: SupabaseClient, advisorId: string): Promise<DnaRow | null> {
  const { data } = await sb.from("advisor_dna").select("pathways, volumes, party_types, countries, languages, specialties, availability, match_note, marks, approved_at, confirmed_at").eq("advisor_id", advisorId).maybeSingle();
  return (data as DnaRow) ?? null;
}
export async function dnaProposals(sb: SupabaseClient, advisorId: string): Promise<DnaProposal[]> {
  const { data } = await sb.from("advisor_dna_proposals").select("id, payload, status, house_note, created_at, decided_at").eq("advisor_id", advisorId).neq("status", "withdrawn").order("created_at", { ascending: false }).limit(5);
  return (data ?? []) as DnaProposal[];
}
