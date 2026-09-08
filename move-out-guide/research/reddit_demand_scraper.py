#!/usr/bin/env python3
"""
reddit_demand_scraper.py — Find and quantify real people who need a
"how to move out of my parents' house" product.

WHY THIS EXISTS
---------------
The environment this project was built in has all outbound network access
blocked except a search API, so the Reddit research could not be run there.
This script does that job on YOUR machine, where Reddit is reachable.

Target output: a deduplicated roster of several hundred distinct Reddit
accounts who have described this exact problem in their own words, plus the
verbatim language they used (which is your marketing copy, pre-written).

SETUP (about 10 minutes)
------------------------
1) pip install praw pandas

2) Create a Reddit app: https://www.reddit.com/prefs/apps
   -> "create another app..." -> choose "script"
   -> redirect uri: http://localhost:8080
   Copy the client id (under the app name) and the secret.

3) Export credentials (never hardcode them):

     export REDDIT_CLIENT_ID="..."
     export REDDIT_CLIENT_SECRET="..."
     export REDDIT_USER_AGENT="moveout-research by u/YOUR_USERNAME"

4) Run:
     python3 reddit_demand_scraper.py                  # default sweep
     python3 reddit_demand_scraper.py --limit 400      # go wider
     python3 reddit_demand_scraper.py --with-comments  # slower, much richer

OUTPUT
------
  out/posts.csv          every matching post
  out/people.csv         one row per distinct author  <-- your "few hundred people"
  out/quotes.md          verbatim pain quotes, grouped by theme
  out/summary.md         counts, subreddit breakdown, top phrases

ETHICS / TOS
------------
Read-only public data via Reddit's official API. Rate limits respected by PRAW.
Do NOT paste this roster anywhere public, do NOT mass-DM these people (that is
both a TOS violation and the fastest way to get your account banned), and do NOT
quote usernames in marketing. Use it to understand language and volume, then
earn attention publicly. See ../launch/reddit-distribution-playbook.md.
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

try:
    import praw
except ImportError:
    sys.exit("Missing dependency. Run:  pip install praw pandas")


# --------------------------------------------------------------------------
# Search configuration — tune these two lists, they drive everything.
# --------------------------------------------------------------------------

SUBREDDITS = [
    # Broad personal finance — huge, but heavily moderated
    "personalfinance", "povertyfinance", "Frugal", "budget", "MiddleClassFinance",
    # Life-stage communities — usually the highest-signal for this problem
    "Adulting", "internetparents", "NoStupidQuestions", "self", "findapath",
    # Housing / renting
    "Tenant", "renting", "Apartmentliving", "FirstTimeHomeBuyer",
    # Age cohort
    "GenZ", "Millennials", "college", "graduatedandlost",
    # Family-dynamics angle (often the real blocker)
    "raisedbynarcissists", "EstrangedAdultKids", "JUSTNOFAMILY",
]

# Phrased the way real people phrase it, not the way marketers do.
QUERIES = [
    "move out of my parents",
    "moving out of my parents house",
    "can't afford to move out",
    "how do I move out",
    "ready to move out",
    "first apartment advice",
    "want to move out but",
    "stuck living with my parents",
    "moving out for the first time",
    "how much money to move out",
    "afford my own place",
    "move out at 25",
]

# A post must match one of these to count as genuine pain (filters out
# landlords, parents complaining, and generic apartment chatter).
PAIN_PATTERNS = [
    r"\bi (?:want|need|have) to move out\b",
    r"\bcan'?t afford\b",
    r"\bhow (?:do|can) i\b",
    r"\bi'?m (?:stuck|trapped|scared|terrified|lost|overwhelmed)\b",
    r"\bstill liv(?:e|ing) (?:with|at) my (?:parents|mom|dad)\b",
    r"\bno idea (?:where|how) to (?:start|begin)\b",
    r"\bdon'?t know (?:where|how) to (?:start|begin)\b",
    r"\bfirst apartment\b",
    r"\bmove out\b.{0,40}\b(?:savings|budget|afford|credit|deposit)\b",
    r"\b(?:savings|budget|afford|credit|deposit)\b.{0,40}\bmove out\b",
]
PAIN_RE = re.compile("|".join(PAIN_PATTERNS), re.IGNORECASE)

# Exclude posts that are clearly not our buyer.
EXCLUDE_RE = re.compile(
    r"\b(?:my tenant|as a landlord|my child moved|my son moved|my daughter moved|"
    r"i'?m a landlord|property manager)\b",
    re.IGNORECASE,
)

# Thematic buckets for the quotes file — these become your chapter hooks.
THEMES = {
    "Money / can't afford it":  r"afford|money|saving|broke|paycheck|income|expensive|cost",
    "Credit / approval":        r"credit|score|cosign|guarantor|application|approved|denied",
    "Don't know where to start": r"where to start|how to start|no idea|clueless|overwhelm|lost",
    "Family pressure / escape":  r"toxic|controlling|narciss|escape|abusive|mental health|suffocat",
    "Fear of failure":           r"scared|afraid|terrified|fail|move back|what if|anxiety",
    "Logistics / practical":     r"lease|apartment|utilities|furniture|deposit|landlord|roommate",
}

OUT = Path(__file__).parent / "out"


# --------------------------------------------------------------------------

def client() -> "praw.Reddit":
    missing = [k for k in ("REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USER_AGENT")
               if not os.environ.get(k)]
    if missing:
        sys.exit(f"Missing env vars: {', '.join(missing)}\nSee the docstring at the top of this file.")
    r = praw.Reddit(
        client_id=os.environ["REDDIT_CLIENT_ID"],
        client_secret=os.environ["REDDIT_CLIENT_SECRET"],
        user_agent=os.environ["REDDIT_USER_AGENT"],
        check_for_async=False,
    )
    r.read_only = True
    return r


def is_pain(text: str) -> bool:
    if not text or EXCLUDE_RE.search(text):
        return False
    return bool(PAIN_RE.search(text))


def clean(s: str, n: int = 600) -> str:
    s = re.sub(r"\s+", " ", (s or "")).strip()
    return s[:n]


def sweep(reddit, limit: int, with_comments: bool) -> tuple[list[dict], list[dict]]:
    """Return (posts, comments) that pass the pain filter."""
    posts: dict[str, dict] = {}
    comments: list[dict] = []
    seen_ids: set[str] = set()

    total = len(SUBREDDITS) * len(QUERIES)
    step = 0

    for sub_name in SUBREDDITS:
        sub = reddit.subreddit(sub_name)
        for q in QUERIES:
            step += 1
            print(f"[{step:>3}/{total}] r/{sub_name:<22} {q!r}", flush=True)
            try:
                results = sub.search(q, sort="relevance", time_filter="all",
                                     limit=limit, syntax="lucene")
                for p in results:
                    if p.id in seen_ids:
                        continue
                    seen_ids.add(p.id)

                    body = f"{p.title}\n{getattr(p, 'selftext', '')}"
                    if not is_pain(body):
                        continue

                    author = str(p.author) if p.author else "[deleted]"
                    if author in ("[deleted]", "AutoModerator", "None"):
                        continue

                    posts[p.id] = {
                        "id": p.id,
                        "author": author,
                        "subreddit": sub_name,
                        "title": clean(p.title, 300),
                        "selftext": clean(getattr(p, "selftext", ""), 1500),
                        "score": p.score,
                        "num_comments": p.num_comments,
                        "created": datetime.fromtimestamp(
                            p.created_utc, tz=timezone.utc).strftime("%Y-%m-%d"),
                        "url": f"https://reddit.com{p.permalink}",
                        "matched_query": q,
                    }

                    if with_comments:
                        try:
                            p.comments.replace_more(limit=0)
                            for c in p.comments.list()[:40]:
                                ca = str(c.author) if c.author else "[deleted]"
                                if ca in ("[deleted]", "AutoModerator", "None"):
                                    continue
                                if is_pain(c.body):
                                    comments.append({
                                        "author": ca,
                                        "subreddit": sub_name,
                                        "body": clean(c.body, 800),
                                        "score": c.score,
                                        "url": f"https://reddit.com{c.permalink}",
                                    })
                        except Exception as e:                      # noqa: BLE001
                            print(f"      ! comments failed on {p.id}: {e}")
                        time.sleep(0.4)

            except Exception as e:                                   # noqa: BLE001
                print(f"      ! search failed: {e}")
            time.sleep(1.0)   # be polite well inside the rate limit

    return list(posts.values()), comments


def write_outputs(posts: list[dict], comments: list[dict]) -> None:
    OUT.mkdir(exist_ok=True)

    # --- posts.csv -------------------------------------------------------
    if posts:
        with (OUT / "posts.csv").open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(posts[0].keys()))
            w.writeheader()
            w.writerows(posts)

    # --- people.csv : one row per distinct human -------------------------
    people: dict[str, dict] = defaultdict(
        lambda: {"posts": 0, "comments": 0, "subreddits": set(),
                 "total_score": 0, "example_url": "", "example_text": ""})
    for p in posts:
        rec = people[p["author"]]
        rec["posts"] += 1
        rec["subreddits"].add(p["subreddit"])
        rec["total_score"] += p["score"]
        if not rec["example_url"]:
            rec["example_url"] = p["url"]
            rec["example_text"] = p["title"]
    for c in comments:
        rec = people[c["author"]]
        rec["comments"] += 1
        rec["subreddits"].add(c["subreddit"])
        if not rec["example_url"]:
            rec["example_url"] = c["url"]
            rec["example_text"] = c["body"][:200]

    with (OUT / "people.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["author", "posts", "comments", "subreddits",
                    "total_score", "example_url", "example_text"])
        for a, r in sorted(people.items(), key=lambda kv: -(kv[1]["posts"] + kv[1]["comments"])):
            w.writerow([a, r["posts"], r["comments"], "|".join(sorted(r["subreddits"])),
                        r["total_score"], r["example_url"], r["example_text"]])

    # --- quotes.md : verbatim language, bucketed -------------------------
    buckets: dict[str, list[str]] = defaultdict(list)
    for item in posts:
        blob = f"{item['title']} {item['selftext']}"
        for theme, pat in THEMES.items():
            if re.search(pat, blob, re.IGNORECASE):
                buckets[theme].append(f"> {clean(item['title'], 250)}\n>\n> — r/{item['subreddit']}, {item['created']} · [link]({item['url']})")
                break
    for c in comments:
        for theme, pat in THEMES.items():
            if re.search(pat, c["body"], re.IGNORECASE):
                buckets[theme].append(f"> {clean(c['body'], 300)}\n>\n> — r/{c['subreddit']} (comment) · [link]({c['url']})")
                break

    with (OUT / "quotes.md").open("w", encoding="utf-8") as f:
        f.write("# Verbatim Pain Language\n\n")
        f.write("Use these phrasings in headlines, bullets, and subject lines. ")
        f.write("Your buyer's words outsell your words every time.\n\n")
        f.write("**Do not publish usernames or quote these attributed in marketing.**\n\n")
        for theme in THEMES:
            items = buckets.get(theme, [])
            f.write(f"\n## {theme}  ({len(items)})\n\n")
            for q in items[:40]:
                f.write(q + "\n\n")

    # --- summary.md ------------------------------------------------------
    by_sub = Counter(p["subreddit"] for p in posts)
    words = Counter()
    stop = set("""a an the and or but if to of in on for with my me i it is was be been am are
                  that this you your they them he she we us our as at by from have has had do does
                  did so not no just get got can cant dont im ive would could should about out up
                  what how when where who why all any some more most other into than then there
                  their his her its will very really much many like know time now new""".split())
    for p in posts:
        for w_ in re.findall(r"[a-z']{3,}", f"{p['title']} {p['selftext']}".lower()):
            if w_ not in stop:
                words[w_] += 1

    with (OUT / "summary.md").open("w", encoding="utf-8") as f:
        f.write("# Reddit Demand Sweep — Summary\n\n")
        f.write(f"Run: {datetime.now(timezone.utc):%Y-%m-%d %H:%M UTC}\n\n")
        f.write("| Metric | Value |\n|---|---|\n")
        f.write(f"| Matching posts | {len(posts)} |\n")
        f.write(f"| Matching comments | {len(comments)} |\n")
        f.write(f"| **Distinct people** | **{len(people)}** |\n")
        f.write(f"| Subreddits with hits | {len(by_sub)} |\n")
        f.write(f"| Total upvotes across posts | {sum(p['score'] for p in posts)} |\n")
        f.write(f"| Total comments on those posts | {sum(p['num_comments'] for p in posts)} |\n\n")

        f.write("## Where the pain lives\n\n| Subreddit | Matching posts |\n|---|---|\n")
        for s, n in by_sub.most_common():
            f.write(f"| r/{s} | {n} |\n")

        f.write("\n## Most common words in their own language\n\n")
        f.write("| Word | Count |\n|---|---|\n")
        for w_, n in words.most_common(40):
            f.write(f"| {w_} | {n} |\n")

        f.write("\n## Read this before you celebrate the number\n\n")
        f.write("A large distinct-people count proves the **pain** is widespread. "
                "It does not prove anyone will **pay**. The only real validation is a "
                "pre-sale: put up a checkout page and try to collect actual money from "
                "20 people before you finish the product.\n")

    print(f"\nDone. {len(posts)} posts, {len(comments)} comments, "
          f"{len(people)} distinct people -> {OUT}/")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--limit", type=int, default=100,
                    help="max results per (subreddit, query) pair (default 100)")
    ap.add_argument("--with-comments", action="store_true",
                    help="also mine comment threads (much slower, much richer)")
    args = ap.parse_args()

    posts, comments = sweep(client(), args.limit, args.with_comments)
    write_outputs(posts, comments)


if __name__ == "__main__":
    main()
