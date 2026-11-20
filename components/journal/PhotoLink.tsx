"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { openPhotos } from "@/lib/journal-style/bus";

// JWC-STYLE-01. The ways into the photograph viewer: a text button ("View all 16 photographs", "See 4 room
// photographs") and a small strip of thumbnails for a section, each opening the viewer on that section or photograph.
export function PhotoLink({ tab, children, className = "" }: { tab?: string; children: ReactNode; className?: string }) {
  return <button type="button" onClick={() => openPhotos({ tab })} className={className || "font-body font-semibold text-[10.5px] tracking-[0.2em] uppercase text-graphite underline underline-offset-[6px] decoration-[color:var(--jw-crimson)]"}>{children}</button>;
}

export function PhotoStrip({ tab, photos, total, label }: { tab: string; photos: { url: string; alt: string }[]; total: number; label: string }) {
  if (!photos.length) return null;
  return (
    <div className="mt-8">
      <ul className="grid grid-cols-3 gap-2 md:gap-3 max-w-3xl">
        {photos.slice(0, 3).map((p) => (
          <li key={p.url}>
            <button type="button" onClick={() => openPhotos({ tab, src: p.url })} aria-label={`Open the photograph: ${p.alt}`} className="relative block w-full overflow-hidden border border-[color:var(--jw-hairline)] bg-white p-1.5">
              <span className="relative block overflow-hidden" style={{ aspectRatio: "4 / 3" }}><Image src={p.url} alt={p.alt} fill sizes="(min-width: 768px) 250px, 31vw" className="object-cover" /></span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3"><PhotoLink tab={tab}>See {total === 1 ? "the photograph" : `all ${total} ${label}`}</PhotoLink></p>
    </div>
  );
}
