import Link from "next/link";
import type { ComponentProps } from "react";
import { GUARD_ON, isBuilt } from "@/lib/routes";

// SafeLink: an inline link under the link guard. In production a link to a
// page that isn't built yet renders nothing (or its fallback), so body copy
// never sends anyone to a 404. Previews always show the link.
export default function SafeLink({ fallback = null, ...props }: ComponentProps<typeof Link> & { fallback?: React.ReactNode }) {
  const href = typeof props.href === "string" ? props.href : props.href.pathname ?? "/";
  if (GUARD_ON && !isBuilt(href)) return <>{fallback}</>;
  return <Link {...props} />;
}

// GuardLink: like SafeLink, but keeps the content. When the page isn't
// built (production), it renders the same box without the link, so cards
// and chips keep their layout and simply stop being clickable.
export function GuardLink({ as: Tag = "span", href, className, children }: { as?: "span" | "div"; href: string; className?: string; children: React.ReactNode }) {
  if (GUARD_ON && !isBuilt(href)) return <Tag className={className}>{children}</Tag>;
  return <Link href={href} className={className}>{children}</Link>;
}
