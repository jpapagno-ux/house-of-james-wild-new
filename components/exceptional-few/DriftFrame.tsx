import Image from "next/image";
import type { ReactNode } from "react";
import { mediaUrl, type MediaAsset, type Ratio } from "@/lib/content/media-assets";

// One strong frame, slow movement. Full-bleed by default; the image drifts on its
// own clock (a 7% zoom over 14s, or a gentle pan), never on scroll. Text sits low
// and arrives after the image. Reduced motion: a still. Credit from the asset.
export default function DriftFrame({ a, ratio, height = "min-h-[100svh]", motion = "zoom", children, align = "end", priority = false, id, className = "" }: {
  a: MediaAsset; ratio?: Ratio; height?: string; motion?: "zoom" | "pan" | "slow"; children?: ReactNode; align?: "end" | "center"; priority?: boolean; id?: string; className?: string;
}) {
  const anim = motion === "pan" ? "ef-drift-pan" : motion === "slow" ? "ef-drift ef-drift-slow" : "ef-drift";
  return (
    <section id={id} className={`relative ${height} mx-[calc(50%-50vw)] overflow-hidden bg-ink text-[#F3EDE2] scroll-mt-32 ${className}`} aria-label={a.caption ?? a.alt}>
      <div className={`absolute inset-0 ${anim}`}>
        <Image src={mediaUrl(a, { ratio: ratio ?? "3:2", width: 2560 })} alt={a.alt} fill priority={priority} sizes="100vw" quality={85} className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25" aria-hidden="true" />
      <div className={`relative ${height} max-w-ledger mx-auto px-5 md:px-10 flex flex-col ${align === "center" ? "justify-center" : "justify-end"} pb-12 md:pb-16 ef-arrive`}>{children}</div>
      <p className="absolute bottom-2 right-5 md:right-8 text-[10.5px] tracking-[0.08em] text-white/65">{a.caption ? `${a.caption} · ` : ""}{a.credit}</p>
    </section>
  );
}
