#!/usr/bin/env python3
"""Build the report the library-sync workflow sends back to the Studio (siteReport).
usage: site-report.py STATUS [ERROR]  -> prints JSON"""
import json, os, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
status, error = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "")
rows, new = [], []
try:
    qa = json.load(open(ROOT / "data/library/qa.json"))
    routes = (ROOT / "lib/routes.ts").read_text()
    live = set(re.findall(r'"([a-z0-9-]+)"', routes[routes.index("STAY_SLUGS"):routes.index("];", routes.index("STAY_SLUGS"))]))
    rows = [{**r, "live": r["slug"] in live} for r in qa["rows"]]
    rel = json.load(open(ROOT / "scripts/data/stay-release.json"))["released"]
    new = [r["slug"] for r in rel if r["batch"].endswith("library sync") and r["batch"].startswith(qa["checkedOn"])]
except Exception as e:  # report what we can even when an earlier step failed
    error = error or f"report: {e}"
run = f"{os.environ.get('GITHUB_SERVER_URL','')}/{os.environ.get('GITHUB_REPOSITORY','')}/actions/runs/{os.environ.get('GITHUB_RUN_ID','')}"
print(json.dumps({
    "status": status, "error": error or None, "event_id": os.environ.get("EVENT_ID") or None, "reason": os.environ.get("REASON"),
    "run_url": run, "commit_sha": os.environ.get("COMMIT_SHA") or None, "rows": rows, "new": new,
    "summary": f"{sum(r['live'] for r in rows)} stay pages live, {sum(1 for r in rows if not r['live'] and r['missing'])} held" + (f", {len(new)} new: {', '.join(new[:12])}" if new else ""),
}))
