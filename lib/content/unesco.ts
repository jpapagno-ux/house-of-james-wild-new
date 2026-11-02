// UNESCO World Heritage sites as a reusable chart layer (James, 1 Nov 2026: "adding UNESCO places").
// Names, inscription years and reference numbers from UNESCO's World Heritage List; positions are a
// representative point for the property (approximate on the charts). A transnational property with no
// single point (Qhapaq Ñan) carries no position and is listed, not pinned.
export type UnescoSite = { id: string; name: string; country: string; year: number; lat: number | null; lng: number | null };

export const UNESCO: UnescoSite[] = [
  // Bolivia
  { id: "420", name: "City of Potosí", country: "bolivia", year: 1987, lat: -19.589, lng: -65.753 },
  { id: "529", name: "Jesuit Missions of the Chiquitos", country: "bolivia", year: 1990, lat: -17.846, lng: -60.741 },
  { id: "566", name: "Historic City of Sucre", country: "bolivia", year: 1991, lat: -19.048, lng: -65.26 },
  { id: "883", name: "Fuerte de Samaipata", country: "bolivia", year: 1998, lat: -18.175, lng: -63.819 },
  { id: "567", name: "Tiwanaku", country: "bolivia", year: 2000, lat: -16.555, lng: -68.673 },
  { id: "967", name: "Noel Kempff Mercado National Park", country: "bolivia", year: 2000, lat: -14.0, lng: -60.9 },
  // Chile
  { id: "715", name: "Rapa Nui National Park", country: "chile", year: 1995, lat: -27.12, lng: -109.35 },
  { id: "971", name: "Churches of Chiloé", country: "chile", year: 2000, lat: -42.48, lng: -73.76 },
  { id: "959", name: "Historic Quarter of Valparaíso", country: "chile", year: 2003, lat: -33.046, lng: -71.62 },
  { id: "1178", name: "Humberstone and Santa Laura Saltpeter Works", country: "chile", year: 2005, lat: -20.206, lng: -69.794 },
  { id: "1214", name: "Sewell Mining Town", country: "chile", year: 2006, lat: -34.084, lng: -70.384 },
  { id: "1634", name: "Chinchorro Culture, Arica and Parinacota", country: "chile", year: 2021, lat: -18.48, lng: -70.32 },
  // Portugal (the flyover into Portugal, 1 Nov 2026)
  { id: "263", name: "Monastery of the Hieronymites and Tower of Belém in Lisbon", country: "portugal", year: 1983, lat: 38.697, lng: -9.206 },
  { id: "361", name: "Historic Centre of Évora", country: "portugal", year: 1986, lat: 38.571, lng: -7.909 },
  { id: "723", name: "Cultural Landscape of Sintra", country: "portugal", year: 1995, lat: 38.787, lng: -9.39 },
  { id: "755", name: "Historic Centre of Oporto", country: "portugal", year: 1996, lat: 41.141, lng: -8.611 },
  { id: "866", name: "Prehistoric Rock Art Sites in the Côa Valley", country: "portugal", year: 1998, lat: 41.08, lng: -7.11 },
  { id: "1046", name: "Alto Douro Wine Region", country: "portugal", year: 2001, lat: 41.13, lng: -7.42 },
  { id: "1367", name: "Garrison Border Town of Elvas and its Fortifications", country: "portugal", year: 2012, lat: 38.881, lng: -7.163 },
  // Transnational
  { id: "1459", name: "Qhapaq Ñan, Andean Road System", country: "chile,bolivia,peru,ecuador,argentina,colombia", year: 2014, lat: null, lng: null },
];

export const unescoUrl = (id: string) => `https://whc.unesco.org/en/list/${id}`;
