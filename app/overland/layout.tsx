// Volume colour for every overland page (lib/volumes.ts, volume kit Oct 2026).
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="theme-vol-overland theme-vol-overland-page contents">{children}</div>;
}
