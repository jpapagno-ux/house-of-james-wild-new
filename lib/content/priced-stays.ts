// Stays with live pricing get the booking layout: rooms with photo carousels,
// live engine prices per room, a sample checkout, inclusions and a film.
// Rooms and photos are the library's Room records (parent Leeu Estates,
// STY-2026-000148); "from" prices are the registry rates in ZAR per night.
// Inclusions: the library's Room.included / Room.excluded are empty for Leeu,
// so only what the Stay record states is shown, and the rest is flagged.

export type PricedRoom = { name: string; kind: "room" | "house"; sleeps?: string; beds?: string; fromZar?: number; photos: string[] };
export type PricedStay = {
  slug: string;
  video?: { id: string; title: string };
  included: string[];
  excluded: string[];
  policies: string[];
  pending: string; // what the library still needs, shown in the preview note
  rooms: PricedRoom[];
};

const W = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/";
const p = (...ids: string[]) => ids.map((i) => W + i);

export const PRICED: Record<string, PricedStay> = {
  "leeu-estates": {
    slug: "leeu-estates",
    video: { id: "rLbbxGMH9C8", title: "Leeu Estates, Franschhoek" },
    included: [
      "Complimentary estate experiences, as the estate lists them",
      "Your room, suite or whole cottage or house for the dates booked",
      "James Wild & Co trip support before and during your stay",
    ],
    excluded: [
      "Taxes and fees: the engine's prices are shown before tax",
      "Flights and the 60–75 minute drive from Cape Town (CPT); James arranges transfers on request",
      "Dining, wine tastings and spa treatments unless your rate says otherwise",
    ],
    policies: [
      "The engine shows the cancellation and deposit terms for your exact rate before you pay.",
      "Nothing is charged until the house confirms your Folio and the estate accepts the booking.",
    ],
    pending: "Room-level inclusions (Room.included / Room.excluded) and the estate's RatePolicy record are empty in the library; the lists above are drawn from the Stay record and need the estate's confirmation.",
    rooms: [
      { name: "Classic Room", kind: "room", fromZar: 16500, photos: p("6a8a306975e3ac54f420f9f2_6a234d2df3a0f3e6b205a170_60264abb94eb7-01%25402x.jpeg", "6a8a306975e3ac54f420f9e5_6a234d5481e59ac3e099ac6e_60264ab0ca2ce-03%25402x%2520(1).jpeg", "6a8a306975e3ac54f420f9f5_6a234d5443e8a59fca2f1dd3_60264ab6866de-02%25402x.jpeg") },
      { name: "Deluxe Room", kind: "room", fromZar: 18500, photos: p("6a8a306a7ef954f18e860975_6a234d8bb36287e49f9d2f93_60264b095a605-01%25402x.jpeg", "6a8a306a7ef954f18e860970_6a234dd2e5838f5a953d9218_60264b0432a63-02%25402x.jpeg", "6a8a306975e3ac54f420f9f5_6a234d5443e8a59fca2f1dd3_60264ab6866de-02%25402x.jpeg") },
      { name: "Studio Room", kind: "room", sleeps: "1–2", beds: "1 queen bed", fromZar: 23000, photos: p("6a8a2b699caa72f1f26b085f_6a863106-6a234e07915b1554b8aaba19_6343ec2f4ab03-01.jpeg", "6a8a2b689caa72f1f26b0858_6a234e1c060dcd77208b38e3_60264ba8aa694-03%25402x.jpeg", "6a8a2b689caa72f1f26b085b_6a234e1cd413fab5b9f2a67d_6343f7110e922-03%2520(1).jpeg") },
      { name: "Executive Suite", kind: "room", fromZar: 29500, photos: p("6a8a306bffa80d7c6245b1f2_6a234ea74b5f9b67c1f6e568_60264c186db9b-01%25402x.jpeg", "6a8a306bffa80d7c6245b1f5_6a234ec656cabbebec4c0b02_60264c0a28027-03%25402x.jpeg", "6a8a306bffa80d7c6245b1f9_6a234ecbc89286f0a5e931f4_60264c0547253-04%25402x.jpeg", "6a8a306bffa80d7c6245b1fc_6a234ecbafc2c21897f659fc_60264c126fab4-02%25402x.jpeg") },
      { name: "Executive Suite with Terrace", kind: "room", fromZar: 35000, photos: p("6a8a306d7ef954f18e860b13_6a234efb1244f64fc6d34818_63737bf653d99-02.jpeg", "6a8a306d7ef954f18e860b10_6a234f18e3e4087241c8c954_63737bf46d2d3-01.jpeg", "6a8a306d7ef954f18e860b1c_6a234f18151f781efe21e221_63737bf8c43e2-03.jpeg", "6a8a306d7ef954f18e860b17_6a234f181f1729c0f382ae8c_63737bfb42624-04.jpeg") },
      { name: "Manor House Suite", kind: "room", fromZar: 42000, photos: p("6a8a3071aefdfff15877cc94_6a23505d419faca227cd0bdf_63739572dc39d-01%2520(8).jpeg", "6a8a3071aefdfff15877cc8d_6a23506dfaa14b8e901a7bbf_6373955f8add8-03346erdfgyh.jpeg", "6a8a3071aefdfff15877cc91_6a23506e04a3068d6825eff2_6373955f8a22c-05%2520(1).jpeg", "6a8a3071aefdfff15877cc98_6a23507204a3068d6825f083_6373956e30270-02%2520(2).jpeg", "6a8a3071aefdfff15877cc9b_6a235072212b596a22bafeaf_6373956e25a8d-04.jpeg") },
      { name: "Terroir Cottage", kind: "house", fromZar: 39000, photos: p("6a8a3078a7b9defbda1512d9_6a234fb9fea507fcd5a18c13_Leeu%2520Estates%2520-%2520Terroir%2520Cottage%2520(9)%25402x.jpeg", "6a8a3078a7b9defbda1512dc_6a234fe9419faca227ccf641_Leeu%2520Estates%2520-%2520Terroir%2520Cottage%2520(11)%25402x.jpeg", "6a8a3078a7b9defbda1512e2_6a234fe9fea507fcd5a1977d_Leeu%2520Estates%2520-%2520Terroir%2520Cottage%2520(8)%25402x.jpeg") },
      { name: "The Oaks", kind: "house", fromZar: 45000, photos: p("6a8a307b75e3ac54f42101ee_6a2350b9afc2c21897f6e450_60be20f54a24b-01%25402x.jpeg", "6a8a307b75e3ac54f42101fc_6a2350ec42b15dbd5eb3c4dc_602a8c44aa6e3-04%25402x.jpeg", "6a8a307b75e3ac54f42101f5_6a2350ec5f3bc67e5afb86a3_602a8c3f97add-03%25402x.jpeg", "6a8a307b75e3ac54f42101ff_6a2350eccd43425d1f0cce82_602a8c3ac7d36-02%25402x.jpeg", "6a8a307b75e3ac54f4210206_6a2350eccfd54c7abbc5ddc4_602a8c35eadd6-01%25402x.jpeg") },
      { name: "Fynbosch Cottage", kind: "house", fromZar: 51000, photos: p("6a8a306f45c069bead8c279c_6a23515de7cacc184c573628_602a88ecaa322-04%25402x.jpeg", "6a8a306f45c069bead8c279f_6a2351846ffe73133a66450a_602a88e756345-03%25402x.jpeg", "6a8a306f45c069bead8c27a3_6a235184d673415e40e0ecfa_60be169e7b8ee-02%25402x.jpeg", "6a8a306f45c069bead8c27aa_6a2351844376a98bdc7b6fa7_602a88dec5899-01%25402x.jpeg", "6a8a306f45c069bead8c27ae_6a2351842fe961c8b07e322c_60be16a769c13-01%25402x.jpeg") },
      { name: "Vineyard Cottage", kind: "house", fromZar: 53500, photos: p("6a8a307ce1fc7cdb75a158db_6a2351c599cf14202bb313e2_60225997c5c65-01%25402x.jpeg", "6a8a307ce1fc7cdb75a158df_6a2351dd06bab5cc52f4969a_60be0e6440b5a-02%25402x.jpeg", "6a8a307ce1fc7cdb75a158d8_6a2351dcfaa14b8e901ac6a6_60be0e5a13da1-01%25402x.jpeg") },
      { name: "Cellar Cottage", kind: "house", fromZar: 53500, photos: p("6a8a3068ffa80d7c6245b039_6a23522cf01fd4077e015fb9_6026631591db3-01%25402x.jpeg", "6a8a3068ffa80d7c6245b036_6a235238732f5d551f7057f6_60266323bdcf3-03%25402x%2520(1).jpeg", "6a8a3068ffa80d7c6245b03d_6a2352388dc4bef8a0e614b7_602663440a243-04%25402x.jpeg", "6a8a3068ffa80d7c6245b040_6a23523ca3ba6f86cd275126_6026634ed865b-02%25402x.jpeg") },
      { name: "Max House", kind: "house", fromZar: 62500, photos: p("6a8a3072fd4a464888c77fe6_6a2352b5a3ba6f86cd276895_63440151584f6-01%2520(3).jpeg", "6a8a3072fd4a464888c77feb_6a2352e46467c1bc112aeca7_602663b394c69-01%25402x.jpeg", "6a8a3072fd4a464888c77fee_6a2352e4e7cacc184c577b2a_60be164c063bb-01%25402x.jpeg", "6a8a3072fd4a464888c77ff4_6a2352e4960a1938ac60b07f_6344015d2a5a2-02.jpeg", "6a8a3072fd4a464888c77ff1_6a2352e4590a76c29a71f660_6344016094746-03%2520(1).jpeg") },
      { name: "Protea House", kind: "house", fromZar: 70000, photos: p("6a8a3075cde8ad4e63d9cad0_6a23534aedffd313268a6846_6229c3d7be399-04.jpeg", "6a8a3075cde8ad4e63d9caea_6a23536dd56bc697f1e668cd_602a8f29747b7-05%25402x.jpeg", "6a8a3075cde8ad4e63d9cae7_6a23536d38e85d1437ffda0d_602a8f25ebc35-04%25402x.jpeg", "6a8a3075cde8ad4e63d9cad9_6a23536cb3885a7827efc1ad_6229c3ca3ac99-01.jpeg", "6a8a3075cde8ad4e63d9caf5_6a23536cc256735b06ff1344_6229c3d00850b-02.jpeg", "6a8a3075cde8ad4e63d9cb04_6a23536c3bf0967c050a8579_6229c3d40d474-03.jpeg") },
    ],
  },
};
