import Image from "next/image";
import { Film } from "lucide-react";
import { filmId, type ShipFilm as FilmData, type ShipImage } from "@/lib/content/ships/types";

// The film slot every ship page carries. Give the ship a YouTube id in its
// data (`film: "<id>"`) and the film plays here, privacy mode; until then the
// slot shows a quiet "Film coming soon" panel over the ship's own photograph.
export default function ShipFilm({ film, name, poster, credit }: { film: FilmData | undefined; name: string; poster: ShipImage; credit?: string }) {
  const id = filmId(film);
  const title = film && typeof film === "object" && film.title ? film.title : `${name}, the film`;
  return (
    <section id="film" className="mt-16 md:mt-20 scroll-mt-32 lg:scroll-mt-[212px]" aria-label={`Film of ${name}`}>
      <div className="relative aspect-[16/9] md:aspect-[21/9] border ledger-border overflow-hidden bg-ink">
        {id ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`} title={title} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" className="absolute inset-0 w-full h-full" />
        ) : (
          <>
            <Image src={poster.url} alt={poster.alt} fill sizes="(min-width: 1024px) 1200px, 100vw" className="object-cover opacity-60 grayscale-[35%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
            <div className="pointer-events-none absolute inset-3 md:inset-5 border border-white/25" aria-hidden="true" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
              <span className="w-14 h-14 rounded-full border border-white/60 flex items-center justify-center"><Film className="w-6 h-6" strokeWidth={1.25} aria-hidden="true" /></span>
              <p className="ledger-eyebrow !text-white/85 mt-4">The film</p>
              <p className="ledger-display text-2xl md:text-4xl mt-1">Film coming soon</p>
              <p className="mt-2 text-[14px] text-white/80 max-w-md">A short film aboard {name} will play here.</p>
            </div>
          </>
        )}
      </div>
      {credit && <p className="mt-2 text-[12px] ledger-muted">{id ? "Film" : "Photograph"}: {credit}</p>}
    </section>
  );
}
