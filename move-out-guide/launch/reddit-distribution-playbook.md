# Reddit Distribution Playbook

**Read this before you post anything.** The naive plan — write the PDF, drop
links in ten subreddits — has a near-100% failure rate. It gets you removed,
shadowbanned, and possibly site-banned in the first week, and it burns the
subreddits permanently because moderators remember domains.

---

## The strategic reframe

**Reddit is not a sales channel. Reddit is a lead-generation channel.**

You are not there to sell a $27 PDF. You are there to become a person whose
answers people find useful, and to capture emails from the ones who want more.
You sell to the email list. The list is an asset you own; a Reddit account is
an asset a volunteer moderator can delete on a Tuesday.

The whole funnel:

> **Genuinely useful comment → profile visit → free tool → email → the product**

Every step where you try to skip ahead is a step where you get removed.

**Do not build this business on Reddit alone.** One hostile channel with
moderator discretion is not a business. Section 9 covers what else to run in
parallel.

---

## The rules you are working inside

| Rule | Reality | Source |
|---|---|---|
| The 9:1 rule | 9 genuinely non-promotional contributions per 1 promotional | [S-59] |
| Promo ceiling | Keep promotional content under ~10% of total activity | [S-60] |
| Account age | Many subs gate at 7–90 days | [S-62] |
| Karma gate | Many subs gate at 10–100+; aim 500+ for credibility | [S-62] |
| Spam detection | Low karma + new account = automatic flagging | [S-61] |

And the rule nobody writes down, which matters more than all of them:
**moderators check your profile.** If your entire history is thin comments
ending in the same link, you are removed regardless of ratios.

---

## Phase 0 — Account prep (Days 1–30)

**Do not skip this. Do not use a brand-new account.**

- [ ] Use a real account with history if you have one. Otherwise create one and
      let it age **30 days minimum** before any promotional activity.
- [ ] Reach **500+ comment karma** through genuine participation, in the
      communities you actually intend to use.
- [ ] Fill in the profile: a real-sounding username, an avatar, a one-line bio
      that says who you are honestly.
- [ ] Participate in unrelated subreddits too. A profile that only ever
      discusses moving out reads as a marketing account, because it is one.

**The mindset that makes this work:** you cannot fake this at scale, so don't
try. Be a person who is actually helpful about this topic. The commercial
outcome is downstream of that, and it does not arrive in week one.

---

## Phase 1 — Listen (Days 1–14, in parallel)

Run [`../research/reddit_demand_scraper.py`](../research/reddit_demand_scraper.py)
on your own machine.

You are mining three things:

1. **Language.** Exactly how people phrase the problem. Their words go in your
   headlines, not yours. "I want to move out but I don't know if I can afford
   it" outperforms "Achieve Financial Independence" every time.
2. **Frequency.** Which questions repeat weekly. Repeat questions are your
   content calendar, pre-written by the market.
3. **Gaps.** Where the top answer is bad, absent, or generic. That gap is your
   opening.

Read `out/quotes.md` before you write a single line of sales copy.

**Do not DM anyone on this list.** Unsolicited DMs are a TOS violation, are
reported as harassment, and will get you banned faster than anything else in
this document. The roster is for understanding, not outreach.

---

## Phase 2 — Answer, without linking (Days 15–45)

**This is the phase people skip, and skipping it is why they fail.**

Find questions about moving out. Answer them completely, for free, with no link
and no mention of any product.

**What a good answer looks like:**

- Specific numbers, not platitudes. "You'll need 3–4× monthly rent to sign, plus
  $150–$600 for utility setup, plus one month of expenses in reserve" beats
  "make sure you save enough."
- The thing they didn't ask but need. They asked about rent; tell them about
  the utility deposit that hits harder if their credit is thin.
- Formatted to be read. Short paragraphs. A list when it's a list.
- Honest, including when the honest answer is "wait six months."

**Target: 5–10 substantive comments per week.** Quality over volume — one
genuinely excellent answer that gets awarded and quoted does more than thirty
one-liners.

**What this buys you:** karma, moderator goodwill, and a profile that makes the
next phase credible. It also stress-tests your material — if your answer doesn't
land in a comment thread, that chapter doesn't work either.

---

## Phase 3 — Give the best thing away (Days 45+)

Now post something substantial. **Free, complete, no link, no catch.**

The highest-performing format in this niche is the full breakdown post:

> **"I broke down the actual cost of moving out. It's ~$7,200, not the $3,000
> everyone says."**
>
> Full cost table in the post body. All four buckets. Real ranges with sources.
> No link anywhere.

Why this works: it is *complete*. Nothing is withheld. Reddit punishes teasers
and rewards generosity, and a post that delivers everything gets upvoted,
saved, and cross-posted — which is distribution you cannot buy.

**Other post formats that work:**

- "I applied to 8 apartments with no credit history. Here's what actually got me
  approved."
- "The lease clauses I almost signed, and what they'd have cost me."
- "Everything I wish I'd known before my first apartment — the full checklist."

**Rules for these posts:**
- Follow each subreddit's post rules exactly. Read them. They differ.
- Never link the product in the post body.
- Answer every comment. The comment thread is where trust is built.
- Post to one subreddit at a time. Simultaneous cross-posting is a spam signal.

---

## Phase 4 — The mention (only after Phase 3 works)

Once you have a track record, mention the product **only where it's genuinely
responsive** and where the sub's rules permit it:

- When someone asks directly: "does anyone have a checklist for this?"
- In your profile bio and pinned post — this is the safest place by far, and
  it's where interested people go anyway.
- In subreddits with an explicit promo thread or promo day. Many have them.
  **Use them.**
- When a moderator's rules explicitly allow disclosed self-promotion.

