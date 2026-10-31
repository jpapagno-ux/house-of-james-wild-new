// Volume VI colour for every Other Europe page (lib/volumes.ts). Never
// `display: contents` on a layout wrapper: Next scrolls new pages to its
// first element, and a box-less wrapper sends the reader to the foot.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="theme-vol-europe theme-vol-europe-page">{children}</div>;
}
