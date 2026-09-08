#!/usr/bin/env python3
"""
build.py — render both editions of The Move-Out Blueprint to PDF.

    pip install markdown weasyprint
    python3 build.py            # build both
    python3 build.py core       # build one
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import markdown
from weasyprint import HTML, CSS

HERE = Path(__file__).parent

# key -> (source files concatenated in order, output name, title)
EDITIONS = {
    "core":     (["core.md"],
                 "The-Move-Out-Blueprint.pdf",
                 "The Move-Out Blueprint"),
    "parent":   (["parent.md"],
                 "The-Move-Out-Blueprint-Parent-Edition.pdf",
                 "The Move-Out Blueprint — Parent Edition"),
    "research": (["../sales/research-basis-intro.md", "../research/02-source-library.md"],
                 "The-Research-Basis.pdf",
                 "The Research Basis"),
}


def preprocess(md: str) -> str:
    """Runs before markdown conversion.

    Long underscore runs are fill-in-the-blank rules on the worksheets;
    markdown would otherwise mangle them into emphasis.
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
    html = re.sub(r"\*\*VERIFY LOCALLY\.?\*\*|VERIFY LOCALLY",
                  '<span class="verify">VERIFY LOCALLY</span>', html)
    html = html.replace('<strong><span class="verify">VERIFY LOCALLY</span></strong>',
                        '<span class="verify">VERIFY LOCALLY</span>')

    # Each top-level section starts a new page; the first follows the cover break.
    html = html.replace("<h1>", '<h1 style="page-break-before:always">')
    html = html.replace('<h1 style="page-break-before:always">', "<h1>", 1)

    # Paragraphs holding fill-in rules must not be justified.
    html = re.sub(r"<p>((?:(?!</p>).)*?class=\"fill\"(?:(?!</p>).)*?)</p>",
                  r'<p class="noj">\1</p>', html, flags=re.S)

    return html


def build(key: str) -> None:
    src_names, out_name, title = EDITIONS[key]

    parts = []
    for name in src_names:
        src = (HERE / name).resolve()
        if not src.exists():
            sys.exit(f"Missing {src}")
        parts.append(src.read_text(encoding="utf-8"))
    raw = "\n\n".join(parts)

    body = markdown.markdown(
        preprocess(raw),
        extensions=["tables", "attr_list", "md_in_html", "sane_lists"],
        output_format="html5",
    )

    doc = (f'<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
           f"<title>{title}</title>\n</head>\n<body>\n{postprocess(body)}\n</body>\n</html>")

    out = HERE / out_name
    HTML(string=doc, base_url=str(HERE)).write_pdf(
        out, stylesheets=[CSS(filename=str(HERE / "style.css"))])
    print(f"  {out.name}  ({out.stat().st_size / 1024:.0f} KB)")


def main() -> None:
    keys = sys.argv[1:] or list(EDITIONS)
    for k in keys:
        if k not in EDITIONS:
            sys.exit(f"Unknown edition {k!r}. Choose from: {', '.join(EDITIONS)}")
    print("Building:")
    for k in keys:
        build(k)


if __name__ == "__main__":
    main()
