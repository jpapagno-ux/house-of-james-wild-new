"use client";

import { useEffect, useRef, useState } from "react";
import IggiMark from "@/components/iggi/IggiMark";
import { IGGI_CORE_ORIGIN } from "@/lib/iggi/flag";
import Link from "next/link";
import { DEFAULT_ADVISOR } from "@/lib/content/advisors";
import { CRUX_HREF } from "@/lib/compass/pathway-adapter";
import { folioFromCore, getFolio, isFolioId, saveFolio, type Folio } from "@/lib/folio/shelf";
import { chatFromCore, RESUME_HREF, saveFolioToAccount, stashPending } from "@/lib/folio/account-save";
import { FLAGS } from "@/lib/booking-live/flags";
import IggiAtlas, { type IggiPlace } from "@/components/iggi/IggiAtlas";

// "Ask Iggi" panel — Stage 2 of the Iggi Intelligence Core (Contract C3).
// Mints a same-origin embed token from /api/iggi/token, then loads the Iggi
// Core chat in an iframe with the page context (what the traveler is looking
// at) and the token on the URL. The iframe posts back its height and a few
// events; only messages from the Core's origin are honoured. Renders nothing
// visible until the frame is near the viewport, so pages stay light.
//
// Page context (Contract C3): entityType country | region | stay | itinerary |
// property | advisor (a House advisor's profile), entitySlug, and the country
// slug Iggi uses to scope its Ledger search.

export type IggiContext = {
  entityType: "country" | "region" | "stay" | "itinerary" | "property" | "advisor" | "destination" | "reserve" | "voyage" | "pathway" | "overland";
  entitySlug: string;
  countrySlug?: string | null;
  ledgerId?: string | null;
  sourcePage: string; // the path, for the Core's conversation record
  volume?: string | null;
  pathway?: string | null; // PATH-01..08 on a Pathway page: Iggi recommends only records approved on it
  regionSlug?: string | null;
  advisor?: string | null; // the advisor on this page (DEFAULT_ADVISOR while testing)
};

