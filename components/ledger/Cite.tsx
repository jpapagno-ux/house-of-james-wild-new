import Link from "next/link";
import { linkable } from "@/lib/outbound";

// A cited source or a named place: a link only when it stays in the house (lib/outbound.ts), otherwise plain text.
export default function Cite({ href, children, className }: { href?: string | null; children: React.ReactNode; className?: string }) {
  if (!href || !linkable(href)) return <span>{children}</span>;
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href} className={className ?? "underline underline-offset-4 hover:ledger-crimson"}>{children}</Link>;
  return <a href={href} target="_blank" rel="noopener" className={className ?? "underline underline-offset-4 hover:ledger-crimson"}>{children}</a>;
}
