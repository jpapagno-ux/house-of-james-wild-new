// The sample card exactly as created in the Airtable base "James Wild & Co —
// Commercial Rates (Booking Live)" on 27 Oct 2026 (fields by name, as the
// Airtable REST API returns them). ILLUSTRATIVE figures, not contracted rates.
import type { Base } from "../../lib/booking-live/rates/airtable-map.ts";

export const SAMPLE_BASE: Base = {
  properties: [{ id: "recd3kN9tKfEQE2DF", fields: { "Ledger ID": "STY-2026-000148", Property: "Leeu Estates, Franschhoek", "Site Slug": "leeu-estates", "Time Zone": "Africa/Johannesburg", "Booking Mode": "Request", "Merchant Model": "Supplier-direct" } }],
  roomTypes: [{ id: "recOa2Adq9eV0zvC3", fields: { "Room Code": "manor-suite", "Room Name": "Manor House Suite (sample)", "Max Adults": 3, "Max Children": 2, "Max Occupancy": 4, Active: true, Property: ["recd3kN9tKfEQE2DF"] } }],
  ratePlans: [{ id: "rec4VpOQbIiOZymuO", fields: { "Plan Code": "bb", "Plan Name": "Bed & breakfast (sample)", "Board Basis": "Bed & breakfast", Refundability: "Partially refundable", Inclusions: "Breakfast daily, Wi-Fi, estate wine tasting", Active: true, "Room Type": ["recOa2Adq9eV0zvC3"] } }],
  cards: [{ id: "recdv4NjxpNApVooT", fields: { Card: "SAMPLE-2027-V1", Status: "Published", Currency: "USD", "Effective From": "2027-01-01", "Effective To": "2027-12-31", "Contract Reference": "SAMPLE — not a real contract", "Deposit %": 0.3, "Balance Due (days before arrival)": 60, "Cancellation Summary": "Full refund until 60 days before arrival. 30% of the total from 60 days; 100% from 30 days.", "Cancellation Tiers": "60:30, 30:100", Revision: 1, "Sample Data": true, Property: ["recd3kN9tKfEQE2DF"] } }],
  rates: [
    { id: "reca8clKz5C6aS5W8", fields: { Season: "Summer", "Stay Start": "2027-01-06", "Stay End": "2027-04-30", "Base Occupancy": 2, "Nightly Gross": 1200, "Extra Adult": 300, "Child 0-3": 0, "Child 4-11": 150, "Child 12-17": 250, "Min Nights": 2, Priority: 0, Active: true, "Rate Card": ["recdv4NjxpNApVooT"], "Room Type": ["recOa2Adq9eV0zvC3"], "Rate Plan": ["rec4VpOQbIiOZymuO"] } },
    { id: "recwEvvGR01Fu0yHo", fields: { Season: "Winter", "Stay Start": "2027-05-01", "Stay End": "2027-08-31", "Base Occupancy": 2, "Nightly Gross": 850, "Extra Adult": 250, "Child 0-3": 0, "Child 4-11": 120, "Child 12-17": 200, "Min Nights": 2, Priority: 0, Active: true, "Rate Card": ["recdv4NjxpNApVooT"], "Room Type": ["recOa2Adq9eV0zvC3"], "Rate Plan": ["rec4VpOQbIiOZymuO"] } },
    { id: "recbFX3XyDHA4x5CV", fields: { Season: "Spring", "Stay Start": "2027-09-01", "Stay End": "2027-12-19", "Base Occupancy": 2, "Nightly Gross": 1050, "Extra Adult": 275, "Child 0-3": 0, "Child 4-11": 140, "Child 12-17": 225, "Min Nights": 2, Priority: 0, Active: true, "Rate Card": ["recdv4NjxpNApVooT"], "Room Type": ["recOa2Adq9eV0zvC3"], "Rate Plan": ["rec4VpOQbIiOZymuO"] } },
    { id: "recgHYZ57SxumCDPN", fields: { Season: "Festive", "Stay Start": "2027-12-20", "Stay End": "2027-12-31", "Base Occupancy": 2, "Nightly Gross": 1650, "Extra Adult": 400, "Child 0-3": 0, "Child 4-11": 200, "Child 12-17": 300, "Min Nights": 5, Priority: 1, Active: true, "Rate Card": ["recdv4NjxpNApVooT"], "Room Type": ["recOa2Adq9eV0zvC3"], "Rate Plan": ["rec4VpOQbIiOZymuO"] } },
  ],
  taxes: [
    { id: "recCP56z29Ewn3Q55", fields: { Name: "VAT 15% (included)", Kind: "Tax", Basis: "% of room", Percent: 0.15, "Included in Rate": true, Jurisdiction: "South Africa", "Rate Card": ["recdv4NjxpNApVooT"] } },
    { id: "recF70Os38v0FNCsG", fields: { Name: "Tourism levy 1%", Kind: "Tax", Basis: "% of room", Percent: 0.01, Jurisdiction: "South Africa", "Rate Card": ["recdv4NjxpNApVooT"] } },
  ],
  promotions: [{ id: "recdzQE7Sj4mF9esK", fields: { Code: "WORTH-ANOTHER-NIGHT", Label: "Worth Another Night: stay 4, pay 3 (sample)", Type: "Stay N pay N-1", Value: 4, "Stay Start": "2027-05-01", "Stay End": "2027-08-31", "Min Nights": 4, Stacking: "Exclusive", Approval: "Approved", "Rate Card": ["recdv4NjxpNApVooT"] } }],
  restrictions: [],
  terms: [{ id: "recFJ6sXBlKHNZPug", fields: { Term: "SAMPLE terms — Leeu 2027-V1", "Commission %": 0.15, "Net Rate Notes": "Sample only. Gross rates shown; 15% commission illustrative.", "Rate Card": ["recdv4NjxpNApVooT"] } }],
};
