// The enquiry: one shape shared by the /plan form and the /api/enquiry
// route, validated the same way on both sides. Kept free of imports so it
// can be tested with plain Node.

export type Enquiry = {
  name: string;
  email: string;
  phone?: string;
  where?: string;
  when?: string;
  nights?: string;
  adults: number;
  children: number;
  budget?: string;
  interests: string[];
  contact: "email" | "phone" | "video";
  callTime?: string;
  hasAdvisor: boolean;
  advisorDetails?: string;
  message?: string;
  travelNotes: boolean;
  // context carried from the page that sent the traveller here
  context: { advisor?: string; from?: string; trip?: string; option?: string; travellers?: string; addons?: string; estimate?: string; destination?: string; route?: string; q?: string; folio?: string; notes?: string };
  website?: string; // honeypot: must stay empty
};

export const INTERESTS = ["Safari", "Small ship or yacht", "Overland route", "A single stay", "Family residence", "Diving or surf", "Honeymoon", "Celebration"] as const;
export const BUDGETS = ["Under US$5,000 pp", "US$5,000–10,000 pp", "US$10,000–20,000 pp", "US$20,000+ pp", "Not sure yet"] as const;
export const CALL_TIMES = ["Weekday morning (ET)", "Weekday afternoon (ET)", "Weekday evening (ET)", "Weekend"] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnquiry(e: Partial<Enquiry>): Record<string, string> {
  const err: Record<string, string> = {};
  if (!e.name || e.name.trim().length < 2) err.name = "Please tell us your name.";
  if (!e.email || !EMAIL.test(e.email.trim())) err.email = "Please enter an email address we can reply to.";
  if ((e.contact === "phone" || e.contact === "video") && !(e.phone && e.phone.replace(/\D/g, "").length >= 7)) err.phone = "Add a phone number so we can call you.";
  if (!e.where?.trim() && !e.context?.trip && !e.context?.folio && !e.message?.trim()) err.where = "Tell us where you're drawn, even roughly, or add a note.";
  if (typeof e.adults !== "number" || e.adults < 1) err.adults = "At least one adult, please.";
  if (e.hasAdvisor && !e.advisorDetails?.trim()) err.advisorDetails = "Add your advisor's name or email so we can coordinate.";
  if (e.message && e.message.length > 4000) err.message = "That's a long note. Please keep it under 4,000 characters.";
  return err;
}
