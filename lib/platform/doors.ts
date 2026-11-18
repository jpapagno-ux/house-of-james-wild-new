// The trade's sign-in doors as plain links, for the places the three-door "Sign in" panel
// (components/ledger/SignInDoors.tsx) does not reach: the full-screen menu on phones and
// tablets, and the footer (James, 18 Nov 2026). A door is listed only while its desk is
// switched on in this build, so a link never leads to a 404. The traveler's door is
// "My Folio", already in both places.
import { ADVISOR_DESK, PARTNER_DESK } from "./flags";

export const ADVISOR_SIGN_IN = "/advisor/login";
export const PARTNER_SIGN_IN = "/partner/login";

export const TRADE_SIGN_INS: { href: string; label: string }[] = [
  ...(ADVISOR_DESK ? [{ href: ADVISOR_SIGN_IN, label: "Advisor sign in" }] : []),
  ...(PARTNER_DESK ? [{ href: PARTNER_SIGN_IN, label: "Partner sign in" }] : []),
];
