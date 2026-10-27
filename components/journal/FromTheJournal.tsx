import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { JournalPost } from "@/lib/content/journal/posts";

// On a stay page: James's story about the place, when he has written one.
// The post links back here too, so the two pages vouch for each other.
export default function FromTheJournal({ posts }: { posts: JournalPost[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="journal-h" className="mt-16 md:mt-24 border-t ledger-rule pt-8">
      <p className="ledger-eyebrow ledger-crimson">From the Journal</p>
      <h2 id="journal-h" className="ledger-display text-2xl md:text-3xl mt-2">James&rsquo;s Story From Here</h2>
      <div className="mt-6 grid gap-5">
        {posts.map((p) => (
          <Link key={p.slug} href={`/journal/${p.slug}`} className="group grid md:grid-cols-[1.1fr_1fr] border ledger-border hover:border-crimson/60 transition-colors">
            <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[300px] overflow-hidden"><Image src={p.hero.url} alt={p.hero.alt} fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover group-hover:scale-[1.02] transition-transform duration-700" /></div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <p className="ledger-eyebrow">{p.shelf}{p.trip ? ` · ${p.trip}` : ""}{p.film ? " · With film" : ""}</p>
              <h3 className="ledger-display text-[1.6rem] md:text-[1.9rem] leading-tight mt-2">{p.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed ledger-muted">{p.dek}</p>
              <span className="mt-5 inline-flex items-center gap-2 ledger-crimson">Read the story <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
