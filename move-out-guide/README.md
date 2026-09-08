# The Move-Out Blueprint — product build

A finished digital product for young adults trying to move out of their
parents' house, plus the research and go-to-market work behind it.

## What's here

```
move-out-guide/
├── ebook/
│   ├── The-Move-Out-Blueprint.pdf   ← the product: 87 pages, 6×9in
│   ├── manuscript.md                ← source text (~15,400 words)
│   ├── style.css                    ← print stylesheet
│   └── build_pdf.py                 ← rebuild the PDF
├── research/
│   ├── 01-demand-evidence.md        ← market validation + what could NOT be verified
│   ├── 02-source-library.md         ← all 63 sources behind the book's claims
│   └── reddit_demand_scraper.py     ← run this yourself to do the Reddit research
└── launch/
    ├── reddit-distribution-playbook.md
    └── offer-and-pricing.md
```

## Rebuilding the PDF

```bash
pip install markdown weasyprint
cd ebook && python3 build_pdf.py
```

Edit `manuscript.md`, rerun, done. `style.css` controls all layout.

## Read this first

**The Reddit scrape you asked for could not be run in the build environment.**
All outbound network access was blocked except a search API, and Reddit,
its archive APIs, and every mirror were denied. Rather than invent usernames
and upvote counts, the demand case was rebuilt from verifiable market data,
and `research/reddit_demand_scraper.py` will do the original job on your own
machine in about 20 minutes. Full detail — including every method tried and
how it failed — is in `research/01-demand-evidence.md`.

## The three things that decide whether this makes money

1. **Run the pre-sale before polishing anything.** Twenty real payments is the
   only validation that counts. `launch/offer-and-pricing.md` §2.
2. **Verify the three known competitors.** Their prices and rating counts were
   blocked here and will take you 30 minutes. `research/01-demand-evidence.md` §3.
3. **Don't launch on Reddit alone.** One hostile channel governed by volunteer
   moderators is not a distribution strategy.
   `launch/reddit-distribution-playbook.md` §9.

## Before you sell it

- [ ] Spot-check every ⚠️ row in `research/02-source-library.md` — rent, food,
      and state-law figures go stale within a year, and a stale number in a paid
      product generates refunds
- [ ] Have someone read the disclaimer at the end of the manuscript
- [ ] Confirm your sales-tax / VAT position (or use a merchant of record)
- [ ] Build the free calculator lead magnet — it's the funnel's entry point
