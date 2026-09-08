# KDP form walkthrough — every field, in order

The Kindle eBook Details page asks these in this order. Values below are ready to paste.

## STOP — do this first

The author placeholder is baked into the files. Before uploading anything:

1. Open `build_kdp.py`, set `AUTHOR = "Your Real Name"`
2. Run `python3 build_kdp.py`
3. Run `python3 verify.py` — should say PASS

It appears on the paperback cover, the paperback title page, **and inside the EPUB
metadata**. Upload without doing this and your book is published by "[YOUR NAME]".

---

## Core edition — field by field

| Field | What to enter |
|---|---|
| **Language** | English |
| **Book Title** | `The Move-Out Blueprint` |
| **Subtitle** | `The 14-Step System for Leaving Your Parents' House Without Moving Back In` |
| **Series** | `The Move-Out Blueprint` — choose **unordered / collection** if offered. If it only allows numbered volumes, **leave blank** |
| **Edition Number** | **Leave blank.** It's for revised editions of an already-published book |
| **Author** | Your first and last name — your real legal name |
| **Contributors** | **Leave blank.** Only for a real editor, illustrator or co-author |
| **Description** | See HTML block below |
| **Publishing Rights** | **"I own the copyright and I hold the necessary publishing rights"** |
| **Primary Audience** | Sexually explicit content: **No**. Reading age: **leave blank** — setting a range narrows discovery and gains nothing here |
| **Primary Marketplace** | **Amazon.com** — every figure, law and programme in the book is US |
| **Categories** | See below (up to 3) |
| **Keywords** | See below (7 boxes) |
| **Pre-order** | **"I am ready to release my book now."** See the note below on why not pre-order |

### Description (3,773 characters — KDP allows 4,000)

```html
<h2>Your kid thinks moving out costs $3,000. It's closer to $7,200.</h2>
<p>Between <b>40 and 60% of young adults who move out end up moving back in at least once.</b> Not because they're lazy &mdash; roughly 70% of 25-to-34-year-olds living with their parents have jobs. They fail for a boring, preventable reason: they budgeted for rent, and rent was never the thing that got them.</p>
<p>It was the $600 car repair in month four. The month hours got cut. The utility deposit that costs <i>more</i> when you have thin credit. The slow bleed of eating out because cooking never became a habit.</p>
<p><b>The Move-Out Blueprint is fourteen steps, in order.</b> No pep talk, no filler, nothing you have to wade through. Every step ends with a single if-then commitment &mdash; a format that produced a medium-to-large improvement in actually reaching the goal across 94 studies.</p>
<h3>Part 1 &mdash; The number</h3>
<p>Most people plan around "three times the rent" and miss half the cost. Step 1 builds the real figure across four buckets: move-in cash, setup costs nobody lists, furnishing, and the reserve month that decides whether you stay out. Step 2 turns it into a dated deadline. Step 3 closes the gap with the three levers ranked by actual leverage &mdash; including the one most people ignore.</p>
<h3>Part 2 &mdash; Getting approved</h3>
<p>Landlords want a credit score around 620&ndash;670 and gross income of three times the rent. If you've never had a card or a lease you may have no score at all, and screening software often treats that as a decline. Step 4 fixes a thin file in six months, including the move the CFPB found raised the odds of having a credit score by 24%. Step 5 builds the application packet and the cover letter that beats a better credit score. Step 6 covers what to do when the answer is still no.</p>
<h3>Part 3 &mdash; Finding it</h3>
<p>Consumers have reported roughly $65 million in rental-scam losses since 2020, and about half of recent scams started with a fake Facebook ad. Step 7 is the checklist that keeps your deposit. Step 8 is what to actually test at a viewing &mdash; most people stand in the middle of the room and nod. Step 9 walks the lease clause by clause, including terms that are illegal in some states.</p>
<h3>Part 4 &mdash; The move</h3>
<p>A two-week runbook in the right order, furnishing in three waves instead of one panicked weekend, and the thirty minutes on move-in day that decide whether you see your deposit again.</p>
<h3>Part 5 &mdash; Staying out</h3>
<p>The money system, food (where new renters quietly lose $200&ndash;$250 a month), and the part of month three nobody warns you about.</p>
<h3>Why this one is different</h3>
<p><b>Every number is cited.</b> 218 sources &mdash; HUD, the CFPB, the FTC, the Bureau of Labor Statistics, the USDA, the U.S. Surgeon General's office, the Harvard Joint Center for Housing Studies, and peer-reviewed research. The full list is included free.</p>
<p><b>It contradicts the standard advice where the standard advice is wrong.</b> Most guides say download a budgeting app. Research found budget-feedback apps can make people spend <i>more</i>, because seeing "amount left to spend" reassures you there's money left. The system here is built around that finding instead of ignoring it.</p>
<p><b>It says where the evidence is weak.</b> There's a section for it &mdash; including a claim from an earlier draft that was softened when the research came back thinner than the popular version.</p>
<p><i>Not a motivational book. This is a sequence. And if the honest answer is to wait six months and leave with a real cushion, Step 1 will say so.</i></p>
<p><i>A companion Parent Edition, written for the parent helping them, is available separately.</i></p>
```

