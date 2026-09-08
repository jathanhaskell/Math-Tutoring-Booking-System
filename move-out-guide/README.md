# The Move-Out Blueprint — product build

A two-edition digital product line for young adults leaving home and the parents
helping them, plus the research and go-to-market work behind it.

## What's here

```
move-out-guide/
├── editions/
│   ├── The-Move-Out-Blueprint.pdf                 50 pp — for the young adult
│   ├── The-Move-Out-Blueprint-Parent-Edition.pdf  41 pp — for the parent
│   ├── The-Research-Basis.pdf                     41 pp — 218 sources, tiered
│   ├── core.md · parent.md                        manuscripts
│   ├── style.css                                  shared print stylesheet
│   └── build.py                                   builds all three
├── research/
│   ├── 01-demand-evidence.md      market validation + verification limits
│   ├── 02-source-library.md       the 218-source master list
│   └── reddit_demand_scraper.py   runnable PRAW demand sweep
├── sales/
│   ├── ebook-description.md       sales copy, source block, full legal text
│   └── research-basis-intro.md    front matter for the buyer-facing source PDF
└── launch/
    ├── reddit-distribution-playbook.md
    └── offer-and-pricing.md
```

## Build

```bash
pip install markdown weasyprint
cd editions && python3 build.py           # all three
python3 build.py parent                   # just one
```

Edit the manuscript, rerun, done. `style.css` controls all layout.

## The strategy in three lines

1. **The parent is the buyer.** They have the money and a quantifiable pain: $1,384/month out, $609/month into their own retirement.
2. **The core edition is bought by the parent and read by their kid.** The sales page speaks to parents; the book speaks to the young adult as an adult. Breaking that split kills the product with its actual reader.
3. **Sources and legal text live in the sales description, not the books.** That's what keeps the books short enough to actually finish.

## Evidence base

218 sources, each carrying a verification tier:

- **69 A-tier** — named primary institution reporting its own figure (HUD, CFPB, FTC, BLS, USDA, Census, Surgeon General, Harvard JCHS, NBER)
- **105 B-tier** — reputable secondary reporting a named primary study
- **39 C-tier** — industry/aggregator; use as ranges only
- **5 entries** recording where the evidence is **weaker** than the popular claim

The most valuable section is Part 1: evidence that the **methods** work — if-then
planning (d = 0.65 across 94 studies), automatic transfers, commitment devices,
separated and labelled accounts, checklists, and structured financial education
(76 RCTs, 160,000+ participants). No competitor in this category has this.

## Read this before selling

**Nobody has trialled "does a move-out guide work."** That study doesn't exist. What
the sources evidence are the *mechanisms*. Don't let a sales page imply otherwise.

**The Reddit scrape still hasn't been run.** All outbound network access is blocked
in this build environment — Reddit, its archive APIs, every mirror, and competitor
sales pages. `research/reddit_demand_scraper.py` does the job on your own machine in
about 20 minutes. Full detail in `research/01-demand-evidence.md`.

**The sources are search-verified, not page-verified.** The tier column is honest
about this. Before you print "218 sources" on a sales page, spot-check the A-tier
figures you quote in marketing. It takes an afternoon.

## Next three actions

1. **Pre-sell the Parent Edition.** 20 real payments before any more writing. `launch/offer-and-pricing.md` §3
2. **Verify the three known competitors** — prices and rating counts, 30 minutes. `research/01-demand-evidence.md` §3
3. **Build the free Number Calculator** — it's the funnel's entry point and nothing works without it

## Pre-launch checklist

- [ ] Spot-check every ⚠️ row in `research/02-source-library.md` you plan to quote
- [ ] Confirm sales-tax / VAT position, or use a merchant of record
- [ ] Have someone outside this project read the core edition and confirm it doesn't sound like it was written for parents
- [ ] Set up the email capture before driving any traffic
