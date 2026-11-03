import { STAYS } from "@/lib/content/stays";
import { CONTENT_FIELD } from "./content";

/** What the public stay page shows today for a content field, from the Library export. */
export function siteValue(ledgerId: string, key: string): string | string[] | null {
  const s = STAYS.find((x) => x.ledgerId === ledgerId) as unknown as Record<string, unknown> | undefined;
  const f = CONTENT_FIELD[key];
  return s && f?.site ? f.site(s) : null;
}
