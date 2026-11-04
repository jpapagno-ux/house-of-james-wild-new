import Link from "next/link";

// Extension chip (James, 2 Nov 2026): a small "Extend to ..." line under a route or a stay,
// naming a stay that sits just beyond it. While the extension's country is held (Nicaragua is
// paused) it must not link to a stay or country page that is not live, so it opens the enquiry
// form with the trip prefilled and reads "Ask James". Set `live` once the stay page is
// released and the chip becomes a normal link to `href`.

export type Extension = {
  /** Where the extension goes, e.g. "Nicaragua". */
  to: string;
  /** The stay, e.g. "Jícaro Island Lodge". */
  stay: string;
  /** Where it is, e.g. "Lake Nicaragua (Cayuga Collection)". */
  where: string;
  /** The stay or country page to link once live. */
  href?: string;
  /** True only when `href` is a live page on the site. */
  live?: boolean;
};

export const planHref = (stay: string) => `/plan?trip=${encodeURIComponent(`${stay} extension`)}`;

export default function ExtensionChip({ to, stay, where, href, live = false, className = "" }: Extension & { className?: string }) {
  const linkLive = live && !!href;
  const target = linkLive ? href! : planHref(stay);
  return (
    <p className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 border ledger-border px-3 py-2 text-[14px] leading-snug ${className}`}>
      <span className="ledger-eyebrow ledger-crimson">Extend to {to}</span>
      <span>
        {stay}, {where}
      </span>
      <Link
        href={target}
        className="underline decoration-crimson/50 underline-offset-2 whitespace-nowrap"
        aria-label={linkLive ? `See ${stay}` : `Ask James about a ${stay} extension`}
        data-extension={linkLive ? "live" : "held"}
      >
        {linkLive ? `See ${stay}` : "Ask James"}
      </Link>
    </p>
  );
}
