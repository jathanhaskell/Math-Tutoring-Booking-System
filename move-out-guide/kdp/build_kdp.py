#!/usr/bin/env python3
"""
build_kdp.py — produce Amazon KDP upload files for both editions.

Outputs, per edition:
  <Name>-KDP-Interior.pdf   6x9in paperback interior, mirrored margins, no bleed
  <Name>-KDP-Cover.pdf      full-wrap cover at exact KDP dimensions
  <Name>.epub               reflowable Kindle edition

Why separate from editions/build.py: the digital PDF is a fixed-layout 6x9 file
with a full-bleed colour cover page. A print interior must not contain the
cover (KDP takes that as its own file) and needs mirrored binding margins; a
Kindle book must be reflowable, not fixed-layout.

    pip install markdown weasyprint ebooklib
    python3 build_kdp.py
"""

from __future__ import annotations

import re
import sys
import zipfile
from pathlib import Path

import markdown
from weasyprint import HTML, CSS

HERE = Path(__file__).parent
EDITIONS = (HERE / ".." / "editions").resolve()
OUT = HERE / "upload"

sys.path.insert(0, str(EDITIONS))
import build as digital  # reuse preprocess/postprocess so both stay in step

AUTHOR = "[YOUR NAME]"          # set before publishing
YEAR = "2026"

# KDP: white paper spine = pages * 0.002252in; cover bleed 0.125in each edge.
SPINE_PER_PAGE_IN = 0.002252
BLEED_IN = 0.125
TRIM_W_IN, TRIM_H_IN = 6.0, 9.0

BOOKS = {
    "core": {
        "src": EDITIONS / "core.md",
        "slug": "The-Move-Out-Blueprint",
        "title": "The Move-Out Blueprint",
        "subtitle": "Leave your parents' house — and don't move back in",
        "kicker": "The 14-step system",
        "backhead": "You think moving out costs $3,000.<br>It's closer to $7,200.",
        "coversub": "Leave your parents' house — and don't move back in",
        "covertag": "Your real number. Your real date. The steps between here and your own front door.",
        "blurb": [
            "Between 40 and 60% of young adults who move out end up moving back in "
            "at least once. This is the guide built to prevent that.",
            "Most people plan around \"three times the rent.\" The real number is "
            "closer to $7,200 — and the gap is why people move out in March and "
            "move home in November.",
            "Fourteen steps, in order. The real cost. Getting approved with thin "
            "credit. Finding a place without getting scammed. The lease clauses that "
            "cost you money. And the first ninety days, which is where it usually "
            "falls apart.",
        ],
        "backbullets": [
            "Your real move-out number, in four buckets",
            "Credit from zero in six months",
            "The cover letter that beats a better credit score",
            "Lease red flags, clause by clause",
            "The 30 minutes on move-in day that protect your deposit",
            "A money system built on how people actually behave",
        ],
    },
    "parent": {
        "src": EDITIONS / "parent.md",
        "slug": "The-Move-Out-Blueprint-Parent-Edition",
        "title": "The Move-Out Blueprint",
        "subtitle": "Parent Edition — How to help your adult child leave without funding it forever",
        "kicker": "Parent Edition",
        "backhead": "$1,384 a month out.<br>$609 into your own retirement.",
        "coversub": "How to help your adult child leave without funding it forever",
        "covertag": "Help that builds capability, help that creates dependency, and how to tell which one you're giving.",
        "blurb": [
            "Parents supporting an adult child hand over an average of $1,384 a "
            "month. The average working parent puts $609 into their own retirement.",
            "This is not a book about pressuring them to leave. The research on "
            "controlling approaches is genuinely bad — overparenting is associated "
            "with reduced self-efficacy, which is the exact capacity required to "
            "move out. You can make this worse by trying harder.",
            "It is a book about help that builds capability instead of dependency, "
            "and how to tell which one you are giving.",
        ],
        "backbullets": [
            "What their support is actually costing your retirement",
            "How to open the conversation without a fight",
            "The written agreement, and \"shadow rent\"",
            "Gift, loan, or match — and which one works",
            "Cosigning: the full risk, stated plainly",
            "What to do if they move back (40–60% do)",
        ],
    },
}


