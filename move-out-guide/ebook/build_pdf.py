#!/usr/bin/env python3
"""
build_pdf.py — render manuscript.md into the finished ebook PDF.

Usage:
    pip install markdown weasyprint
    python3 build_pdf.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import markdown
from weasyprint import HTML, CSS

HERE = Path(__file__).parent
SRC = HERE / "manuscript.md"
CSS_FILE = HERE / "style.css"
OUT = HERE / "The-Move-Out-Blueprint.pdf"

TITLE = "The Move-Out Blueprint"


def preprocess(md: str) -> str:
    """Run before markdown conversion.

    Long runs of underscores are fill-in-the-blank rules on the worksheets.
    Markdown would otherwise mangle them into emphasis, so convert them to
    styled spans up front.
    """
    def rule(m: "re.Match[str]") -> str:
        width = min(len(m.group(0)) * 0.40, 20.0)
        return f'<span class="fill" style="width:{width:.1f}em"></span>'

    return re.sub(r"_{3,}", rule, md)


def postprocess(html: str) -> str:
    """Fix up the raw markdown output for print."""

    # "- [ ]" checklists -> styled checkbox list items
    html = html.replace("<li>[ ] ", '<li class="task">')
    html = html.replace("<li>\n<p>[ ] ", '<li class="task">\n<p>')

    # VERIFY LOCALLY -> callout span
    html = re.sub(
        r"\*\*VERIFY LOCALLY\.?\*\*|VERIFY LOCALLY",
        '<span class="verify">VERIFY LOCALLY</span>',
        html,
    )
    # the above may have run inside an already-converted <strong>; tidy doubles
    html = html.replace(
        '<strong><span class="verify">VERIFY LOCALLY</span></strong>',
        '<span class="verify">VERIFY LOCALLY</span>',
    )

    # Each top-level "# " section starts a new page (except the cover, which
    # carries its own page-break-after).
    html = html.replace("<h1>", '<h1 style="page-break-before:always">')
    # ...but not the very first one, which follows the cover break already.
    html = html.replace('<h1 style="page-break-before:always">', "<h1>", 1)

    # paragraphs holding fill-in rules must not be justified
    html = re.sub(
        r"<p>((?:(?!</p>).)*?class=\"fill\"(?:(?!</p>).)*?)</p>",
        r'<p class="noj">\1</p>',
        html,
        flags=re.S,
    )

    return html


def build() -> None:
    if not SRC.exists():
        sys.exit(f"Missing {SRC}")

    md = SRC.read_text(encoding="utf-8")

    body = markdown.markdown(
        preprocess(md),
        extensions=["tables", "attr_list", "md_in_html", "sane_lists"],
        output_format="html5",
    )
    body = postprocess(body)

    doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{TITLE}</title>
</head>
<body>
{body}
</body>
</html>"""

    (HERE / "_render.html").write_text(doc, encoding="utf-8")

    HTML(string=doc, base_url=str(HERE)).write_pdf(
        OUT,
        stylesheets=[CSS(filename=str(CSS_FILE))],
    )
    size_kb = OUT.stat().st_size / 1024
    print(f"Wrote {OUT.name}  ({size_kb:.0f} KB)")


if __name__ == "__main__":
    build()
