"use client";
export default function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="ledger-btn">Print or save as PDF</button>;
}
