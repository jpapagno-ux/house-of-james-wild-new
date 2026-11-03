"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Every new page opens at its top (James, 3 Nov 2026: header and footer links landed at the bottom
// of the next page). Next.js only scrolls when it finds a suitable first element in the page that
// changed; the site's layouts start several pages with sticky or fixed bars, so it sometimes found
// none and left the reader where they were, which after a footer click is the bottom. This does it
// explicitly, on a change of page only (not on filters, which change the query string):
//  - a link with #section lands on that section (its scroll-margin clears the sticky header);
//  - Back and Forward keep the browser's own remembered position.
export default function ScrollToTop() {
  const pathname = usePathname();
  const fromHistory = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const onPop = () => { fromHistory.current = true; };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; } // the first load is the browser's to place
    if (fromHistory.current) { fromHistory.current = false; return; }
    const hash = window.location.hash.slice(1);
    const target = hash ? document.getElementById(decodeURIComponent(hash)) : null;
    if (target) target.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}
