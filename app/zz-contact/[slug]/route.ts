// TEMPORARY, never merged: a bare contact sheet of a stay's undescribed photographs, for writing photo-notes.
import stays from "@/lib/content/stays.json";
import notes from "@/lib/journal-style/photo-notes.json";
export const dynamic = "force-dynamic";
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = Number(new URL(req.url).searchParams.get("p") ?? "1");
  const all = ((stays as any).stays ?? stays) as any[];
  const s = all.find((x) => x.slug === slug);
  if (!s) return new Response("none", { status: 404 });
  const desc = ((notes as any)[slug]?.describe ?? {}) as Record<string, unknown>;
  const list = [s.hero, ...(s.gallery ?? [])].filter(Boolean).map((u: string, i: number) => ({ u, i })).filter((x) => !desc[x.u.split("/").pop() as string]);
  const shown = list.slice((page - 1) * 16, page * 16);
  const thumb = (u: string) => u.includes("res.cloudinary.com") ? u.replace("/upload/f_auto,q_auto/", "/upload/f_auto,q_auto,w_520,h_380,c_fill/") : u;
  const html = `<!doctype html><meta name="robots" content="noindex"><body style="margin:0;background:#111;font:14px monospace;color:#fff"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">${shown.map((x) => `<div style="position:relative;height:238px"><img src="${thumb(x.u)}" alt="" style="width:100%;height:100%;object-fit:cover"><b style="position:absolute;left:0;top:0;background:#000;padding:2px 6px;font-size:18px">${x.i}</b></div>`).join("")}</div><p>${slug} ${shown.length}/${list.length}</p></body>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
