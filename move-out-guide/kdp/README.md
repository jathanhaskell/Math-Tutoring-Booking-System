# KDP publishing package

Everything needed to put both editions on Amazon. **Cost to publish: $0.**

## Files

```
kdp/
├── SETUP.md          ← start here: account, AI disclosure, step-by-step publishing
├── LISTINGS.md       ← titles, descriptions, keywords, categories, pricing to paste
├── build_kdp.py      ← builds all upload files
├── print.css         ← paperback interior stylesheet (mirrored margins)
└── upload/           ← the files you give Amazon
    ├── The-Move-Out-Blueprint-KDP-Interior.pdf              53pp, 6×9in
    ├── The-Move-Out-Blueprint-KDP-Cover.pdf                 12.3694 × 9.25in
    ├── The-Move-Out-Blueprint.epub                          reflowable Kindle
    ├── The-Move-Out-Blueprint-Parent-Edition-KDP-Interior.pdf   42pp
    ├── The-Move-Out-Blueprint-Parent-Edition-KDP-Cover.pdf      12.3446 × 9.25in
    └── The-Move-Out-Blueprint-Parent-Edition.epub
```

## Build

```bash
pip install markdown weasyprint ebooklib pymupdf
python3 build_kdp.py            # both editions
python3 build_kdp.py parent     # just one
```

**Set `AUTHOR` at the top of `build_kdp.py` and rebuild before publishing** — the
placeholder prints on the cover and title page.

## Why these differ from `../editions/`

| | `editions/` | `kdp/upload/` |
|---|---|---|
| Purpose | Direct digital sale (Gumroad etc.) | Amazon |
| Cover | Page 1 of the PDF | Separate full-wrap file with spine |
| Margins | Symmetrical | **Mirrored** for binding (0.75in gutter) |
| Ebook | Fixed-layout PDF | **Reflowable EPUB** |
| Front matter | Cover page | Title page + copyright page |

A fixed-layout 6×9 PDF is a poor Kindle book, and a print interior must not
contain its own cover. Hence the separate pipeline.

## Specs used

- Trim **6 × 9in**, no bleed — KDP standard
- Inside (gutter) margin **0.75in**, outside **0.5in** — comfortably above KDP's 0.375in / 0.25in minimums for this page count
- Spine = page count × **0.002252in** (white paper)
- Cover = (2 × 6in) + spine + 0.25in bleed wide × 9.25in tall
- Back cover keeps a clear **1.6in bottom band** for Amazon's barcode

## Non-negotiable

**The AI-content disclosure in SETUP.md is mandatory.** These manuscripts were
AI-drafted; Amazon requires that to be declared. It's private, buyers never see
it, and skipping it risks removal or account termination.
