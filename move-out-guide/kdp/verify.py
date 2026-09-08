#!/usr/bin/env python3
"""verify.py — check every KDP upload file against Amazon's spec. Run after build_kdp.py."""
import pymupdf, zipfile, re, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from build_kdp import AUTHOR

U = pathlib.Path(__file__).parent / "upload"
SPINE_PER_PAGE = 0.002252
BOOKS = ("The-Move-Out-Blueprint", "The-Move-Out-Blueprint-Parent-Edition")

def norm(s: str) -> str:
    return re.sub(r"[\s‐­]", "", s)

ok = True
for slug in BOOKS:
    itr = pymupdf.open(U / f"{slug}-KDP-Interior.pdf")
    cov = pymupdf.open(U / f"{slug}-KDP-Cover.pdf")
    ir, cr = itr[0].rect, cov[0].rect
    iw, ih, cw, ch = ir.width/72, ir.height/72, cr.width/72, cr.height/72
    p1, p2, p3 = itr[0].get_text(), itr[1].get_text(), itr[2].get_text()
    txt = "\n".join(p.get_text() for p in itr)
    z = zipfile.ZipFile(U / f"{slug}.epub")
    epub_text = b"".join(z.read(n) for n in z.namelist() if n.endswith((".xhtml", ".opf")))
    cov_text = "".join(p.get_text() for p in cov)

    checks = {
        "author set (not placeholder)": not AUTHOR.startswith("["),
        "author on interior":    AUTHOR in txt,
        "author on print cover": AUTHOR in cov_text,
        "author in epub":        AUTHOR.encode() in epub_text,
        "no placeholder in pdf": "YOUR NAME" not in txt and "YOUR NAME" not in cov_text,
        "no placeholder in epub": b"YOUR NAME" not in epub_text,
        "interior 6x9in":        abs(iw-6) < 0.01 and abs(ih-9) < 0.01,
        "interior >=24pp":       itr.page_count >= 24,
        "cover single page":     cov.page_count == 1,
        "cover width = 12 + spine + bleed":
                                 abs(cw - (12 + itr.page_count*SPINE_PER_PAGE + 0.25)) < 0.01,
        "cover height 9.25in":   abs(ch - 9.25) < 0.01,
        "title page first":      "TheMove-OutBlueprint" in norm(p1),
        "title not hyphenated":  "Blue‐" not in p1 and "Blue-\n" not in p1,
        "copyright page second": "disclaim liability" in p2,
        "digital cover stripped":"Yourrealnumber.Yourrealdate." not in norm(p3),
        "body starts by p3":     len(p3.strip()) > 200,
        "no html leaked":        txt.count("<div") + txt.count("<span") + txt.count("markdown=") == 0,
        "no raw checkboxes":     len(re.findall(r"(?<!\w)- \[ \]", txt)) == 0,
        "epub mimetype first":   z.namelist()[0] == "mimetype",
        "epub mimetype stored":  z.getinfo("mimetype").compress_type == zipfile.ZIP_STORED,
        "epub archive intact":   z.testzip() is None,
        "epub has opf":          "OEBPS/content.opf" in z.namelist(),
    }
    bad = [k for k, v in checks.items() if not v]
    ok &= not bad
    print(f"{slug}")
    print(f"  interior {itr.page_count}pp {iw:.2f}x{ih:.2f}in | "
          f"cover {cw:.4f}x{ch:.4f}in (spine {itr.page_count*SPINE_PER_PAGE:.4f}in) | "
          f"epub {len(z.namelist())} files")
    print("  " + ("ALL PASS" if not bad else "FAIL: " + ", ".join(bad)))

print("\nOVERALL:", "PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
