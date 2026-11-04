// Money for the traveler's screens: minor units → "US$12,474.06" / "R42,500.00 ZAR".
export function fmtMinor(minor: number | string, currency: string): string {
  const digits = new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  const s = new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(Number(minor) / 10 ** digits);
  return currency === "USD" ? s.replace(/^\$/, "US$") : `${s} ${currency}`;
}
export const niceDate = (d: string | null | undefined) => (d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "");
export const niceWhen = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString("en-US", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "UTC" }) + " UTC" : "");
