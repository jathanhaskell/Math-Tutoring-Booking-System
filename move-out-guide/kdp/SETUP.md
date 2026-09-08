# Publishing on Amazon KDP — the whole process

**Total cost: $0.** KDP is free to publish. Print books get a free ISBN. Ebooks
don't need one. Amazon takes its cut from sales, never from you up front.

There is **no partnership or approval process.** KDP is self-serve — you sign up
like any website. Nobody has to accept you.

---

## Read this first: the AI disclosure is mandatory

**I drafted these manuscripts. Under Amazon's rules that is AI-generated text,
and you must declare it.**

Amazon introduced a mandatory AI-content disclosure in the KDP publishing flow in
early 2024. On the **Content Details** page you will see:

> *Is this content AI-generated?* → tick **"Yes, some of this content is AI-generated"** → then tick **Text**.

Amazon draws a line between:

- **AI-generated** — text, images or translations created by an AI tool, *even if you edited them afterwards*. **This is us. Declare it.**
- **AI-assisted** — you wrote it and AI only helped brainstorm or edit. Not our situation.

**Do not skip this or talk yourself out of it.** Failing to disclose violates
KDP's terms; books can be blocked or removed, and repeated violations can
terminate the account. The one thing that would actually cost you money here is
lying on this checkbox to avoid a perceived stigma.

**The good news:** the disclosure is private between you and Amazon. As of 2026
Amazon has not added any public "AI-generated" badge to product pages. It does
not appear to buyers.

**Two things you should do anyway**, because they're honest and they protect you:

1. **Read both books end to end before publishing.** You are the author of record and legally responsible for the content. If you haven't read it, don't sell it.
2. **Spot-check the A-tier figures** in `../research/02-source-library.md` that appear in your descriptions. They were verified by search, not by opening each source page — that limitation is documented, and a wrong number in a paid book generates refunds.

---

## What only you can do

I built every file. These four steps require your legal identity and a bank
account, so they are yours and cannot be delegated to me:

| Step | What it needs | Time |
|---|---|---|
| Create the KDP account | Email, password | 2 min |
| Personal identity | Your legal name and address | 3 min |
| **Tax interview** | US: W-9 with SSN or EIN. Non-US: W-8BEN | ~5 min |
| **Bank account** | For direct deposit of royalties | 5 min |

All three sections — identity, banking, tax — must be complete before Amazon
lets you publish. This is legally required; there is no way around it.

---

## Before you upload

1. Open `build_kdp.py`, set `AUTHOR = "Your Name"` at the top.
2. Rebuild: `python3 build_kdp.py`
   The placeholder is printed on the cover and title page, so this must happen first.
3. Files land in `upload/`.

---

## Publishing each book

You'll do this **four times**: paperback and Kindle, for each of the two
editions. All the copy is in [`LISTINGS.md`](./LISTINGS.md).

### Paperback

1. KDP dashboard → **Create** → **Paperback**
2. **Language** English · **Title** and **Subtitle** from LISTINGS.md · **Author** you
3. **Description** — paste the HTML block
4. **Publishing rights** — "I own the copyright"
5. **Keywords** — seven boxes, one phrase each
6. **Categories** — pick from LISTINGS.md
7. **Content Details** → **AI disclosure: Yes → Text** *(see above)*
8. **ISBN** — choose **"Get a free KDP ISBN"**
9. **Print options:** Black & white interior on **white paper** · **6 × 9 in** trim · **No bleed** · **Matte** cover
   *(White paper matters — the spine width in the cover file was calculated for it.)*
10. Upload **`-KDP-Interior.pdf`**, then **`-KDP-Cover.pdf`**
11. Run **Launch Previewer.** Fix nothing unless it flags something — margins and spine are already to spec
12. **Pricing** — list price from LISTINGS.md. KDP shows your exact royalty after printing cost
13. **Publish**

### Kindle ebook

1. KDP dashboard → **Create** → **Kindle eBook**
2. Same title, subtitle, description, keywords, categories
3. **AI disclosure: Yes → Text** again — it's a separate listing, asked separately
4. Upload the **`.epub`**
5. **Cover** — KDP's Cover Creator can generate one, or crop the front panel out of the cover PDF (the right-hand third)
6. **DRM** — your choice; it doesn't affect royalties
7. **KDP Select** — enrolling makes the ebook Amazon-exclusive for 90 days in exchange for Kindle Unlimited page-read income. **Worth considering precisely because it's passive**, but it blocks selling the ebook anywhere else during that window. Your call
8. **Pricing** — keep Kindle between **$2.99 and $9.99** to qualify for the **70%** royalty rate. Below or above that band drops you to 35%
9. **Publish**

---

## What happens next

- **Review: up to 72 hours** before the book goes live
- **Payment: monthly, roughly 60 days in arrears.** A sale in January pays out around late March. First money is slow — this is normal, not a problem with your listing
- **After that: nothing.** No maintenance. The listing sells or it doesn't, and either way it doesn't need you

---

## The honest expectation

Publishing is not marketing. Amazon will show your book to people who search for
it — that's real, and it's why this channel suits you — but a new listing with no
reviews ranks poorly at first.

Realistically: **a handful of sales a month to start, if the keywords match what
people actually type.** It compounds slowly as reviews accumulate. Anyone
promising more than that from a cold KDP launch is selling you something.

The trade you've made is deliberate: far less per sale than selling direct, in
exchange for never having to do marketing. That's the right trade for what you
asked for.

---

## Two zero-effort things worth doing once

1. **Cross-link the editions.** Once both are live, edit each description to link the other. Costs one minute, permanently raises revenue per buyer.
2. **Amazon Author Central** — free, takes ten minutes, gives you an author page and links your books together. Then never touch it again.

---

## If you later want more

Everything else in this repo — the Reddit playbook, the Gumroad pricing model,
the lead magnet — was built for an active-marketing strategy you've decided
against. It stays in the repo. If you ever change your mind it's there, and none
of it is required for KDP to work.
