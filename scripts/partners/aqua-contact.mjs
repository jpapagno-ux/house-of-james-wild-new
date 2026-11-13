// A contact sheet per Aqua ship from the Cloudinary copies (scripts/data/aqua/preview/<ship>.jpg), so the
// photographs can be checked by eye before they go live. Temporary: the preview folder is not shipped.
import fs from "node:fs";
const list = JSON.parse(fs.readFileSync("scripts/data/aqua/photos.json", "utf8"));
const by = {};
for (const p of list) (by[p.id.split("/")[3]] ??= []).push(p.id);
fs.mkdirSync("scripts/data/aqua/preview", { recursive: true });
for (const [ship, ids] of Object.entries(by)) {
  const W = 240, H = 160, C = 5, R = Math.ceil(ids.length / C);
  const layers = ids.map((id, i) => `l_${id.replace(/\//g, ":")}/c_fill,w_${W - 4},h_${H - 4}/fl_layer_apply,g_north_west,x_${(i % C) * W + 2},y_${Math.floor(i / C) * H + 2}`).join("/");
  const url = `https://res.cloudinary.com/jhlnq5h5/image/upload/c_scale,w_${C * W},h_${R * H},e_colorize:100,co_white/${layers}/q_70/${ids[0]}.jpg`;
  const r = await fetch(url);
  console.log(ship, r.status, r.headers.get("x-cld-error") ?? "");
  if (r.ok) fs.writeFileSync(`scripts/data/aqua/preview/${ship}.jpg`, Buffer.from(await r.arrayBuffer()));
}