### Categories (pick up to 3)

```
Business & Money > Personal Finance > Budgeting & Money Management
Self-Help > Personal Transformation
Education & Teaching > Studying & Workbooks > Study Skills
```

### Keywords (7 boxes, one phrase each)

```
how to move out of your parents house
first apartment guide for young adults
moving out for the first time checklist
adulting book for young adults money
renting your first apartment tips
financial independence for young adults
budgeting for your first apartment
```

---

## Parent Edition — field by field

Same answers for Language, Series, Edition Number, Contributors, Publishing
Rights, Primary Audience, Primary Marketplace and Pre-order. These differ:

| Field | What to enter |
|---|---|
| **Book Title** | `The Move-Out Blueprint: Parent Edition` |
| **Subtitle** | `How to Help Your Adult Child Move Out Without Funding It Forever` |

### Description (3,568 characters)

```html
<h2>You're paying $1,384 a month. You're putting $609 into your own retirement.</h2>
<p>Parents supporting an adult child hand over an average of <b>$1,384 a month</b> &mdash; more than twice the <b>$609</b> the average working parent puts into their own retirement. <b>58% say they have sacrificed their own financial security.</b> Nearly nine in ten say they would sacrifice more. Almost none of them have added up the number.</p>
<h3>This is not a book about pressuring them to leave</h3>
<p>Pressure doesn't work, and the research on controlling approaches is genuinely bad. A meta-analysis of 53 studies found helicopter parenting associated with <i>reduced self-efficacy</i> &mdash; the exact capacity required to move out. <b>You can make this worse by trying harder.</b></p>
<p>It's also not a book that calls them lazy. About 70% of 25-to-34-year-olds living with a parent are employed, and 49% of American renters now spend more than 30% of income on housing. The world they're launching into is measurably harder than the one you launched into. That isn't an excuse for them; it's context you need before you open your mouth.</p>
<h3>What's inside</h3>
<ul>
<li><b>Why they haven't left</b> &mdash; the real blockers: entry cost, the qualification gate, and the sequence nobody explains</li>
<li><b>What it's costing you</b> &mdash; the worksheet most parents have never filled in, including what it's doing to your retirement</li>
<li><b>A readiness score for them, and one for you.</b> The second is harder, and one row on it predicts more than all the others</li>
<li><b>How to open the conversation</b> without it landing as an eviction notice &mdash; including the five sentences that end it before it starts</li>
<li><b>The written agreement</b>, and "shadow rent": the structure that builds the payment habit and funds the deposit at the same time</li>
<li><b>The help ladder</b> &mdash; what builds capability versus what quietly substitutes for it, drawn from self-determination theory and financial socialisation research</li>
<li><b>Gift, loan, or match</b> &mdash; and why matched saving outperforms a straight gift</li>
<li><b>Cosigning: the full risk</b>, stated plainly, with the one question that decides whether you sign</li>
<li><b>If they move back</b> &mdash; 40 to 60% do, and how you respond decides the second attempt</li>
<li><b>Protecting your own retirement</b>, including the ceiling to set before the next request arrives</li>
</ul>
<h3>The uncomfortable premise</h3>
<p>If you deplete your retirement helping them, you become their financial responsibility in twenty years. <b>Protecting yourself isn't the opposite of generosity. It's the same goal on a longer timeline.</b> The most generous thing available to you is arriving at 80 financially independent.</p>
<h3>Honest about the research</h3>
<p>Built on 218 cited sources &mdash; the U.S. Census, HUD, the CFPB, the Bureau of Labor Statistics, the Harvard Joint Center for Housing Studies, and peer-reviewed work in self-determination theory, financial socialisation and behavioural economics. The full list is included free, with a verification tier on every source.</p>
<p>The parenting findings are <b>correlational</b>. They describe consistent, cross-culturally replicated associations &mdash; not a formula that guarantees a result in your family. The book says so, in those words. Your child is not an effect size.</p>
<p><i>A companion edition written for the young adult &mdash; fourteen practical steps in their language &mdash; is available separately.</i></p>
```

