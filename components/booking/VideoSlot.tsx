import Image from "next/image";
import { Clapperboard } from "lucide-react";
import StayFilm from "./StayFilm";

// The film slot under every record hero. With a video on file it plays the
// stay film (poster first, house end card); without one it holds the space
// with the record's own photograph and an honest "coming" note, so the
// layout never jumps when the film arrives.
export default function VideoSlot({ name, video, poster, planHref }: { name: string; video?: { id: string; title: string } | null; poster?: string | null; planHref: string }) {
  if (video) return <StayFilm bare id={video.id} title={video.title} name={name} planHref={planHref} />;
  return (
    <figure className="relative aspect-video bg-ink overflow-hidden border ledger-border text-white" aria-label={`${name}: film coming`}>
      {poster && <Image src={poster} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-45 grayscale-[30%]" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" aria-hidden="true" />
      <figcaption className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <span className="w-14 h-14 rounded-full border border-white/60 flex items-center justify-center"><Clapperboard className="w-6 h-6" strokeWidth={1.25} aria-hidden="true" /></span>
        <span className="ledger-eyebrow !text-white/75 mt-4">The film · in the edit</span>
        <span className="ledger-display italic text-xl md:text-2xl mt-1">{name}, in motion. Soon.</span>
        <span className="mt-2 text-[13px] text-white/70 max-w-sm">Until it lands, the photographs above will have to do the talking.</span>
      </figcaption>
    </figure>
  );
}
