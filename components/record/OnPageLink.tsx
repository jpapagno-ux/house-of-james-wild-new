"use client";

// A link in the "On this page" bar. Scrolls to the section and replaces the
// hash instead of pushing it, so Back leaves the page rather than stepping
// back through every section the reader visited (audit, 30 Oct 2026).
export default function OnPageLink({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={`#${id}`}
      className={className}
      onClick={(e) => {
        const t = document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        history.replaceState(null, "", `#${id}`);
        t.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}
