// Coordinates of the stays in the Ledger in South Africa (Base44 Stay
// records, 24 Oct 2026), for the faint "also in the Ledger" pins on South
// African location maps. Gorongosa Safaris is left out: its record carries
// Franschhoek's coordinates by mistake.
export const ZA_LEDGER_PINS: { name: string; lat: number; lng: number }[] = [
  ["Morukuru Farm House", -24.801461, 26.408333], ["Lion Sands Reserve", -24.9723, 31.5312], ["Tswalu Reserve", -27.2025897, 22.4807213],
  ["Londolozi Reserve", -24.801461, 31.498252], ["Lalibela Reserve", -33.470578, 26.25462], ["Phinda Homestead", -27.8569, 32.3653],
  ["Kwandwe", -33.1287, 26.5913], ["Lekkerwater De Hoop", -34.4517, 20.5493], ["Gwe Gwe Beach Lodge", -31.2762, 29.9993],
  ["Royal Malewane", -24.425, 31.1167], ["Birkenhead House", -34.4329, 19.2524], ["Tanda Tula", -24.3231, 31.3308],
  ["Singita Lebombo", -24.491, 31.9616], ["Singita Ebony", -24.981234, 31.392345], ["Samara Karoo Reserve", -32.4422, 24.8365],
  ["Ngala Safari Lodge", -24.1887, 31.3332], ["Monwana Thornybush", -24.4372, 31.1336], ["Leopard Hills", -24.8015, 31.4828],
  ["Leeu Estates", -33.9156, 19.1127], ["Grootbos", -34.6, 19.35], ["Ellerman House", -33.9106, 18.3952],
  ["Cheetah Plains", -24.739236, 31.575672], ["The Silo Hotel", -33.9068, 18.4185], ["Babylonstoren", -33.831, 18.9334],
].map(([name, lat, lng]) => ({ name: name as string, lat: lat as number, lng: lng as number }));

export const zaOthers = (exclude: string) => ZA_LEDGER_PINS.filter((p) => p.name !== exclude);
