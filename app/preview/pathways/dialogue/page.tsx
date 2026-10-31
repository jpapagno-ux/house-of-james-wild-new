import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { PreviewNote } from "@/components/record/Sections";
import { DIALOGUE, DIALOGUE_SUMMARY } from "@/lib/content/dialogue-register";
import { DIALOGUE_ASSETS, type DialogueLine } from "@/lib/content/dialogue";
import { buildMetadata } from "@/lib/seo";

// PREVIEW · the James & Iggi dialogue register (Phase 2F, brief §6), laid
// out for James to review: every line the register knows, its source, its
// approval state, and the asset inventory. Nothing here is a new rendering
// of dialogue on live pages; it is the index James approves from. Noindex.

export const metadata = buildMetadata({ title: "James & Iggi dialogue register (preview)", description: "Every James and Iggi line the site knows, with source and approval state.", path: "/preview/pathways/dialogue", noindex: true });

const STATUS: Record<DialogueLine["approval"]["status"], string> = { approved: "bg-ink text-paper", draft: "bg-paper-card ledger-muted", retired: "line-through ledger-muted" };

function Row({ l }: { l: DialogueLine }) {
  return (
    <li className="grid gap-2 py-4 border-b ledger-border md:grid-cols-[7rem_1fr_14rem] md:gap-6">
      <div className="text-[11px] tracking-[0.14em] uppercase ledger-eyebrow">
        <span className={`inline-block px-2 py-0.5 ${STATUS[l.approval.status]}`}>{l.approval.status}</span>
        <p className="mt-2">{l.character === "james" ? "James" : "Iggi"} · {l.intent}</p>
        {l.origin && <p className="mt-1 normal-case tracking-normal">origin: {l.origin}</p>}
      </div>
      <div>
        <p className={`${l.character === "james" ? "ledger-display italic text-[18px]" : "text-[15px]"} leading-snug`}>{l.text}</p>
        <p className="text-[12px] ledger-muted mt-1.5">{l.context.page}{l.context.record ? ` · ${l.context.record}` : ""}{l.context.volume ? ` · ${l.context.volume}` : ""}{l.context.pathway ? ` · ${l.context.pathway}` : ""} · {l.audience} · {l.tone}</p>
      </div>
      <div className="text-[12px] ledger-muted">
        <p>{l.source.kind}{l.source.ref ? ` → ${l.source.ref}` : ""}</p>
        <p className="mt-1">{l.approval.by ? `${l.approval.by}, ${l.approval.on}` : l.approval.note}</p>
        {l.asset && <p className="mt-1">asset: {l.asset}</p>}
      </div>
    </li>
  );
}

export default function DialogueRegisterPreview() {
  const james = DIALOGUE.filter((l) => l.character === "james");
  const iggi = DIALOGUE.filter((l) => l.character === "iggi");
  const standing = iggi.filter((l) => l.source.kind !== "iggi-sample");
  const samples = iggi.filter((l) => l.source.kind === "iggi-sample");
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Previews", path: "/preview/pathways" }, { name: "Dialogue", path: "/preview/pathways/dialogue" }]} />
          <header className="mt-6 max-w-3xl">
            <p className="ledger-eyebrow ledger-crimson">James &amp; Iggi · dialogue register preview</p>
            <h1 className="ledger-display text-[2.6rem] md:text-[3.4rem] leading-[1.02] mt-3">Who says what, and on whose word.</h1>
            <p className="mt-5 text-[17px] leading-relaxed ledger-muted">{DIALOGUE_SUMMARY.total} lines on the register: {DIALOGUE_SUMMARY.approved} approved, {DIALOGUE_SUMMARY.draft} draft. {DIALOGUE_SUMMARY.james} are James&rsquo;s, {DIALOGUE_SUMMARY.iggi} are Iggi&rsquo;s. Only approved lines can render; a James line must trace to a verdict, his own words or a Voice Bank pick; Iggi never claims field experience in the first person and labels every answer by origin.</p>
          </header>
          <PreviewNote>Register preview for James&rsquo;s review. Nothing on this page is a new rendering of dialogue on live pages; approving a line here is what lets it render later.</PreviewNote>

          <section className="mt-12" aria-labelledby="james-h">
            <p className="ledger-eyebrow">James</p>
            <h2 id="james-h" className="ledger-display text-[2rem] mt-2">Verdicts and sign-offs</h2>
            <ul className="mt-4">{james.map((l) => <Row key={l.id} l={l} />)}</ul>
          </section>

          <section className="mt-12" aria-labelledby="standing-h">
            <p className="ledger-eyebrow">Iggi · standing lines</p>
            <h2 id="standing-h" className="ledger-display text-[2rem] mt-2">Proposed for approval</h2>
            <p className="text-[14px] ledger-muted mt-2 max-w-2xl">Six lines Iggi would say anywhere, written to the house rules. Draft until James approves each one.</p>
            <ul className="mt-4">{standing.map((l) => <Row key={l.id} l={l} />)}</ul>
          </section>

          <section className="mt-12" aria-labelledby="samples-h">
            <p className="ledger-eyebrow">Iggi · samples</p>
            <h2 id="samples-h" className="ledger-display text-[2rem] mt-2">From /plan/iggi, labelled as samples</h2>
            <ul className="mt-4">{samples.map((l) => <Row key={l.id} l={l} />)}</ul>
          </section>

          <section className="mt-12" aria-labelledby="assets-h">
            <p className="ledger-eyebrow">Asset inventory</p>
            <h2 id="assets-h" className="ledger-display text-[2rem] mt-2">Rabbit, chameleon, sketch</h2>
            <ul className="mt-4">
              {DIALOGUE_ASSETS.map((a) => (
                <li key={a.id} className="grid gap-2 py-4 border-b ledger-border md:grid-cols-[7rem_1fr_1fr] md:gap-6">
                  <div className="text-[11px] tracking-[0.14em] uppercase ledger-eyebrow"><span className={`inline-block px-2 py-0.5 ${a.status === "approved" ? STATUS.approved : STATUS.draft}`}>{a.status}</span><p className="mt-2">{a.character} · {a.kind}</p></div>
                  <div><p className="text-[15px]">{a.name}</p><p className="text-[12px] ledger-muted mt-1">{a.note}</p></div>
                  <p className="text-[12px] ledger-muted break-all">{a.src}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
