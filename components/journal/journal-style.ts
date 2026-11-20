// JWC-STYLE-01, the Modern Journal design pilot: the primitives every stage builds from. A page uses them only when
// journalStyle(searchParams) is true (lib/journal-style/flag.ts). The editorial Journal's own components in this
// folder (FromTheJournal, LoopVideo, Prose) are separate and unchanged.
export { default as SectionHead } from "./SectionHead";
export { default as TapedPhoto } from "./TapedPhoto";
export { default as Stamp } from "./Stamp";
export { default as LedgerList, type LedgerItem } from "./LedgerList";
export { default as Ticket } from "./Ticket";
export { default as AccordionRow } from "./AccordionRow";
export { default as StickyBar } from "./StickyBar";
// Stages 1 to 9: the stay page's sections.
export { default as JournalHero } from "./JournalHero";
export { default as JournalJumpRow } from "./JournalJumpRow";
export { default as JournalOverview } from "./JournalOverview";
export { default as JournalRooms } from "./JournalRooms";
export { default as JournalOffers } from "./JournalOffers";
export { default as JournalExperiences } from "./JournalExperiences";
export { default as JournalDetail } from "./JournalDetail";
export { default as JournalReserve } from "./JournalReserve";
export { default as JournalMap } from "./JournalMap";
export { default as JournalQuestions } from "./JournalQuestions";
export { default as Postcard } from "./Postcard";
// The photograph viewer and the "just this stay" path.
export { default as PhotoViewer } from "./PhotoViewer";
export { PhotoLink, PhotoStrip } from "./PhotoLink";
export { DatesBar, PickRoom, RequestForm } from "./TripControls";
