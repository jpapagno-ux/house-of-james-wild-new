// Note: never `display: contents` on a page or layout wrapper — Next scrolls new pages to its first element, and a box-less wrapper sends the reader to the foot of the page (audit, 30 Oct 2026).
// Volume colour for every stays page (lib/volumes.ts, volume kit Oct 2026).
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="theme-vol-stays theme-vol-stays-page">{children}</div>;
}
