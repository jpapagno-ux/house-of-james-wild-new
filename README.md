# House of James Wild & Co

The new **jameswildco.com**, home of Wild Earth Stays. Next.js (App Router) on Vercel, built from the approved Base44 home page and the James Wild & Co Ledger.

## Build steps

| Step | What | Status |
| --- | --- | --- |
| 1 | Decisions: domain, repo, Vercel team, booking, contact | Done |
| 2 | Skeleton: Ledger tokens, header and footer, schema builders, robots, sitemap, `llms.txt`, noindex previews | **This commit** |
| 3 | Home page ported from Base44 (film hero, quote card, volume doors, Overland, film, FAQ) | Next |
| 4 | House pages: The Ledger, About, Plan, Advisors, Partners, FAQ, legal | |
| 5 | Ledger export from Base44 (the Ledger gate) + Supabase images | |
| 6 | Volume landings and the ten destinations | |
| 7 | Record templates, then 500+ stays, voyages, residences and routes | |
| 8 | Journal migration and the full 301 map from wildearthstays.com | |
| 9 | Launch: domain, indexing on, sitemaps to Search Console | |

## House rules for this codebase

- **Nothing is indexed before launch.** Previews and local builds send `noindex` three ways: meta robots, `X-Robots-Tag`, and a `robots.txt` that disallows everything. Indexing opens only when `VERCEL_ENV=production` and `NEXT_PUBLIC_INDEXING=on`.
- **Founder marks come only from the Ledger.** "Founder stayed · year" prints only from a record's `house_status` and date, set by a person in Base44. The site never infers it.
- **Private fields never ship.** Commission, net rates, contracts, rate-sheet contacts, source files and private images stay in Base44. The export (step 5) strips them.
- **One source for the house facts.** Name, phone, address, credentials and every navigation list live in `lib/site.ts`. Header, footer, schema, sitemap and `llms.txt` read from it.
- **Schema states only what the page states.** Builders are in `lib/schema`. Each page emits one JSON-LD graph.
- **Motion is optional.** Only opacity and transform animate, and everything respects `prefers-reduced-motion`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm run build
```

Node 20+. Fonts are self-hosted (`@fontsource`), so builds need no network for fonts.
