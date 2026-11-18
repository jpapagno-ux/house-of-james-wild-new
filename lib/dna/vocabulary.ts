// The shared DNA (James, 18 Nov 2026: "approved"). Six questions, asked word for word of an advisor at
// onboarding and on their desk, and of a traveller in the match. One vocabulary, here, so a traveller and an
// advisor can only ever be compared on the same terms. Import-free so plain Node can test it; a test fails
// when the application form, the desk DNA or the match drifts from it.

export type DnaQuestionId = "drawn" | "where" | "how" | "do" | "who" | "language";

/** The six questions: what the traveller is asked, what the advisor is asked, and what the answer is. */
export const DNA_QUESTIONS: { id: DnaQuestionId; traveller: string; advisor: string; field: string }[] = [
  { id: "drawn", traveller: "Where are you drawn?", advisor: "Which Wild Pathways do you carry?", field: "pathways" },
  { id: "where", traveller: "Where would you go?", advisor: "Which countries do you know first-hand?", field: "countries" },
  { id: "how", traveller: "How do you want to travel?", advisor: "Which volumes do you plan?", field: "volumes" },
  { id: "do", traveller: "What do you want to do?", advisor: "What are your specialties?", field: "specialties" },
  { id: "who", traveller: "Who is travelling?", advisor: "Who do you plan best for?", field: "partyTypes" },
  { id: "language", traveller: "Which language would you like to plan in?", advisor: "Which languages do you plan in?", field: "languages" },
];

/** Wild Pathways an advisor can carry (the DNA's eight; The Far Edge joins when the desk accepts it). */
export const DNA_PATHWAY_NAMES: [string, string, string][] = [
  ["PATH-01", "Into the Green", "Rainforest and jungle"],
  ["PATH-02", "Between Tides", "Islands and oceans"],
  ["PATH-03", "Above It All", "Mountains and highlands"],
  ["PATH-04", "Where the Wild Lives", "Wildlife and wilderness"],
  ["PATH-05", "The Art of Stillness", "Wellness and restoration"],
  ["PATH-06", "Off the Map", "Hidden and undiscovered"],
  ["PATH-07", "A Place of Our Own", "Private residences"],
  ["PATH-08", "Rooted in Place", "Heritage and culture"],
];

export const DNA_VOLUME_LABELS: [string, string][] = [["stays", "Stays"], ["safaris", "Safaris"], ["gatherings", "Gatherings"], ["voyages", "Voyages"], ["overland", "Overland"], ["europe", "The Other Europe"]];
export const DNA_PARTY_LABELS: [string, string][] = [["couple", "Couples"], ["family", "Families"], ["friends", "Friends"], ["solo", "Solo travellers"], ["group", "Groups"]];

/** One list of specialties for both sides (the application's fifteen, plus those already on approved cards). */
export const DNA_SPECIALTIES = [
  "First safaris", "Private reserves", "Small ships & sailing yachts", "Islands & reefs", "Family gatherings", "Multigenerational",
  "Wellness & health retreats", "Honeymoons", "Wine country", "Routes by road", "Polar voyages", "Diving & surf",
  "Nature & wildlife", "Hikes & trails", "Rainforest & cloud forest", "Celebrations",
] as const;

export const DNA_LANGUAGES = ["English", "Spanish", "French", "Italian", "Portuguese", "German"] as const;