### Categories

```
Parenting & Relationships > Parenting > Teenagers
Business & Money > Personal Finance > Retirement Planning
Self-Help > Relationships > Dysfunctional Families
```

### Keywords

```
adult children living at home parents
how to help your adult child move out
failure to launch adult child help
parenting adult children boundaries
supporting adult children financially
empty nest adult child still at home
parenting young adults advice book
```

---

## The decisions explained

**Series — use it.** Both books share one name and cross-sell each other. A
series gets a free Amazon series page and links them on both product pages.
That's permanent cross-promotion that needs no maintenance, which is exactly the
kind you want. If KDP insists on numbering volumes, skip it — a companion edition
forced into "Book 2" reads wrong.

**Edition Number — blank.** This field means "2nd edition, revised". A first
edition leaves it empty. Putting "1" is harmless but unnecessary.

**Contributors — blank.** Do not invent an editor to look established. Amazon
lists contributors publicly and it's a claim you'd have to stand behind.

**Publishing Rights — you own it.** You commissioned it, you're publishing it,
you hold the rights. Select the "I own the copyright" option, not public domain.

**Primary Audience — no reading age.** The field is optional. Setting a minimum
age filters you out of some browse results and buys you nothing. Answer "No" to
sexually explicit content and move on.

**Pre-order — release now.** Pre-order helps only if you have an audience to
point at it, and you deliberately don't. Worse: Amazon counts pre-order sales
toward launch ranking, so an empty pre-order period actively hurts you, and
missing a pre-order delivery deadline can suspend pre-order privileges for a
year. There is no upside here. Release now.

**Still coming on the next page:** the **AI-generated content disclosure**. Tick
**Yes → Text**. It is mandatory, it is private, and buyers never see it. See
[`SETUP.md`](./SETUP.md).

---

# KDP Listings — copy and paste

Four listings: paperback + Kindle for each edition. Everything below is
ready to paste into the KDP publishing form.

Replace `[YOUR NAME]` everywhere, and set `AUTHOR` at the top of `build_kdp.py`
then rebuild before uploading — the placeholder is printed on the cover and title
page.

---

# 1 · The Move-Out Blueprint *(core edition)*

**Files:** `upload/The-Move-Out-Blueprint-KDP-Interior.pdf` ·
`upload/The-Move-Out-Blueprint-KDP-Cover.pdf` ·
`upload/The-Move-Out-Blueprint.epub`

### Title
```
The Move-Out Blueprint
```

### Subtitle
```
The 14-Step System for Leaving Your Parents' House Without Moving Back In
```

### Author
```
[YOUR NAME]
```

### Description
*Paste into the description box. KDP accepts basic HTML — this is already formatted.*

