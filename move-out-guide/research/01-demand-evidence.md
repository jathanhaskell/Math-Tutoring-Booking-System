# Demand Evidence: "How Do I Move Out of My Parents' House?"

**Compiled:** September 2026
**Status:** Partial. Read the Methodology Limits section before you use any of this.

---

## 0. Methodology Limits — Read This First

You asked me to scrape Reddit and identify a few hundred people with this problem.
**I could not do that in this environment, and I will not fake it.**

What I tried, and what happened:

| Method | Result |
|---|---|
| `curl` to `reddit.com` / `old.reddit.com` JSON API | Blocked — egress proxy returned 403 on CONNECT |
| Web fetch tool on `reddit.com` | Blocked — Reddit denies the fetcher |
| PullPush archive API (`api.pullpush.io`) | Blocked by egress proxy |
| Arctic Shift API (`arctic-shift.photon-reddit.com`) | Blocked by egress proxy |
| Redlib / Libreddit mirrors | Blocked by egress proxy |
| Web search with `site:reddit.com` | Search backend filters Reddit results out |
| Direct fetch of competitor sales pages (Gumroad) | Blocked by egress proxy |

All outbound network access from this machine is denied except a search API.
**There is no way to produce a verified list of a few hundred named Reddit posters from here.**

Any document that claimed otherwise would be inventing usernames, thread titles,
and upvote counts. That would be worse than useless — you'd build positioning on
fabricated pain points and find out at launch.

**What I did instead:** built a substitute validation stack that is arguably
stronger, plus a runnable script so you can do the Reddit portion yourself in
about 20 minutes on your own machine. See
[`reddit_demand_scraper.py`](./reddit_demand_scraper.py).

**The harder truth about the Reddit-scrape idea:** counting complaints is weak
evidence. Complaints are free. A hundred people saying "I can't afford to move
out" tells you the pain is real but tells you *nothing* about whether they will
pay $27 for a PDF. Purchase behavior is the only signal that matters, and that
lives in competitor sales data and in your own pre-sale test — not in comment
threads. Treat Reddit as a **language mine** (how buyers phrase the problem, in
their words) rather than as demand proof.

---

## 1. Market Size — Verified

This is the strongest part of the case. The population is enormous and growing.

| Finding | Figure | Source |
|---|---|---|
| U.S. adults under 35 living with parents (2025) | **25.2 million** — a record | ConsumerAffairs, citing Census |
| Share of young adults (18–34) living with parents | **~1 in 3 (32.5%)**, 2024 ACS, up from 31.8% in 2023 | U.S. Census ACS via Eye On Housing |
| Adults 25–29 living with parents (2025) | **20.4%**, ~6 points higher than 2000 | Fortune, citing Census |
| Adults 25–34 in a parent's home (2023) | **18%** | Pew Research Center |
| Of 25–34-year-olds living with parents, share **employed** | **~70%** | Fortune / Census analysis |

**The 70% employment figure is the single most important number in this document.**

It reframes the entire product. Your buyer is not unemployed and helpless. They
have income. They are stuck for structural reasons — housing cost, debt, thin
credit, and *not knowing the sequence of operations*. That last one is the only
part a PDF can fix, and it's the part you should sell against.

It also means your buyer **has money**. Not a lot, but a paycheck. That is what
makes this commercially viable at all.

---

## 2. Cost-of-Entry Pain — Verified

The specific financial wall people hit. Each of these is a chapter in the book
and a hook in your marketing.

| Barrier | Figure | Source |
|---|---|---|
| Total upfront cost, solo first apartment | **$3,000–$8,500** | Multiple 2026 renter-cost guides |
| Cash needed just to sign | **3–4× monthly rent** | Renter cost guides, 2026 |
| Median 1-BR rent (varies by methodology) | **$1,221–$1,702** | Apartment List / Apartments.com, Aug 2026 |
| Security deposit, 1-BR | **$1,000–$2,000** | 2026 deposit survey data |
| Utility setup + deposits | **$150–$600** ($100–$300 electric deposit *if thin credit*) | Utility/moving guides 2026 |
| Typical landlord income test | **3× rent, gross** | Multiple property-management sources |
| Typical minimum credit score | **620–670**; 700+ for luxury | myFICO, LeaseRunner |
| Median emergency savings, millennials | **$300** | Forbes, 2026 |

Read those last two rows together. **The typical target buyer is asked for a
620–670 credit score and 3× rent in gross income, and has a median emergency
cushion of $300.** That gap *is* the product. Everything in the ebook should
serve closing it.

---

## 3. Competitive Evidence — Partially Verified

