#!/usr/bin/env python3
"""Ledger export: impact notes (Where Your Stay Gives Back). Turns published
ImpactNote records into lib/content/pathways/impact-library.json, keyed by the
record's site slug (`ref`). Public fields only; source_url never leaves the
library. Statements that fail the house rules are dropped, not softened.

usage: export-impact.py IMPACT.json OUT.json
"""
import json, re, sys, html

KINDS = {"conservation", "habitat", "marine", "employment", "sourcing", "culture", "community", "levy", "beneficiary"}
MONEY = {"guest_levy", "voluntary_donation", "property_spend", "none"}
STATUS = {"verified", "partner_reported", "pending_review", "unavailable"}
FIGURE = re.compile(r"\b\d+(\.\d+)?\s?%|\$\s?\d|USD|per cent|percent of (room|revenue)", re.I)

def text(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()

src, out_path = sys.argv[1], sys.argv[2]
rows = json.load(open(src)).get("entities") or []
out, dropped = {}, []
for r in rows:
    if r.get("workflow_status") not in ("published", "cms_ready"): continue
    ref = r.get("ref")
    kind, money, status = r.get("kind"), r.get("money") or "none", r.get("status")
    stmt = text(r.get("statement"))
    reason = None
    if not ref: reason = "no ref"
    elif kind not in KINDS: reason = f"unknown kind {kind}"
    elif money not in MONEY: reason = f"unknown money {money}"
    elif status not in STATUS: reason = f"unknown status {status}"
    elif status in ("verified", "partner_reported") and not text(r.get("source")): reason = "no source"
    elif FIGURE.search(stmt) and status != "verified": reason = "figure not verified"
    elif not re.match(r"^\d{4}-\d{2}-\d{2}", str(r.get("reviewed_date") or "")): reason = "no review date"
    if reason:
        dropped.append((r.get("ledger_id") or r.get("id"), reason)); continue
    out.setdefault(ref, []).append({"ledgerId": r.get("ledger_id"), "kind": kind, "money": money, "statement": stmt,
        "source": text(r.get("source")) or None, "reviewed": str(r["reviewed_date"])[:10], "status": status})
json.dump({"exportedAt": json.load(open(src)).get("exportedAt"), "byRef": out}, open(out_path, "w"), ensure_ascii=False, indent=1)
print(sum(len(v) for v in out.values()), "impact notes on", len(out), "records;", len(dropped), "dropped", dropped[:5])