```html
<h2>Your kid thinks moving out costs $3,000. It's closer to $7,200.</h2>
<p>Between <b>40 and 60% of young adults who move out end up moving back in at least once</b>. Not because they're lazy — about 70% of 25-to-34-year-olds living with their parents have jobs. They fail for a boring reason: they budgeted for rent, and rent was never the thing that got them.</p>
<p>It was the $600 car repair in month four. The reduced-hours month. The utility deposit that costs <i>more</i> when you have thin credit.</p>
<p><b>This book is fourteen steps, in order.</b> No pep talk, no filler. Each step ends with one specific if-then commitment — a format that produced a medium-to-large improvement in actually reaching the goal across 94 studies.</p>
<h3>What's inside</h3>
<ul>
<li><b>Your real number</b> — the four-bucket calculation most people get wrong by half</li>
<li><b>A dated deadline</b>, not "someday"</li>
<li><b>Credit from zero in six months</b>, including the move the CFPB found raised the odds of having a credit score by 24%</li>
<li><b>The application packet</b> and the cover letter that beats a better credit score</li>
<li><b>Finding a place without getting scammed</b> — consumers have reported about $65 million in rental-scam losses since 2020, roughly half starting with a fake Facebook ad</li>
<li><b>The lease</b>, clause by clause, including the ones that are illegal in some states</li>
<li><b>The 30 minutes on move-in day</b> that decide whether you get your deposit back</li>
<li><b>The first ninety days</b> — the money system, food, and the part nobody warns you about</li>
</ul>
<h3>Why this one is different</h3>
<p><b>Every number is cited.</b> 218 sources — HUD, the CFPB, the FTC, the Bureau of Labor Statistics, the USDA, the U.S. Surgeon General's office, the Harvard Joint Center for Housing Studies, and peer-reviewed research.</p>
<p><b>It contradicts the standard advice where the standard advice is wrong.</b> Most guides say download a budgeting app. Research found budget-feedback apps can make people spend <i>more</i> — because seeing "amount left to spend" reassures you there's money left. The system in this book is built around that finding instead of ignoring it.</p>
<p><b>It tells you where the evidence is weak.</b> There's a section for it, including one claim from an earlier draft that had to be softened when the research came back thinner than the popular version.</p>
<h3>Who it's for</h3>
<p>Parents buying it for an adult child who's ready to go but stuck on the how. Young adults buying it for themselves. Anyone who's tried "just save more" and discovered that isn't a plan.</p>
<p><i>Not for anyone wanting motivation. This is a sequence. And if the honest answer is to wait six months and leave with a real cushion, Step 1 will say so.</i></p>
```

### Keywords *(7 slots — paste one per box)*
```
how to move out of your parents house
first apartment guide for young adults
moving out for the first time checklist
adulting book for young adults money
renting your first apartment tips
financial independence young adults
budgeting for your first apartment
```

### Categories
```
Business & Money > Personal Finance > Budgeting & Money Management
Self-Help > Personal Transformation
Young Adult > Education & Reference > Careers    (if a third slot is offered)
```

### Pricing
| Format | List price | Notes |
|---|---|---|
| Kindle | **$6.99** | Inside the $2.99–$9.99 band, so you get the 70% royalty rate |
| Paperback | **$14.99** | Above $9.99, so you get the 60% rate; printing cost is deducted |

**Check your exact royalty in KDP's own pricing panel before you publish** — it
calculates printing cost from your real page count and shows the number.

---

# 2 · The Move-Out Blueprint: Parent Edition

**Files:** `upload/The-Move-Out-Blueprint-Parent-Edition-KDP-Interior.pdf` ·
`upload/The-Move-Out-Blueprint-Parent-Edition-KDP-Cover.pdf` ·
`upload/The-Move-Out-Blueprint-Parent-Edition.epub`

### Title
```
The Move-Out Blueprint: Parent Edition
```

### Subtitle
```
How to Help Your Adult Child Move Out Without Funding It Forever
```

### Description

