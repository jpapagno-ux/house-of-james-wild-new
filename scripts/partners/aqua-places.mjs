// Where Aqua Expeditions' day-by-day stops sit, for the route charts. Approximate positions of the
// named anchorage, village or landing (rank 2) or, failing one, the island, river or region (rank 1).
// A day's pin is the highest-ranked place it names; at a tie, the last one named (where she ends the day).
export const PLACES = [
  // Cambodia and Vietnam (Mekong, Tonle Sap)
  ["phnom penh", 11.5564, 104.9282, 2], ["koh chen", 11.72, 104.9, 2], ["kampong chhnang", 12.25, 104.67, 2], ["kampong prasat", 11.86, 104.8, 2],
  ["kampong tralach", 11.9, 104.77, 2], ["chhnok tru", 12.52, 104.45, 2], ["moat khla", 12.82, 104.22, 2], ["prek toal", 13.18, 103.66, 2],
  ["siem reap", 13.25, 103.83, 2], ["phat sandai", 12.57, 104.5, 2], ["phnom neang kangrey", 12.4, 104.6, 2], ["koh okhna tey", 11.53, 104.98, 2],
  ["koh oknha tey", 11.53, 104.98, 2], ["preah prosop", 11.66, 105.0, 2], ["angkor ban", 12.07, 105.37, 2], ["phnom han", 12.15, 105.42, 2],
  ["kratie", 12.49, 106.02, 2], ["kampi", 12.62, 106.0, 2], ["kampong cham", 11.99, 105.46, 2], ["peam chikang", 11.95, 105.55, 2],
  ["chau doc", 10.7, 105.12, 2], ["vinh xuong", 10.89, 105.17, 2], ["my an hung", 10.4, 105.6, 2], ["sa dec", 10.29, 105.76, 2],
  ["binh thanh", 10.3, 105.73, 2], ["cai be", 10.33, 106.03, 2], ["my tho", 10.36, 106.36, 2], ["ho chi minh", 10.776, 106.7, 1],
  ["tonle sap lake", 12.9, 104.1, 1], ["tonle sap river", 11.9, 104.8, 1], ["mekong river", 11.4, 105.1, 1],
  // Peru (Amazon)
  ["iquitos", -3.7437, -73.2516, 2], ["nauta", -4.5076, -73.5781, 2], ["manatee", -3.8, -73.3, 2], ["tahuayo", -4.3, -73.2, 2],
  ["clavero", -4.58, -73.55, 2], ["yanayacu pucate", -4.65, -73.95, 2], ["samiria", -4.8, -74.2, 2], ["puerto prado", -4.4, -73.68, 2],
  ["yacapana", -4.35, -73.45, 2], ["nauta caño", -4.45, -73.55, 2], ["dorado", -4.85, -73.85, 2], ["yanallpa", -4.85, -73.85, 2],
  ["puinahua", -5.1, -74.1, 2], ["zapote", -5.0, -74.0, 2], ["yarapa", -4.42, -73.48, 2], ["san pedro", -4.35, -73.25, 2],
  ["marañon", -4.48, -73.65, 1], ["ucayali", -4.55, -73.62, 1], ["amazon", -4.25, -73.4, 1],
  // Galápagos
  ["puerto ayora", -0.7433, -90.3133, 2], ["manzanillo", -0.65, -90.4, 2], ["el chato", -0.67, -90.42, 2], ["los gemelos", -0.62, -90.38, 2],
  ["fausto llerena", -0.7433, -90.3033, 2], ["punta cormorant", -1.22, -90.42, 2], ["punta moreno", -0.71, -91.33, 2], ["urbina", -0.39, -91.23, 2],
  ["punta espinoza", -0.27, -91.44, 2], ["caleta tagus", -0.27, -91.37, 2], ["puerto egas", -0.24, -90.86, 2], ["puerta egas", -0.24, -90.86, 2],
  ["rábida", -0.41, -90.71, 2], ["tortuga negra", -0.5, -90.27, 2], ["seymour", -0.39, -90.29, 2], ["mosquera", -0.41, -90.27, 2],
  ["baltra", -0.44, -90.27, 2], ["genovesa", -0.31, -89.96, 2], ["bahía darwin", -0.31, -89.96, 2], ["sullivan", -0.29, -90.58, 2],
  ["sombrero chino", -0.37, -90.58, 2], ["bartolomé", -0.28, -90.55, 2], ["cerro dragón", -0.54, -90.48, 2], ["punta suárez", -1.37, -89.74, 2],
  ["gardner", -1.35, -89.65, 2], ["santa fé", -0.82, -90.06, 2], ["sante fé", -0.82, -90.06, 2], ["plaza sur", -0.58, -90.16, 2],
  ["santa cruz island", -0.62, -90.37, 1], ["floreana", -1.28, -90.43, 1], ["isabela", -0.6, -91.1, 1], ["santiago island", -0.24, -90.75, 1],
  // Indonesia
  ["sorong", -0.8762, 131.2558, 2], ["mioskon", -0.53, 130.68, 2], ["mayalibit", -0.3, 130.95, 2], ["yangeffo", -0.5, 130.64, 2],
  ["aljui", -0.17, 130.25, 2], ["wofoh", -0.12, 130.18, 2], ["wayag", 0.17, 130.03, 2], ["penemu", -0.58, 130.27, 2], ["arborek", -0.57, 130.52, 2],
  ["kabui", -0.43, 130.55, 2], ["cape kri", -0.56, 130.68, 2], ["thousand temples", -1.95, 130.2, 2], ["fiabacet", -1.9, 130.2, 2],
  ["fibiacet", -1.9, 130.2, 2], ["neptune", -1.9, 130.15, 2], ["wayil", -2.05, 130.3, 2], ["misool", -1.95, 130.0, 1], ["kapatcol", -1.87, 130.13, 2],
  ["boo ", -1.65, 129.45, 2], ["kofiu", -1.18, 129.85, 2], ["daram", -2.05, 130.6, 2], ["pulau koon", -3.98, 131.4, 2], ["banda", -4.52, 129.9, 2],
  ["pulau ai", -4.52, 129.68, 2], ["ambon", -3.6954, 128.1814, 2], ["hila", -3.58, 128.08, 2], ["nusa laut", -3.66, 128.78, 2], ["boano", -2.95, 127.9, 2],
  ["pulau manuk", -5.55, 130.3, 2], ["serua", -6.3, 130.02, 2], ["nil desperandum", -6.15, 129.8, 2], ["romang", -7.6, 127.4, 2],
  ["wetar", -7.8, 126.3, 2], ["alor", -8.25, 124.55, 2], ["maumere", -8.62, 122.21, 2], ["sabulon", -8.4, 121.3, 2], ["labuan bajo", -8.4964, 119.8877, 2],
  ["batu moncho", -8.43, 119.62, 2], ["gili lawa", -8.3, 119.63, 2], ["rinca", -8.65, 119.72, 2], ["nusa kode", -8.8, 119.6, 2], ["tatawa", -8.56, 119.62, 2],
  ["seraya", -8.48, 119.8, 2], ["gili banta", -8.42, 119.32, 2], ["saleh bay", -8.4, 117.8, 2], ["satonda", -8.12, 117.75, 2], ["moyo", -8.25, 117.55, 2],
  ["benoa", -8.75, 115.22, 2], ["triton bay", -3.85, 134.05, 2], ["momon", -3.7, 133.9, 2], ["biwar", -5.6, 138.2, 2], ["aru islands", -6.2, 134.5, 2],
  ["kei islands", -5.65, 132.75, 2], ["sabuda", -2.95, 132.9, 2], ["yeben", -0.45, 130.6, 2],
  // Seychelles and Tanzania
  ["l'escale", -4.63, 55.45, 2], ["beau vallon", -4.61, 55.43, 2], ["silhouette", -4.48, 55.24, 2], ["north islands", -4.39, 55.24, 2],
  ["praslin", -4.32, 55.73, 2], ["cousin", -4.33, 55.66, 2], ["aride", -4.21, 55.66, 2], ["la digue", -4.36, 55.84, 2], ["curieuse", -4.28, 55.73, 2],
  ["grande soeur", -4.28, 55.87, 2], ["arros", -5.41, 53.3, 2], ["desroches", -5.69, 53.66, 2], ["alphonse", -7.02, 52.73, 2],
  ["providence", -9.23, 51.03, 2], ["cosmoledo", -9.72, 47.58, 2], ["astove", -10.07, 47.75, 2], ["assumption", -9.74, 46.51, 2],
  ["aldabra atoll", -9.42, 46.35, 2], ["kilindoni", -7.92, 39.66, 2], ["chole", -7.9, 39.78, 2], ["mafia", -7.9, 39.75, 1], ["zanzibar", -6.16, 39.19, 2],
  // The Arctic, Norway and Scotland
  ["longyearbyen", 78.2232, 15.6267, 2], ["alkehornet", 78.21, 13.83, 2], ["krossfjorden", 79.1, 11.8, 2], ["kongsfjorden", 78.95, 12.0, 2],
  ["gravneset", 79.73, 11.08, 2], ["sorgfjorden", 79.95, 16.7, 2], ["torellneset", 79.38, 20.75, 2], ["hinlopen", 79.5, 18.5, 2],
  ["alkefjellet", 79.58, 18.53, 2], ["pack ice", 80.6, 17.0, 2], ["calypsobyen", 77.57, 14.5, 2], ["hornsund", 77.0, 15.6, 2],
  ["sørkapp", 76.48, 16.55, 1], ["bear island", 74.45, 19.05, 2], ["tromsø", 69.6492, 18.9553, 2], ["bleik", 69.27, 15.96, 2],
  ["nusfjord", 68.03, 13.35, 2], ["trollfjorden", 68.35, 14.95, 1], ["brønnøysund", 65.47, 12.21, 2], ["smøla", 63.4, 8.0, 2],
  ["ålesund", 62.4722, 6.1495, 2], ["mousa", 60.0, -1.18, 2], ["callanish", 58.2, -6.75, 2], ["luskentyre", 57.88, -6.95, 2],
  ["st kilda", 57.81, -8.58, 2], ["iona", 56.33, -6.39, 2], ["staffa", 56.43, -6.34, 2], ["glasgow", 55.8642, -4.2518, 2],
];

export function pin(text) {
  const t = ` ${text.toLowerCase()} `;
  let best = null;
  for (const [k, lat, lng, rank] of PLACES) {
    const i = t.lastIndexOf(k);
    if (i < 0) continue;
    if (!best || rank > best.rank || (rank === best.rank && i > best.i)) best = { k, lat, lng, rank, i };
  }
  return best;
}
