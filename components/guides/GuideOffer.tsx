"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Download, Mail, Printer, BookOpen } from "lucide-react";
import type { FieldGuide } from "@/lib/content/field-guides";

// The free field guide, for an email address (James, 30 Oct 2026: "they have to add email
// address and sign up"). Full guide or the four-page quick guide; once the address is in, the
// card opens to Download, Print and, when Klaviyo is live, "a copy is on its way". A guide
// unlocked once stays unlocked in this browser (a convenience only; the sign-up is the record).
// variant "band": one guide, wide, on country and guide pages; "compact": a small card for
// trip pages and region strips.

type Got = { url: string; print: string; emailed?: boolean; live?: boolean };
const KEY = "jw-guides";
const remembered = (): Record<string, Got> => { try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; } };
const remember = (k: string, g: Got) => { try { localStorage.setItem(KEY, JSON.stringify({ ...remembered(), [k]: g })); } catch { /* private window */ } };

function Cover({ g, className = "" }: { g: FieldGuide; className?: string }) {
  const [ok, setOk] = useState(!!g.cover);
  const ref = useRef<HTMLImageElement>(null);
  // An image that failed before hydration never fires onError for React: check it once mounted.
  useEffect(() => { const i = ref.current; if (i && i.complete && !i.naturalWidth) setOk(false); }, []);
  return (
    <div className={`relative bg-[#1E2939] text-paper flex flex-col justify-between p-4 aspect-[3/4] shadow-[0_10px_30px_rgba(30,41,57,0.25)] ${className}`}>
      {ok && g.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={ref} src={g.cover} alt={`Cover of ${g.title}`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={() => setOk(false)} />
      ) : (
        <>
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-paper/70">{g.edition ?? "Field guide"}</p>
          <p className="ledger-display text-[20px] leading-tight">{g.title}</p>
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-paper/70">James Wild &amp; Co.</p>
        </>
      )}
    </div>
  );
}

export default function GuideOffer({ guide: g, source, variant = "band", className = "" }: { guide: FieldGuide; source: string; variant?: "band" | "compact"; className?: string }) {
  const id = useId();
  const [edition, setEdition] = useState<"full" | "quick">("full");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [got, setGot] = useState<Got | null>(null);
  useEffect(() => { const r = remembered()[`${g.key}:${edition}`]; setGot(r ?? null); }, [g.key, edition]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      const r = await fetch("/api/guides", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.get("email"), website: f.get("website"), guide: g.key, edition, source }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) { setState("error"); setMsg(j.error ?? "Something went wrong. Please try again."); return; }
      const res: Got = { url: j.url, print: j.print ?? j.url, emailed: j.emailed, live: j.live };
      remember(`${g.key}:${edition}`, res); setGot(res); setState("idle");
    } catch { setState("error"); setMsg("Something went wrong. Please try again."); }
  }

  const file = edition === "quick" && g.quick ? g.quick : g.full;
  const size = (f: typeof file) => `${f.pages ? `${f.pages} pages · ` : ""}${f.mb} MB PDF`;
  const compact = variant === "compact";

  const choose = g.quick && (
    <fieldset className="mt-4">
      <legend className="sr-only">Which edition</legend>
      <div className="grid grid-cols-2 gap-2">
        {([["full", "The field guide", g.full], ["quick", "The quick guide", g.quick]] as const).map(([k, label, f]) => (
          <label key={k} className={`cursor-pointer border px-3 py-2 text-[13.5px] leading-snug ${edition === k ? "border-crimson bg-paper-card" : "ledger-border"}`}>
            <input type="radio" name={`${id}-ed`} value={k} checked={edition === k} onChange={() => setEdition(k)} className="sr-only" />
            <span className="block ledger-display text-[16px]">{label}</span>
            <span className="ledger-muted">{size(f!)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  const actions = got ? (
    <div className="mt-4" role="status">
      <p className="text-[14.5px]">{got.live === false ? "Here it is. (Sign-ups open when the site launches; your guide is ready now.)" : got.emailed ? "Here it is, and a copy is on its way to your inbox." : "Here it is."}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={got.url} target="_blank" rel="noopener" download className="ledger-btn ledger-btn--solid inline-flex items-center gap-2"><Download className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />Download</a>
        <a href={got.print} target="_blank" rel="noopener" className="ledger-btn inline-flex items-center gap-2" title="Opens the PDF; print from your viewer"><Printer className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />Print</a>
      </div>
    </div>
  ) : (
    <form onSubmit={submit} className="mt-4">
      <label htmlFor={id} className="sr-only">Email address</label>
      <div className="flex gap-2 flex-wrap">
        <input id={id} name="email" type="email" required autoComplete="email" placeholder="Your email" className="flex-1 min-w-0 sm:min-w-56 bg-paper border ledger-border px-3 py-2 text-[16px] outline-none focus:border-crimson" />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button type="submit" disabled={state === "sending"} className="ledger-btn ledger-btn--solid inline-flex items-center gap-2"><Mail className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />{state === "sending" ? "Sending…" : "Send me the guide"}</button>
      </div>
      <p className="mt-2 text-[12px] ledger-muted">Free. You&rsquo;ll also get the occasional Travel Notes letter from James; unsubscribe any time.</p>
      {state === "error" && <p className="mt-1 text-[14px] ledger-crimson" role="alert">{msg}</p>}
    </form>
  );

  if (compact) return (
    <aside className={`border ledger-border p-5 grid grid-cols-[88px_1fr] gap-5 items-start ${className}`} aria-label={`Free guide: ${g.title}`}>
      <Cover g={g} />
      <div className="min-w-0">
        <p className="ledger-eyebrow ledger-crimson inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />Free field guide</p>
        <p className="ledger-display text-[20px] leading-snug mt-1">{g.title}</p>
        <p className="text-[14px] ledger-muted mt-1">{g.blurb}</p>
        {choose}
        {actions}
      </div>
    </aside>
  );

  return (
    <section className={`mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 ${className}`} aria-labelledby={`${id}-h`}>
      <div className="grid md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] gap-8 md:gap-12 items-center">
        <Cover g={g} className="w-[170px] md:w-full -rotate-2" />
        <div className="max-w-2xl">
          <p className="ledger-eyebrow ledger-crimson inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />{g.edition ? `${g.edition} · free` : "The field guide · free"}</p>
          <h2 id={`${id}-h`} className="ledger-display text-[1.75rem] md:text-4xl mt-2 leading-tight">{g.title}</h2>
          <p className="mt-3 text-[16.5px] leading-relaxed">{g.blurb} Written by James Wild &amp; Co. to download, print or keep on your phone.</p>
          {choose}
          {actions}
        </div>
      </div>
    </section>
  );
}
