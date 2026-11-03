// "See it in 3D": the terrain pilot's section, placed directly below an existing map. Server side it only checks the
// pilot flag and passes plain data on; the client shell (TerrainFlyover) is its own chunk, loaded only when this
// renders, so with the flag off (production, until James approves) no pilot code or CSS reaches any page.
import dynamic from "next/dynamic";
import { SectionHead } from "@/components/record/Sections";
import { terrainPilotOn } from "./flag";
import type { TerrainFlyoverProps } from "./TerrainFlyover";

// The literal env test (not the helper) lets webpack drop the import when the flag is off at build, so production pages
// carry none of the pilot's code or CSS.
const TerrainFlyover = process.env.NEXT_PUBLIC_TERRAIN_PILOT === "true" ? dynamic(() => import("./TerrainFlyover")) : () => null;

export default function SeeIn3D({ intro, ...props }: Omit<TerrainFlyoverProps, "head"> & { intro: string }) {
  if (!terrainPilotOn()) return null;
  const id = props.id ?? "see-in-3d";
  return (
    <TerrainFlyover
      {...props}
      id={id}
      head={<div id={`${id}-h`}><SectionHead eyebrow="Preview · See it in 3D" title="See It in 3D" intro={intro} /></div>}
      note={props.note ?? "Drag to turn and tilt the map; hold Ctrl or Cmd and scroll to zoom; two fingers on a phone. Positions approximate."}
    />
  );
}
