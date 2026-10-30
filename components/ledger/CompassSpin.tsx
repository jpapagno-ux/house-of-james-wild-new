// The house Compass rose, turning (James, 30 Oct 2026: the founder's spinning compass on the
// navigation, site-wide). Same eight-point rose and crimson needle as CompassRose; the card turns
// slowly while the needle holds north and settles a little each time. Ink or light, by the bar
// it sits on; still for anyone who prefers reduced motion (globals.css .jw-spin).
export default function CompassSpin({ size = 16, light = false, className = "" }: { size?: number; light?: boolean; className?: string }) {
  const ink = light ? "rgba(255,255,255,0.92)" : "#2D2A26";
  const faint = light ? "rgba(255,255,255,0.45)" : "rgba(45,42,38,0.4)";
  return (
    <svg viewBox="-60 -60 120 120" width={size} height={size} className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <circle r="54" fill="none" stroke={ink} strokeWidth="5" />
      <g className="jw-spin" style={{ animationDuration: "24s" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={a} d={a % 90 === 0 ? "M0 -48 L7 -8 L0 0 L-7 -8 Z" : "M0 -32 L5 -6 L0 0 L-5 -6 Z"} transform={`rotate(${a})`} fill={a % 90 === 0 ? ink : faint} />
        ))}
      </g>
      <g className="jw-needle">
        <path d="M0 -44 L6 0 L0 8 L-6 0 Z" fill="#B23A3A" />
      </g>
      <circle r="6" fill={light ? "#2D2A26" : "#F4F1ED"} stroke={ink} strokeWidth="2" />
    </svg>
  );
}
