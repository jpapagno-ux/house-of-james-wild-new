"use client";

import { useState } from "react";

// Opens or closes every day in the day-by-day list at once.
export default function ExpandAll({ target }: { target: string }) {
  const [all, setAll] = useState(false);
  return (
    <button type="button" className="ledger-btn-ghost" aria-controls={target}
      onClick={() => { const next = !all; document.querySelectorAll<HTMLDetailsElement>(`#${target} details`).forEach((d) => { d.open = next; }); setAll(next); }}>
      {all ? "Close all days" : "Open all days"}
    </button>
  );
}
