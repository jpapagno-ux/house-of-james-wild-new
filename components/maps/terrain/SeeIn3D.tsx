// "See it in 3D": the 3D terrain section, placed directly below an existing map. Server side it only checks the page
// allow-list (flag.ts) and passes plain data on; the client shell (TerrainFlyover) is its own chunk, and the MapLibre
// half loads only when the section nears the viewport, so pages off the list carry none of it.
import dynamic from "next/dynamic";
import { SectionHead } from "@/components/record/Sections";
import { terrainOn, type TerrainPage } from "./flag";
import type { TerrainFlyoverProps } from "./TerrainFlyover";

const TerrainFlyover = dynamic(() => import("./TerrainFlyover"));

export default function SeeIn3D({ page, intro, ...props }: Omit<TerrainFlyoverProps, "head"> & { page: TerrainPage; intro: string }) {
  if (!terrainOn(page)) return null;
  const id = props.id ?? "see-in-3d";
  return (
    <TerrainFlyover
      {...props}
      id={id}
      head={<div id={`${id}-h`}><SectionHead eyebrow="See it in 3D" title="See It in 3D" intro={intro} /></div>}
      note={props.note ?? "Drag to turn and tilt the map; hold Ctrl or Cmd and scroll to zoom; two fingers on a phone. Positions approximate."}
    />
  );
}
