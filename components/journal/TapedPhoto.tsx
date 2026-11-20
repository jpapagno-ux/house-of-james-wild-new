import Image from "next/image";

// JWC-STYLE-01 primitive. A photograph on a white mount, held by one strip of tape and set a degree off square,
// with a mono caption on the mount. Photographs come from the record's filed set (Cloudinary or the house library);
// this component never chooses or uploads one.
type Props = {
  src: string;
  alt: string;
  caption?: string;
  /** Width / height of the photograph. */
  ratio?: number;
  /** Degrees off square; 0 for a straight mount. */
  tilt?: number;
  tape?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export default function TapedPhoto({ src, alt, caption, ratio = 3 / 2, tilt = 1, tape = true, sizes = "(min-width: 1024px) 480px, 92vw", priority = false, className = "" }: Props) {
  return (
    <figure className={`relative bg-white border border-[color:var(--jw-hairline)] p-2.5 shadow-[0_14px_28px_-18px_rgba(26,24,22,0.45)] ${className}`} style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}>
      {tape && <span aria-hidden className="absolute left-1/2 -top-2.5 z-10 h-5 w-20 -translate-x-1/2 -rotate-1 border border-[color:var(--jw-hairline)] bg-[rgb(207_200_191_/_0.6)]" />}
      <div className="relative overflow-hidden" style={{ aspectRatio: String(ratio) }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
      {caption && <figcaption className="pt-2.5 pb-0.5 font-mono text-[10px] tracking-[0.2em] uppercase text-stone-text">{caption}</figcaption>}
    </figure>
  );
}
