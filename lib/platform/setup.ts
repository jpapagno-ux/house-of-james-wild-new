// Partner set-up (James, 19 Nov 2026: "complete a set up form to match what's offered in the dashboard ... so when I
// send the invitation all can be entered by the user"). One step per part of the Partner Desk, in the order a
// partner fills them. Pure: the page counts what is on record and this decides what each step shows.

export type SetupKey = "company" | "contacts" | "entries" | "content" | "rooms" | "rates" | "hosts" | "documents" | "commercial" | "banking" | "team";
export type SetupStep = { key: SetupKey; title: string; line: string; href: string; adminOnly: boolean; optional: boolean };
export type SetupCounts = Partial<Record<SetupKey, number>> & { entriesTotal?: number };
export type SetupState = SetupStep & { state: "done" | "todo" | "skipped"; detail: string };

export const SETUP_STEPS: SetupStep[] = [
  { key: "company", title: "Company details", line: "Website, main phone and email, address and how you prefer to hear from the house. Choose your password here too.", href: "/partner/account", adminOnly: false, optional: false },
  { key: "contacts", title: "Contacts", line: "Who the house writes to for reservations, sales, marketing, accounts and the property itself. One person can hold several roles.", href: "/partner/contacts", adminOnly: false, optional: false },
  { key: "entries", title: "Your properties", line: "The lodges, villas, camps or vessels the house holds for you. A group with several brands or locations sees them all here.", href: "/partner/portfolio", adminOnly: false, optional: false },
  { key: "content", title: "Descriptions and facts", line: "Overview, getting there, best months, features, experiences, inclusions and policies for guests. The house approves before anything changes on the site.", href: "/partner/content", adminOnly: false, optional: false },
  { key: "rooms", title: "Rooms and accommodation", line: "Each room, suite, villa or cabin: beds, size, occupancy, views and what is included.", href: "/partner/rooms", adminOnly: false, optional: false },
  { key: "rates", title: "Rates and offers", line: "Your rate sheet or seasons, and any offers for the house's travellers.", href: "/partner/rates", adminOnly: false, optional: false },
  { key: "hosts", title: "Hosts", line: "The people guests meet: managers, guides, chefs. Shown on the site only if you choose.", href: "/partner/hosts", adminOnly: false, optional: true },
  { key: "documents", title: "Documents", line: "Fact sheet, media kit, licences, insurance and your agreement with the house.", href: "/partner/documents", adminOnly: false, optional: false },
  { key: "commercial", title: "Commercial terms", line: "Commission or net terms by brand or property, linked to the signed agreement.", href: "/partner/commercial", adminOnly: true, optional: false },
  { key: "banking", title: "Banking and policies", line: "Where the house pays you, your currencies, and your deposit, cancellation and children policies.", href: "/partner/payments", adminOnly: true, optional: false },
  { key: "team", title: "Your team", line: "Invite colleagues. A lodge or villa manager can be limited to their own property.", href: "/partner/team", adminOnly: true, optional: true },
];

export function setupStates(counts: SetupCounts, skipped: string[], admin: boolean): SetupState[] {
  return SETUP_STEPS.filter((s) => admin || !s.adminOnly).map((s) => {
    const n = counts[s.key] ?? 0;
    const total = counts.entriesTotal ?? 0;
    const done = s.key === "content" || s.key === "rooms" ? total > 0 && n >= total : n > 0;
    const state: SetupState["state"] = done ? "done" : skipped.includes(s.key) ? "skipped" : "todo";
    const detail = s.key === "entries" ? (n ? `${n} on record` : "The house connects these; tell us in Support if one is missing")
      : s.key === "content" || s.key === "rooms" ? (total ? `${Math.min(n, total)} of ${total} properties` : "Once your properties are connected")
      : s.key === "company" ? (n ? "On record" : "Not filled in yet")
      : n ? `${n} on record` : s.optional ? "Optional" : "Nothing yet";
    return { ...s, state, detail };
  });
}

export const setupProgress = (states: SetupState[]) => ({ done: states.filter((s) => s.state !== "todo").length, total: states.length });