# ---------------------------------------------------------------- helpers

def strip_cover(md: str) -> str:
    """Remove the digital cover block — KDP supplies the cover as its own file.

    The block contains nested <div>s, so a lazy `.*?</div>` stops at the first
    inner close and leaks the title, subtitle and tagline into the interior.
    Cut from the opening tag to the start of the next top-level block instead.
    """
    start = md.find('<div class="cover"')
    if start == -1:
        sys.exit("strip_cover: cover block not found — check the manuscript structure")
    end = md.find('<div class="frontmatter"', start)
    if end == -1:
        sys.exit("strip_cover: no frontmatter block after the cover — cannot bound the cut")
    return md[:start] + md[end:]


def title_page_html(b: dict) -> str:
    return f"""<div class="titlepage">
  <div class="tp-kicker">{b['kicker']}</div>
  <div class="tp-title">{b['title']}</div>
  <div class="tp-sub">{b['subtitle']}</div>
  <div class="tp-rule"></div>
  <div class="tp-author">{AUTHOR}</div>
</div>
<div class="copyrightpage">
  <p><strong>{b['title']}</strong><br>{b['subtitle']}</p>
  <p>Copyright &copy; {YEAR} {AUTHOR}. All rights reserved.</p>
  <p>No part of this publication may be reproduced, distributed, or transmitted
     in any form or by any means without the prior written permission of the
     publisher, except in the case of brief quotations embodied in reviews.</p>
  <p><strong>Educational content only.</strong> This book provides general
     educational information. It does not constitute financial, legal, tax,
     insurance, psychological, or medical advice, and no advisory or professional
     relationship is created by reading it. Landlord&ndash;tenant law, deposit
     rules, fee caps and eviction procedure vary significantly by state and
     municipality and change over time. Passages marked VERIFY LOCALLY require you
     to confirm current rules for your jurisdiction. Consult a qualified
     professional &mdash; including free local legal aid &mdash; before making
     significant financial or legal decisions.</p>
  <p>Costs, rents and survey figures reflect data available as of September 2026
     and will change. Cited research describes findings in studied populations;
     correlational findings describe associations, not guaranteed outcomes. No
     result is promised or implied.</p>
  <p>If you or someone else is in crisis, contact the 988 Suicide &amp; Crisis
     Lifeline (call or text 988, US) or your local emergency services.</p>
  <p>The author and publisher disclaim liability for any action taken based on
     this material.</p>
  <p>First edition, {YEAR}.</p>
</div>
"""


def md_to_body(md: str) -> str:
    body = markdown.markdown(
        digital.preprocess(md),
        extensions=["tables", "attr_list", "md_in_html", "sane_lists"],
        output_format="html5",
    )
    return digital.postprocess(body)


# ---------------------------------------------------------------- interior

def build_interior(key: str, b: dict) -> int:
    """Render the print interior; return its page count."""
    md = strip_cover(b["src"].read_text(encoding="utf-8"))
    body = title_page_html(b) + md_to_body(md)
    doc = (f'<!doctype html><html lang="en"><head><meta charset="utf-8">'
           f'<title>{b["title"]}</title></head><body>{body}</body></html>')

    out = OUT / f"{b['slug']}-KDP-Interior.pdf"
    HTML(string=doc, base_url=str(HERE)).write_pdf(
        out, stylesheets=[CSS(filename=str(HERE / "print.css"))])

    import pymupdf
    pages = pymupdf.open(out).page_count
    print(f"    {out.name}  {pages}pp  ({out.stat().st_size/1024:.0f} KB)")
    return pages