**Always disclose.** "I made a free calculator for this" or "I wrote a guide on
this — happy to just answer here instead." Undisclosed promotion is the fastest
route to a permanent ban, and disclosure costs you nothing with an audience that
already trusts you.

**The strongest single move: lead with free.** Give the calculator, not the
paid product. The calculator collects the email. The email sells the product,
on your terms, off Reddit.

---

## The free lead magnet

Build one thing, give it away, and use it to capture emails.

**Recommended: "The Move-Out Number Calculator."**

A one-page fillable PDF or a simple spreadsheet — Worksheet 2 from the book,
standing alone. Someone enters their target rent and it computes their real
number across all four buckets.

Why this one:
- It solves a complete problem by itself, so it's genuinely worth an email.
- Its output is a number that is almost always **larger than they expected**,
  which creates precisely the "I need help with this" feeling the paid product
  answers.
- It is trivially shareable and screenshot-friendly.

Host it on a plain landing page — email in, file out. Then a short welcome
sequence:

| Email | Timing | Content |
|---|---|---|
| 1 | Immediately | Deliver the calculator. Nothing else. No pitch. |
| 2 | Day 2 | The single biggest mistake — moving out without the cushion. Pure value. |
| 3 | Day 4 | How to get approved with no credit history. Pure value. |
| 4 | Day 6 | The full guide exists, here's what's in it. First mention. |
| 5 | Day 9 | Last call, then stop. |

Three emails of real value before you ask for money. If emails 1–3 aren't good
enough to stand alone, the product isn't either.

---

## Subreddit targeting

**Verify every row yourself before posting.** Sizes are from third-party
trackers; rules change; some of these subs may not exist under these names.
Read each sub's rules page in full.

| Subreddit | Members | Promo tolerance | Play |
|---|---|---|---|
| r/personalfinance | ~21.7M [S-63] | **Near zero** | Comments only. Never post promo. Reach is not worth the ban. |
| r/povertyfinance | ~2.9M [S-63] | Very low | Comments only. Extremely values-driven community — be genuinely useful or stay out. |
| r/Adulting | verify | Moderate | **Best fit.** Exactly your audience, looser rules. |
| r/internetparents | verify | Moderate | People explicitly asking for guidance. High-intent. |
| r/NoStupidQuestions | verify | Low | Great for answering. High visibility. |
| r/findapath | verify | Moderate | Life-transition audience. |
| r/Frugal, r/budget | verify | Low–moderate | Value comments. |
| r/GenZ, r/Millennials | verify | Moderate | Cohort match; less problem-focused. |
| r/renting, r/Tenant | verify | Low | Strong for lease/deposit answers specifically. |
| r/college, r/graduatedandlost | verify | Moderate | New-grad timing is perfect. |
| Local city subs | varies | Varies | Underrated — local rent questions, less competition. |

**Sequence: start in the smaller, looser subs.** Build the track record where
the cost of a mistake is low. Do not open in r/personalfinance.

---

## What gets you banned

Learn these now rather than empirically:

1. Posting the same link in multiple subreddits in a short window.
2. A brand-new account posting promotional content.
3. Comments that exist only to carry a link.
4. Undisclosed self-promotion.
5. Unsolicited DMs.
6. Vote manipulation — including asking friends to upvote. Reddit detects this.
7. Multiple accounts. Detected via fingerprinting; results in a site-wide ban.
8. Arguing with moderators. You will not win, and you will make it permanent.
9. Ignoring a sub's stated rules because they seemed like formalities.

**If you're removed:** message the moderators once, politely, ask what the
issue was, and comply. Once. Do not escalate.

---

## Targets and honest expectations

| Metric | Realistic target |
|---|---|
| Comment karma before any promo | 500+ |
| Substantive comments per week | 5–10 |
| Value posts per month | 2–4 |
| Email signups per successful value post | 20–100 |
| Email → sale conversion | 1–3% |
| Reddit traffic → email conversion | 10–25% |

**Do the arithmetic before you get excited.** Four good posts a month at 50
signups each is 200 emails. At 2% conversion on a $27 product, that's about
**$108/month.** That is the realistic first-90-days outcome, and if you expect
$5,000 you will quit in week six when reality arrives.

This compounds — the list grows, the content library grows, SEO accumulates —
but it compounds from a small base, slowly. Plan for that.

---

## Do not run only Reddit

Reddit is one hostile channel governed by volunteer moderators. Run at least two
of these in parallel from day one:

- **TikTok / YouTube Shorts / Instagram Reels.** "The real cost of moving out"
  as a 45-second video with the cost table on screen is native to the format and
  the algorithm distributes to strangers — which Reddit does not.
- **Pinterest.** Genuinely underrated for checklists and worksheets, and the
  demographic match is strong. Pins have a long tail Reddit posts never get.
- **SEO.** You already have 87 pages of well-sourced material. Publish chapters
  as articles targeting "how much does it cost to move out," "apartment with no
  credit history," etc. Slow, compounding, and you own it.
- **The email list itself.** Once it exists, it is the only channel nobody can
  take from you. Treat every other channel as a feeder into it.

---

## The 30-day starting calendar

**Week 1** — Create/age the account. Run the scraper. Read `quotes.md`. Read the
rules pages of every target sub. Post nothing promotional.

**Week 2** — Comment daily in target subs, no links. Build the lead magnet and
the landing page. Verify the three competitor products (price, ratings,
positioning).

**Week 3** — Keep commenting. Publish your first value post in a *small* sub.
Answer every comment on it. Set up the email sequence.

**Week 4** — Second value post in a different sub. Add the product to your
profile bio. Review: which posts drew signups, which subs tolerated you, what
language landed. Adjust.

**Then repeat, for months.** This is the part that has no shortcut.
