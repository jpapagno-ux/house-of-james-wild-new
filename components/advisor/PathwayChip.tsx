import { PATHWAYS, type PathwayId } from "@/lib/pathways";

// House rule: Pathway chips are graphite outlines with a 6px Pathway dot.
export default function PathwayChip({ id, name }: { id: string; name: string }) {
  const p = PATHWAYS[id as PathwayId];
  return (
    <span className="house-chip inline-flex items-center gap-1.5 border border-[#2E2B28]/40 px-2 py-0.5 text-[12px] text-[#2E2B28]">
      <span aria-hidden="true" className="inline-block h-[6px] w-[6px] rounded-full" style={{ background: p?.accent ?? "#8C8277" }} />
      {name}
    </span>
  );
}