export default function IggiPanel({ ctx, heading = "Ask Iggi about this page", lead }: { ctx: IggiContext; heading?: string; lead?: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const hostRef = useRef<HTMLElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "off">("idle");
  const [folio, setFolio] = useState<Folio | null>(null); // Stage 4: the Folio Iggi handed back
  // Stage 2 (21 Nov 2026): where the Folio and chat went in the account: saved (with the account Folio id), sign-in needed, or shelf only.
  const [kept, setKept] = useState<{ state: "saved"; id: string } | { state: "sign_in" } | { state: "shelf" } | null>(null);
  const [atlas, setAtlas] = useState<{ stays: IggiPlace[]; title: string | null; focus: number } | null>(null); // §D3: the places Iggi named, on the Atlas

  // Lazy: mint the token and set the iframe src only when the panel is near the viewport.
  useEffect(() => {
    const el = hostRef.current;
    if (!el || src) return;
    let cancelled = false;
    const start = async () => {
      setState("loading");
      let token = "";
      try {
        const r = await fetch("/api/iggi/token", { cache: "no-store" });
        if (r.ok) token = ((await r.json()) as { token?: string }).token ?? "";
        else if (r.status === 503) { /* token not configured yet; the Core may still accept the origin alone */ }
      } catch { /* leave empty; the Core decides */ }
      if (cancelled) return;
      const p = new URLSearchParams({
        sourcePage: ctx.sourcePage.slice(0, 60),
        entityType: ctx.entityType,
        entitySlug: ctx.entitySlug.slice(0, 120),
        v: "2",
      });
      if (ctx.countrySlug) p.set("country", ctx.countrySlug);
      if (ctx.ledgerId) p.set("ledgerId", ctx.ledgerId);
      if (ctx.volume) p.set("volume", ctx.volume);
      if (ctx.pathway) p.set("pathway", ctx.pathway);
      if (ctx.regionSlug) p.set("region", ctx.regionSlug);
      p.set("advisor", ctx.advisor ?? DEFAULT_ADVISOR);
      p.set("advisorsFeed", `${location.origin}/api/v1/advisors`);
      p.set("dialogueFeed", `${location.origin}/api/v1/dialogue`); // 2F-ii: the approved James & Iggi lines (contract §6.3)
      if (token) p.set("token", token);
      setSrc(`${IGGI_CORE_ORIGIN}/embed/chat?${p.toString()}`);
    };
    if (!("IntersectionObserver" in window)) { void start(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); void start(); }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); };
  }, [ctx, src]);

  // Honour only the Core's messages.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== IGGI_CORE_ORIGIN || !e.data || typeof e.data !== "object") return;
      const d = e.data as { type?: string; height?: number; path?: string; external?: boolean; entitySlug?: string; domain?: string; folio?: unknown; fol?: string };
      // ji:resize is no longer honoured (19 Nov 2026): the Core's shell is 100dvh of the frame and reported its own height
      // back, so the frame grew to the cap and the input sat under the page's sticky Enquire bar on phones. The frame now
      // has a fixed, viewport-aware height and the thread scrolls inside it, like a chat should.
      if (d.type === "ji:resize") { /* ignored */ }
      if (d.type === "ji:open_app" && typeof d.path === "string") {
        // crux: Iggi walks a pure safari reading over to Wild & Co Safaris — through the house's one door (James, 31 Oct 2026).
        if ((d as { crux?: boolean }).crux) { location.assign(CRUX_HREF); return; }
        // external: a link back into this site (the advisor's Plan page with the FOL on it); anything else opens the Core.
        if (d.external) { try { const u = new URL(d.path, location.origin); if (u.origin === location.origin) location.assign(u.pathname + u.search); } catch { /* ignore */ } }
        else window.open(`${IGGI_CORE_ORIGIN}${d.path.startsWith("/") ? d.path : "/" + d.path}`, "_blank", "noopener");
      }
      // Stage 4: Iggi hands the shaped journey back as a Folio. Shelve it on this
      // device (and, with accounts on, in the traveller's account) and show it.
      if (d.type === "ji:folio") {
        const f = folioFromCore(d.folio);
        if (f) {
          saveFolio(f);
          setFolio(f);
          // Stage 2: the sketch and chat go with it into the account; without sign-in the hand-off waits in this browser.
          const m = d as { chat?: unknown; sketch?: unknown; conversationId?: unknown };
          const chat = chatFromCore(m.chat);
          const sketch = m.sketch && typeof m.sketch === "object" ? m.sketch : null;
          const conversationId = typeof m.conversationId === "string" ? m.conversationId.slice(0, 64) : null;
          if (FLAGS.accounts) {
            void saveFolioToAccount({ folio: f, chat, sketch, conversationId }).then((res) => {
              if (res.ok) { setKept({ state: "saved", id: res.id }); return; }
              if (res.reason === "sign_in") { stashPending({ folio: f, chat, sketch, conversationId, at: new Date().toISOString() }); setKept({ state: "sign_in" }); return; }
              setKept({ state: "shelf" });
            });
          } else setKept({ state: "shelf" });
          const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
          if (Array.isArray(dl)) dl.push({ event: "iggi_folio", fol: f.fol, advisor: f.advisor?.adv ?? null, page: ctx.sourcePage });
        }
      }
      // §D3 (4 Nov 2026): Iggi hands the places it named to the Atlas beneath the chat. The Core
      // posts quietly when a journey is shaped and again, with focus, when the traveller asks to
      // see them. Up to 12 places; only slug, Ledger ID, name and reason are read.
      if (d.type === "ji:atlas") {
        const m = d as { stays?: unknown; title?: unknown; focus?: unknown };
        const str = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
        const stays = (Array.isArray(m.stays) ? m.stays : []).slice(0, 12).map((s) => { const o = (s && typeof s === "object" ? s : {}) as Record<string, unknown>; return { slug: str(o.slug, 120), ledger_id: str(o.ledger_id, 40), name: str(o.name, 120), reason: str(o.reason, 200) }; }).filter((s) => s.slug || s.ledger_id || s.name);
        if (stays.length) setAtlas((prev) => ({ stays, title: str(m.title, 120), focus: m.focus ? (prev?.focus ?? 0) + 1 : prev?.focus ?? 0 }));
        const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
        if (Array.isArray(dl)) dl.push({ event: "iggi_atlas", places: stays.length, focus: !!m.focus, page: ctx.sourcePage });
      }
      if (d.type === "ji:open_folio") location.assign(`/folio${typeof d.fol === "string" ? `?fol=${encodeURIComponent(d.fol)}` : ""}`);
      // Stage 5: Iggi hands the traveller to a person. The enquiry arrives on
      // /plan pre-addressed to the advisor on this page, with the Folio ID,
      // the place and a short "what Iggi learned" note, so the chat travels
      // with it (James, 31 Oct 2026). The Core may send: entitySlug, fol,
      // q (the place in words), notes (≤ 600 chars), advisor (slug).
      if (d.type === "ji:inquiry") {
        const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
        if (Array.isArray(dl)) dl.push({ event: "iggi_inquiry", entity: d.entitySlug, page: ctx.sourcePage });
        const m = d as { fol?: unknown; q?: unknown; notes?: unknown; advisor?: unknown };
        const str = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : undefined);
        const fol = isFolioId(m.fol) ? m.fol : folio?.fol;
        const notes = str(m.notes, 600) ?? (fol ? getFolio(fol)?.summary ?? undefined : undefined);
        const adv = str(m.advisor, 60) ?? ctx.advisor ?? DEFAULT_ADVISOR;
        const p = new URLSearchParams({ from: "iggi", advisor: adv });
        if (fol) p.set("folio", fol);
        const q = str(m.q, 120); if (q) p.set("q", q);
        if (notes) p.set("notes", notes.slice(0, 600));
        location.assign(`/plan?${p.toString()}`);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [ctx.sourcePage, ctx.advisor, folio]);

  // The Ask Iggi door (#iggi-chat, from the phone bar and the desktop card): land with the chat fully in view under
  // the sticky header, not the heading. CSS scroll-margin alone landed short on phones (19 Nov 2026).
  useEffect(() => {
    const go = () => {
      if (location.hash !== "#iggi-chat") return;
      const el = document.getElementById("iggi-chat");
      if (!el) return;
      const header = document.querySelector("header");
      const offset = (header ? header.getBoundingClientRect().height : 120) + 8;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    const t = setTimeout(go, 50);
    window.addEventListener("hashchange", go);
    return () => { clearTimeout(t); window.removeEventListener("hashchange", go); };
  }, []);

  const planHref = folio ? toLocal(folio.plan) : null;
  return (
    <section ref={hostRef} id="iggi" className="mt-12 md:mt-24 border-t ledger-rule pt-6 md:pt-10 scroll-mt-32" aria-labelledby="iggi-heading" data-iggi-panel>
      <div className="flex items-start gap-4">
        <span className="text-coast shrink-0 hidden sm:inline-block"><IggiMark size={44} /></span>
        <div>
          <p className="ledger-eyebrow ledger-crimson">Iggi · Field Guide</p>
          <h2 id="iggi-heading" className="ledger-display text-[1.5rem] md:text-4xl mt-1 leading-tight">{heading}</h2>
          <p className="mt-2 text-[14.5px] md:text-[16px] ledger-muted max-w-2xl leading-relaxed">{lead ?? "Iggi answers from the Ledger and says where each answer comes from. Prices, availability and bookings go to a person."}</p>
        </div>
      </div>
      <div id="iggi-chat" className="mt-4 md:mt-6 bg-paper-card iggi-frame scroll-mt-[136px] md:scroll-mt-40">
        {src ? (
          <iframe
            ref={frameRef}
            src={src}
            title="Ask Iggi, Field Guide of James Wild & Co"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="clipboard-write; microphone"
            onLoad={() => setState("ready")}
            style={{ width: "100%", height: "100%", border: 0, display: "block", background: "transparent" }}
          />
        ) : (
          <div className="p-6 text-[15px] ledger-muted" aria-live="polite">{state === "loading" ? "Iggi is opening the Ledger…" : "Scroll here and Iggi will open the Ledger for this page."}</div>
        )}
      </div>
      {atlas && <IggiAtlas stays={atlas.stays} title={atlas.title} focus={atlas.focus} />}
      {folio && (
        <aside className="mt-4 border-l-2 border-crimson bg-paper-card px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-3" aria-live="polite" aria-label="Your Folio">
          <div className="min-w-0">
            <p className="ledger-eyebrow ledger-crimson">Folio {folio.fol}{folio.advisor?.adv ? ` · open with ${folio.advisor.isDefault ? "James" : folio.advisor.firstName ?? folio.advisor.name}` : ""}</p>
            <p className="ledger-display text-[1.25rem] mt-1 leading-snug">{folio.title}</p>
            <p className="text-[13.5px] ledger-muted mt-0.5">
              {folio.stays.length ? `${folio.stays.length} Ledger record${folio.stays.length === 1 ? "" : "s"} · ` : ""}
              {kept?.state === "saved" ? "saved to your account with the sketch and this chat; your advisor sees what you save."
                : kept?.state === "sign_in" ? "on your shelf on this device. Sign in and the sketch and chat are kept in your account, where your advisor can read them."
                : "on your shelf under My Folio on this device."}
            </p>
          </div>
          <div className="flex gap-3 ml-auto">
            {kept?.state === "sign_in" && <Link href={RESUME_HREF} className="ledger-btn ledger-btn--solid">Sign in to keep it</Link>}
            <Link href={kept?.state === "saved" ? `/account/folios/${kept.id}` : `/folio?fol=${encodeURIComponent(folio.fol)}`} className="ledger-btn">Open My Folio</Link>
            {planHref && <Link href={planHref} className="ledger-btn ledger-btn--solid">Plan with {folio.advisor?.adv ? (folio.advisor.isDefault ? "James" : folio.advisor.firstName ?? folio.advisor.name) : "James"}</Link>}
          </div>
        </aside>
      )}
      <p className="mt-3 text-[13px] ledger-muted">Iggi is an AI guide run by James Wild &amp; Co. Chats may be reviewed by the house to improve the Ledger; don&rsquo;t share payment details here.</p>
    </section>
  );
}

/** A Plan link from the Core points at this site; keep only its path so it stays same-origin. */
function toLocal(href: string): string {
  try { const u = new URL(href, "https://house-of-james-wild-new.vercel.app"); return u.pathname + u.search; } catch { return "/plan"; }
}
