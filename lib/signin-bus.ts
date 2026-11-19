// Opens the three sign-in doors from anywhere (the phone bar, the House menu), James 19 Nov 2026: "I can't see logins on mobile".
export const SIGN_IN_EVENT = "jw:sign-in";
export function openSignIn() { if (typeof window !== "undefined") window.dispatchEvent(new Event(SIGN_IN_EVENT)); }
