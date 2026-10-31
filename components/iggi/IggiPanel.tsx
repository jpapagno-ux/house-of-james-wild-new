"use client";

import { useEffect, useRef, useState } from "react";
import IggiMark from "@/components/iggi/IggiMark";
import { IGGI_CORE_ORIGIN } from "@/lib/iggi/flag";
import { DEFAULT_ADVISOR } from "@/lib/content/advisors";

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
  entityType: "country" | "region" | "stay" | "itinerary" | "property" | "advisor";
  entitySlug: string;
  countrySlug?: string | null;
  ledgerId?: string | null;
  sourcePage: string; // the path, for the Core's conversation record
  volume?: string | null;
  advisor?: string | null; // the advisor on this page (DEFAULT_ADVISOR while testing)
};

export default function IggiPanel({ ctx, heading = "Ask Iggi about this page", lead }: { ctx: IggiContext; heading?: string; lead?: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const hostRef = useRef<HTMLElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "off">("idle");
  const [height, setHeight] = useState(620);

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
      p.set("advisor", ctx.advisor ?? DEFAULT_ADVISOR);
      p.set("advisorsFeed", `${location.origin}/api/v1/advisors`);
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
      const d = e.data as { type?: string; height?: number; path?: string; entitySlug?: string; domain?: string };
      if (d.type === "ji:resize" && typeof d.height === "number") setHeight(Math.min(Math.max(d.height, 480), 920));
      if (d.type === "ji:open_app" && typeof d.path === "string") window.open(`${IGGI_CORE_ORIGIN}${d.path.startsWith("/") ? d.path : "/" + d.path}`, "_blank", "noopener");
      if (d.type === "ji:inquiry") {
        const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
        if (Array.isArray(dl)) dl.push({ event: "iggi_inquiry", entity: d.entitySlug, page: ctx.sourcePage });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [ctx.sourcePage]);

  return (
    <section ref={hostRef} className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="iggi-heading" data-iggi-panel>
      <div className="flex items-start gap-4">
        <span className="text-coast shrink-0"><IggiMark size={44} /></span>
        <div>
          <p className="ledger-eyebrow ledger-crimson">Iggi · Field Guide</p>
          <h2 id="iggi-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-1">{heading}</h2>
          <p className="mt-2 text-[16px] ledger-muted max-w-2xl leading-relaxed">{lead ?? "Iggi answers from the Ledger and says where each answer comes from. Prices, availability and bookings go to a person."}</p>
        </div>
      </div>
      <div className="mt-6 bg-paper-card" style={{ minHeight: 480 }}>
        {src ? (
          <iframe
            ref={frameRef}
            src={src}
            title="Ask Iggi, Field Guide of James Wild & Co"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="clipboard-write"
            onLoad={() => setState("ready")}
            style={{ width: "100%", height, border: 0, display: "block", background: "transparent" }}
          />
        ) : (
          <div className="p-6 text-[15px] ledger-muted" aria-live="polite">{state === "loading" ? "Iggi is opening the Ledger…" : "Scroll here and Iggi will open the Ledger for this page."}</div>
        )}
      </div>
      <p className="mt-3 text-[13px] ledger-muted">Iggi is an AI guide run by James Wild &amp; Co. Chats may be reviewed by the house to improve the Ledger; don&rsquo;t share payment details here.</p>
    </section>
  );
}