```html
<h2>You're paying $1,384 a month. You're putting $609 into your own retirement.</h2>
<p>Parents supporting an adult child hand over an average of <b>$1,384 a month</b> — more than twice the <b>$609</b> the average working parent contributes to their own retirement. <b>58% say they have sacrificed their own financial security.</b> Nearly nine in ten say they would sacrifice more.</p>
<p>Almost none of them have added up the number.</p>
<h3>This is not a book about pressuring them to leave</h3>
<p>Pressure doesn't work, and the research on controlling approaches is genuinely bad. A meta-analysis of 53 studies found helicopter parenting associated with <i>reduced self-efficacy</i> — which is the exact capacity required to move out. <b>You can make this worse by trying harder.</b></p>
<p>It's a book about help that actually works, and the research is unusually clear on what separates the two.</p>
<h3>What's inside</h3>
<ul>
<li><b>Why they haven't left</b> — and why "lazy" is the wrong diagnosis for a generation that's about 70% employed</li>
<li><b>What it's costing you</b>, with the worksheet most parents have never filled in, including the retirement math</li>
<li><b>A readiness score for them — and one for you.</b> The second one is harder</li>
<li><b>How to open the conversation</b> without it landing as an eviction notice, including the five sentences that end it before it starts</li>
<li><b>The written agreement</b>, and "shadow rent" — the structure that builds the habit and funds the deposit at the same time</li>
<li><b>The help ladder</b> — what builds capability versus what quietly substitutes for it</li>
<li><b>Gift, loan, or match</b> — and why matched saving beats a straight gift</li>
<li><b>Cosigning: the full risk</b>, stated plainly, with the one question that decides it</li>
<li><b>If they move back</b> — 40 to 60% do, and how you respond decides the second attempt</li>
<li><b>Protecting your own retirement</b>, including the ceiling to set before the next request</li>
</ul>
<h3>The uncomfortable premise</h3>
<p>If you deplete your retirement helping them, you become their financial responsibility in twenty years. <b>Protecting yourself isn't the opposite of generosity. It's the same goal on a longer timeline.</b></p>
<h3>Honest about the research</h3>
<p>Built on 218 cited sources — the U.S. Census, HUD, the CFPB, the Bureau of Labor Statistics, the Harvard Joint Center for Housing Studies, and peer-reviewed work in self-determination theory and financial socialisation.</p>
<p>The parenting findings are <i>correlational</i>. They describe consistent, cross-culturally replicated associations — not a formula that guarantees a result in your family. The book says so, in those words. Your child is not an effect size.</p>
<p><i>A companion edition written for the young adult is available separately.</i></p>
```

### Keywords
```
adult children living at home parents
how to help your adult child move out
failure to launch adult child
parenting adult children boundaries
supporting adult children financially
empty nest adult child still home
parenting young adults advice
```

### Categories
```
Parenting & Relationships > Parenting > Teenagers  (closest fit; check for a "Parenting Adult Children" node)
Business & Money > Personal Finance > Retirement Planning
Self-Help > Relationships > Dysfunctional Families  (if a third slot is offered)
```

### Pricing
| Format | List price | Notes |
|---|---|---|
| Kindle | **$8.99** | Higher than the core edition on purpose — this buyer has money and a sharper pain |
| Paperback | **$16.99** | |

---

## Cross-linking the two books

In each description, the closing line points at the other edition. Once both are
live, go back and add the actual Amazon links. Readers who buy one frequently buy
the other, and this is the only "marketing" in the whole plan that costs nothing
and never needs touching again.

## The Research Basis

`editions/The-Research-Basis.pdf` is **not** a KDP product. It's the free bonus
that makes "218 cited sources" credible.

Two options, both effectively zero-maintenance:

1. **Put it in the back of both books** as an appendix — but it adds ~41 pages, which raises printing cost and thickens the spine.
2. **Better: host it as a free download** on any static host and put the link in the back matter of each book.

If you want zero infrastructure, option 1 is fine — say the word and I'll fold it
into the interiors and rebuild the covers with the new spine width.
