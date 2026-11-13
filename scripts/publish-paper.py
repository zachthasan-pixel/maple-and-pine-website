#!/usr/bin/env python3
"""publish-paper.py: put a new edition of the Maple & Pine Press daily paper on the site.

    python3 scripts/publish-paper.py /path/to/paper.pdf 2026-11-13 "Lead headline"
    python3 scripts/publish-paper.py /path/to/paper.pdf 2026-11-13 --no-push   # local only

What happens:
  1. The PDF is copied to app/public/paper/editions/<date>.pdf and, when
     pdftoppm (poppler) is installed, page 1 is saved as <date>.jpg for the
     small-screen preview.
  2. app/public/paper/editions.json gets an entry for the date (an existing
     entry for the same date is replaced, so running it twice is safe).
  3. app/public/paper/latest.pdf becomes a copy of the newest edition.
  4. Only the newest KEEP (30) editions are kept; older PDFs, previews and
     entries are deleted.
  5. The change is committed as "Paper: <date>" and pushed to main, and
     Cloudflare redeploys the site. If nothing changed, nothing is committed.

No code changes are needed for a new edition: the /paper page reads
editions.json in the browser.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

KEEP = 30
ROOT = Path(__file__).resolve().parent.parent
PAPER = ROOT / "app" / "public" / "paper"
EDITIONS = PAPER / "editions"
INDEX = PAPER / "editions.json"
TITLE = "Maple & Pine Press"


def git(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=ROOT, check=check, text=True, capture_output=True)


def main() -> int:
    ap = argparse.ArgumentParser(description="Publish a daily paper edition to the site.")
    ap.add_argument("pdf", help="path to the edition PDF")
    ap.add_argument("date", help="edition date, YYYY-MM-DD")
    ap.add_argument("lead", nargs="?", default="", help="lead headline (optional)")
    ap.add_argument("--no-commit", action="store_true", help="update files only")
    ap.add_argument("--no-push", action="store_true", help="commit but do not push")
    ap.add_argument("--branch", default="main", help="branch to publish to (default: main)")
    a = ap.parse_args()

    try:
        dt.date.fromisoformat(a.date)
    except ValueError:
        sys.exit(f"Date must be YYYY-MM-DD, got {a.date!r}")
    src = Path(a.pdf).expanduser().resolve()
    if not src.is_file():
        sys.exit(f"No such file: {src}")
    with open(src, "rb") as f:
        if f.read(5) != b"%PDF-":
            sys.exit(f"Not a PDF: {src}")

    committing = not a.no_commit
    if committing:
        branch = git("rev-parse", "--abbrev-ref", "HEAD").stdout.strip()
        if branch != a.branch:
            sys.exit(f"On branch {branch!r}; switch to {a.branch!r} first (or pass --branch).")
        if not a.no_push:
            # Start from the latest remote state so the push fast-forwards.
            git("pull", "--ff-only", "origin", a.branch)

    EDITIONS.mkdir(parents=True, exist_ok=True)
    pdf_name = f"{a.date}.pdf"
    shutil.copyfile(src, EDITIONS / pdf_name)

    front = None
    if shutil.which("pdftoppm"):
        stem = EDITIONS / a.date
        r = subprocess.run(
            ["pdftoppm", "-jpeg", "-jpegopt", "quality=80", "-f", "1", "-l", "1",
             "-scale-to", "900", "-singlefile", str(src), str(stem)],
            capture_output=True, text=True,
        )
        if r.returncode == 0 and (EDITIONS / f"{a.date}.jpg").exists():
            front = f"/paper/editions/{a.date}.jpg"
    else:
        print("pdftoppm not found: skipping the front-page preview image.")

    editions = json.loads(INDEX.read_text()) if INDEX.exists() else []
    previous = next((e for e in editions if e.get("date") == a.date), None)
    lead = a.lead.strip() or (previous or {}).get("lead", "")
    entry = {"date": a.date, "title": TITLE, "file": f"/paper/editions/{pdf_name}"}
    if lead:
        entry["lead"] = lead
    if front:
        entry["front"] = front
    elif previous and previous.get("front") and (PAPER.parent / previous["front"].lstrip("/")).exists():
        entry["front"] = previous["front"]
    entry["size"] = (EDITIONS / pdf_name).stat().st_size

    editions = [e for e in editions if e.get("date") != a.date] + [entry]
    editions.sort(key=lambda e: e["date"], reverse=True)

    kept, pruned = editions[:KEEP], editions[KEEP:]
    keep_dates = {e["date"] for e in kept}
    for old in pruned:
        print(f"Pruning {old['date']}")
    for p in EDITIONS.iterdir():
        if p.stem not in keep_dates and p.suffix in (".pdf", ".jpg"):
            p.unlink()

    INDEX.write_text(json.dumps(kept, indent=2, ensure_ascii=False) + "\n")
    shutil.copyfile(PAPER.parent / kept[0]["file"].lstrip("/"), PAPER / "latest.pdf")
    print(f"Edition {a.date} ready ({len(kept)} on file, newest {kept[0]['date']}).")

    if not committing:
        return 0
    git("add", "-A", "app/public/paper")
    if git("diff", "--cached", "--quiet", check=False).returncode == 0:
        print("Nothing changed: this edition is already published.")
        return 0
    git("commit", "-m", f"Paper: {a.date}")
    print(f"Committed 'Paper: {a.date}'.")
    if a.no_push:
        return 0
    r = git("push", "origin", f"HEAD:{a.branch}", check=False)
    if r.returncode != 0:
        git("pull", "--rebase", "origin", a.branch)
        git("push", "origin", f"HEAD:{a.branch}")
    print("Pushed. Cloudflare will redeploy the site in a few minutes.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