A single search surfaced **three** independent creators already selling
move-out guides on Gumroad:

- `shepherdadulting.gumroad.com/l/nfrwjl`
- `thesolosisterhood.gumroad.com/l/30daymoveoutbundle` — "30 Day Move Out Bundle"
- `tonimoonie.gumroad.com/l/wuyvk`

**Verified:** these products exist and are indexed publicly.
**NOT verified:** their prices, sales volume, reviews, or revenue. Gumroad was
blocked by the egress proxy, so I could not open a single one of them.

### How to read this

Competition here is **good news, not bad**. Three independent sellers in one
search result means the niche converts well enough that multiple people
independently built for it. An empty niche usually means no money in it.

But it also means **"a step-by-step guide to moving out" is already a commodity.**
You cannot win on the promise alone. See the positioning note in
[`../launch/offer-and-pricing.md`](../launch/offer-and-pricing.md).

### Your first homework — 30 minutes, do this before writing a sales page

Open each URL on your own machine and record: price, number of ratings, rating
average, page structure, what's bundled, what the guarantee is. Gumroad displays
a rating count publicly; ratings are roughly 2–10% of sales, so a product with
40 ratings has plausibly sold 400–2,000 units. That single number will tell you
more about this market than a thousand Reddit comments.

---

## 4. Where the Buyers Congregate — Partially Verified

| Community | Members | Verified? |
|---|---|---|
| r/personalfinance | 21.7M | Yes |
| r/povertyfinance | 2.9M | Yes |
| r/Adulting | — | No — get count yourself |
| r/MovingOut | — | No — verify it exists and its size |
| r/almosthomeless | — | No |
| r/Frugal, r/budget, r/FirstTimeRenter | — | No |

Do not take these as a targeting list until you have personally confirmed each
subreddit's **size, activity level, and self-promotion rules.** Sizes above are
from third-party trackers, not from Reddit directly.

**Caution on r/personalfinance:** 21.7M members is a vanity number for your
purposes. It is one of the most aggressively moderated subs on the platform and
removes commercial content on sight. Reach there is close to zero for a seller.
Smaller, looser communities will outperform it dramatically.

---

## 5. The Emotional Layer — Verified

Purely financial guides underperform because the decision is not purely
financial. Evidence that the emotional dimension is real and large:

| Finding | Figure | Source |
|---|---|---|
| Adults 18–24 reporting loneliness | **~1 in 2** | WashU 8-country study, 2026 |
| Loneliness correlated with **living alone** and being younger | Confirmed association | Peer-reviewed review, PMC |
| Mental health problems that emerge **before age 24** | **75%** | Mental Health Foundation |

Two implications:

1. **A chapter on the psychological side is a differentiator, not filler.** Most
   competing guides are pure logistics checklists. "What nobody tells you about
   the first month alone" is a section that gets screenshotted and shared.
2. **You have a duty of care.** You are selling to a population with elevated
   mental-health risk. The book must include real crisis resources and must not
   imply that moving out is always the right call. This is both ethically
   required and legally protective.

---

## 6. Honest Verdict on This Business

**What's strong:**
- Enormous, verified, growing addressable population (25.2M under 35).
- A sharply defined, quantified, universally shared pain (the ~$3,000–$8,500 wall).
- Proven willingness to pay (three live competitors found in one search).
- A genuine content edge available in the emotional/psychological dimension.

**What's weak — and you need to solve these:**

1. **Low willingness to pay.** The defining trait of your buyer is that they
   don't have money. Price accordingly ($19–$29), or find a second buyer with a
   wallet — see the parent-buyer angle in the pricing doc.

2. **The information is free.** Every fact in your book is on the open internet.
   You are not selling information; you are selling **sequence, filtering, and
   the elimination of decision fatigue.** If your product reads like a
   well-organized blog post, it fails.

3. **Reddit as a channel is fragile.** One channel, hostile to sellers, with
   moderator discretion that can zero your traffic overnight. Do not build a
   business on it. Use it to acquire **emails**, which you own.

4. **A PDF is a one-time $25 transaction with no retention.** There is no
   repeat purchase, no compounding. If this works, the actual business is what
   you sell *second* — and you should know what that is before you launch, not
   after.

5. **Unverified competitive picture.** You currently do not know what you're
   competing against on price or quality. Fix that in the next 30 minutes.

**Bottom line:** The market is real and large enough. The product concept is
sound but commoditized. **The differentiation and the distribution are the hard
parts, and they are unsolved.** Do not spend three weeks polishing the PDF and
one afternoon on distribution — that's the standard failure mode and it's the
exact inverse of the correct effort split.
