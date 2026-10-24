// The Compass mark: an eight-pointed rose with a crimson needle. Static SVG,
// server-safe; the interactive Compass animates its own copy.
export default function CompassRose({ bearing = 20, className = "" }: { bearing?: number; className?: string }) {
  return (
    <svg viewBox="-60 -60 120 120" className={className} aria-hidden="true">
      <circle r="54" fill="none" stroke="rgba(244,241,237,0.25)" />
      <circle r="44" fill="none" stroke="rgba(244,241,237,0.12)" strokeDasharray="1 3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <path key={a} d={a % 90 === 0 ? "M0 -50 L5 -8 L0 0 L-5 -8 Z" : "M0 -34 L3.5 -6 L0 0 L-3.5 -6 Z"} transform={`rotate(${a})`} fill={a % 90 === 0 ? "rgba(244,241,237,0.85)" : "rgba(244,241,237,0.4)"} />
      ))}
      <g transform={`rotate(${bearing})`}>
        <path d="M0 -46 L4 0 L0 6 L-4 0 Z" fill="#C0392B" />
        <path d="M0 46 L4 0 L0 -6 L-4 0 Z" fill="rgba(244,241,237,0.55)" />
      </g>
      <circle r="3.5" fill="#F4F1ED" />
    </svg>
  );
}