# ---------------------------------------------------------------- cover

def build_cover(key: str, b: dict, pages: int) -> None:
    spine = pages * SPINE_PER_PAGE_IN
    total_w = TRIM_W_IN * 2 + spine + BLEED_IN * 2
    total_h = TRIM_H_IN + BLEED_IN * 2

    bullets = "".join(f"<li>{x}</li>" for x in b["backbullets"])
    paras = "".join(f"<p>{x}</p>" for x in b["blurb"])

    doc = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: {total_w:.4f}in {total_h:.4f}in; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; width: {total_w:.4f}in; height: {total_h:.4f}in;
        background: #12303a; font-family: "Liberation Sans", sans-serif; color: #fff; }}
.wrap {{ display: flex; height: 100%; }}
.back  {{ width: {BLEED_IN + TRIM_W_IN:.4f}in; padding: 0.8in 0.6in 1.6in {BLEED_IN + 0.55:.4f}in;
           display: flex; flex-direction: column; }}
.spine {{ width: {spine:.4f}in; background: #0f5c4a; }}
.front {{ width: {TRIM_W_IN + BLEED_IN:.4f}in; padding: 1.45in 0.65in 0.9in 0.6in; }}

.kicker {{ font-size: 10pt; letter-spacing: 0.17em; text-transform: uppercase;
           color: #7fd4bb; margin-bottom: 0.55in; }}
h1 {{ font-size: 40pt; line-height: 1.02; font-weight: 700; letter-spacing: -0.02em;
      margin: 0 0 0.22in; }}
.sub {{ font-size: 15pt; font-weight: 400; line-height: 1.3; color: #b8e6d7; margin: 0 0 0.4in; }}
.rule {{ width: 1.1in; height: 3px; background: #7fd4bb; margin-bottom: 0.38in; }}
.tag {{ font-size: 11.5pt; font-style: italic; line-height: 1.45; color: #d5e7e1; }}
.author {{ position: absolute; bottom: 0.85in; font-size: 12pt; letter-spacing: 0.06em;
           color: #eaf4f0; }}

.back h2 {{ font-size: 17pt; line-height: 1.22; margin: 0 0 0.26in; color: #7fd4bb;
            font-weight: 700; letter-spacing: -0.01em; }}
.back p {{ font-size: 9.5pt; line-height: 1.5; color: #d5e7e1; margin: 0 0 0.13in; }}
.back ul {{ margin: 0.22in 0 0.24in; padding-left: 0.18in; }}
.back li {{ font-size: 9.5pt; line-height: 1.42; color: #eaf4f0; margin-bottom: 0.07in; }}
.srcline {{ margin-top: auto; font-size: 8.5pt; color: #7fd4bb; border-top: 1px solid #2c5460;
            padding-top: 0.13in; margin-top: 0.2in; line-height: 1.4; }}
</style></head><body><div class="wrap">
  <div class="back">
    <h2>{b['backhead']}</h2>
    {paras}
    <ul>{bullets}</ul>
    <div class="srcline">Every figure in this book is cited. Built on 218 sources
      from HUD, the CFPB, the FTC, the Bureau of Labor Statistics, the USDA, the
      Harvard Joint Center for Housing Studies and peer-reviewed research &mdash;
      including a section on where the evidence is weaker than the popular claim.</div>
  </div>
  <div class="spine"></div>
  <div class="front" style="position:relative">
    <div class="kicker">{b['kicker']}</div>
    <h1>{b['title']}</h1>
    <div class="sub">{b['coversub']}</div>
    <div class="rule"></div>
    <div class="tag">{b['covertag']}</div>
    <div class="author">{AUTHOR}</div>
  </div>
</div></body></html>"""

    out = OUT / f"{b['slug']}-KDP-Cover.pdf"
    HTML(string=doc).write_pdf(out)
    print(f"    {out.name}  {total_w:.4f}in x {total_h:.4f}in  "
          f"(spine {spine:.4f}in @ {pages}pp)")


# ---------------------------------------------------------------- kindle cover

def build_ebook_cover(key: str, b: dict) -> None:
    """Standalone Kindle cover image. Amazon wants 1600 x 2560 px (1.6:1)."""
    doc = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: 1600px 2560px; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; width: 1600px; height: 2560px; background: #12303a;
        font-family: "Liberation Sans", sans-serif; color: #fff;
        padding: 260px 150px 0; position: relative; }}
.kicker {{ font-size: 40px; letter-spacing: 6px; text-transform: uppercase;
           color: #7fd4bb; margin-bottom: 150px; }}
h1 {{ font-size: 175px; line-height: 1.02; font-weight: 700; letter-spacing: -3px;
      margin: 0 0 60px; }}
.sub {{ font-size: 64px; font-weight: 400; line-height: 1.28; color: #b8e6d7;
        margin: 0 0 110px; }}
.rule {{ width: 300px; height: 12px; background: #7fd4bb; }}
.foot {{ position: absolute; left: 150px; right: 150px; bottom: 200px; }}
.tag {{ font-size: 54px; font-style: italic; line-height: 1.4; color: #d5e7e1;
        padding-bottom: 80px; }}
.author {{ font-size: 56px; letter-spacing: 2px; color: #eaf4f0;
           border-top: 3px solid #2c5460; padding-top: 60px; }}
</style></head><body>
  <div class="kicker">{b['kicker']}</div>
  <h1>{b['title']}</h1>
  <div class="sub">{b['coversub']}</div>
  <div class="rule"></div>
  <div class="foot">
    <div class="tag">{b['covertag']}</div>
    <div class="author">{AUTHOR}</div>
  </div>
</body></html>"""

    tmp = OUT / f"_{key}_ebook.pdf"
    HTML(string=doc).write_pdf(tmp)

    import pymupdf
    pg = pymupdf.open(tmp)[0]
    pix = pg.get_pixmap(dpi=96)          # 96dpi => CSS px map 1:1
    out = OUT / f"{b['slug']}-Kindle-Cover.jpg"
    pix.save(out, jpg_quality=92)
    tmp.unlink()
    print(f"    {out.name}  {pix.width}x{pix.height}px  ({out.stat().st_size/1024:.0f} KB)")


# ---------------------------------------------------------------- epub

def build_epub(key: str, b: dict) -> None:
    """Reflowable EPUB 3 for Kindle. Hand-rolled: a small, predictable zip."""
    md = strip_cover(b["src"].read_text(encoding="utf-8"))
    body = md_to_body(md)
    # fixed-layout artefacts have no meaning in a reflowable book
    body = body.replace('<div class="page-break"></div>', "")
    body = re.sub(r'\s*style="page-break-before:always"', "", body)

    chunks = re.split(r"(?=<h1)", body)
    chapters = [c for c in chunks if c.strip()]

    css = """body{font-family:Georgia,serif;line-height:1.5;margin:0 5%;}
h1{font-size:1.5em;line-height:1.2;border-bottom:2px solid #0f5c4a;padding-bottom:.2em;
   color:#12303a;page-break-before:always;}
h2{font-size:1.2em;color:#12303a;margin-top:1.6em;}
h3{font-size:.95em;text-transform:uppercase;letter-spacing:.05em;color:#0f5c4a;margin-top:1.4em;}
table{width:100%;border-collapse:collapse;font-size:.85em;margin:1em 0;}
th{background:#12303a;color:#fff;text-align:left;padding:.4em;font-size:.8em;}
td{padding:.4em;border-bottom:1px solid #d8dde2;vertical-align:top;}
blockquote{background:#eef3f1;border-left:3px solid #0f5c4a;margin:1em 0;padding:.6em .8em;}
blockquote p{margin:0;}
.formula{background:#f2f5f6;border:1px solid #d8dde2;padding:.7em;text-align:center;margin:1em 0;}
.verify{background:#f7f0e6;color:#8a4b12;font-weight:bold;font-size:.85em;padding:0 .2em;}
li.task{list-style:none;}
li.task:before{content:"\\2610\\00a0";}
.fill{display:inline-block;border-bottom:1px solid #8b949a;min-width:6em;}
"""

    def xhtml(title: str, inner: str) -> bytes:
        return (f'<?xml version="1.0" encoding="utf-8"?>\n'
                f'<!DOCTYPE html>\n'
                f'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">\n'
                f'<head><meta charset="utf-8"/><title>{title}</title>'
                f'<link rel="stylesheet" type="text/css" href="style.css"/></head>\n'
                f'<body>{inner}</body></html>').encode("utf-8")

    def esc(s: str) -> str:
        return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

    out = OUT / f"{b['slug']}.epub"
    uid = f"urn:uuid:moveout-{key}-{YEAR}"

    with zipfile.ZipFile(out, "w") as z:
        z.writestr("mimetype", "application/epub+zip", zipfile.ZIP_STORED)
        z.writestr("META-INF/container.xml",
                   '<?xml version="1.0"?>\n<container version="1.0" '
                   'xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
                   '<rootfiles><rootfile full-path="OEBPS/content.opf" '
                   'media-type="application/oebps-package+xml"/></rootfiles></container>')
        z.writestr("OEBPS/style.css", css)

        items, spine_ids, nav_items = [], [], []
        for i, ch in enumerate(chapters, 1):
            m = re.search(r"<h1[^>]*>(.*?)</h1>", ch, re.S)
            t = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else f"Section {i}"
            fn = f"ch{i:02d}.xhtml"
            z.writestr(f"OEBPS/{fn}", xhtml(esc(t), ch))
            items.append(f'<item id="c{i}" href="{fn}" media-type="application/xhtml+xml"/>')
            spine_ids.append(f'<itemref idref="c{i}"/>')
            nav_items.append(f'<li><a href="{fn}">{esc(t)}</a></li>')

        z.writestr("OEBPS/nav.xhtml", xhtml("Contents",
                   f'<nav epub:type="toc" xmlns:epub="http://www.idpf.org/2007/ops">'
                   f'<h1>Contents</h1><ol>{"".join(nav_items)}</ol></nav>'))

        z.writestr("OEBPS/content.opf", f'''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
 <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="bookid">{uid}</dc:identifier>
  <dc:title>{esc(b["title"])}: {esc(b["subtitle"])}</dc:title>
  <dc:creator>{esc(AUTHOR)}</dc:creator>
  <dc:language>en-US</dc:language>
  <meta property="dcterms:modified">{YEAR}-09-08T00:00:00Z</meta>
 </metadata>
 <manifest>
  <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
  <item id="css" href="style.css" media-type="text/css"/>
  {"".join(items)}
 </manifest>
 <spine>{"".join(spine_ids)}</spine>
</package>''')

    print(f"    {out.name}  {len(chapters)} sections  ({out.stat().st_size/1024:.0f} KB)")


# ---------------------------------------------------------------- main

def main() -> None:
    OUT.mkdir(exist_ok=True)
    keys = sys.argv[1:] or list(BOOKS)
    for k in keys:
        if k not in BOOKS:
            sys.exit(f"Unknown edition {k!r}. Choose from: {', '.join(BOOKS)}")
    for k in keys:
        b = BOOKS[k]
        print(f"\n{b['slug']}")
        pages = build_interior(k, b)
        build_cover(k, b, pages)
        build_ebook_cover(k, b)
        build_epub(k, b)
    print(f"\nUpload files in: {OUT}")
    if AUTHOR.startswith("["):
        print("NOTE: set AUTHOR at the top of this file before publishing.")


if __name__ == "__main__":
    main()
