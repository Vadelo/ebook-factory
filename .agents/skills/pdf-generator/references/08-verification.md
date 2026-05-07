# 08 — Verification

A PDF that passed the build is not a PDF that's correct. Always verify before reporting "done".

## Step 1 — sanity numbers

```bash
pdfinfo <output>.pdf | grep -E "Pages|Page size"
ls -lh <output>.pdf
```

Expected:
- 100k–500k tokens of markdown → 100–300 pages
- ~1–3 MB file size for a B&W book with Google Fonts embedded
- Page size matches `@page size` (e.g. `431.04 × 648.96 pts` for 152×229mm)

If page count is suspiciously low (<20% of expected) or file size > 50 MB, something is wrong — check for broken page-breaks or huge embedded images.

## Step 2 — render preview pages

```bash
mkdir -p /tmp/pdf-preview && rm -f /tmp/pdf-preview/*.png
pdftoppm -r 100 -f 1 -l 12 <output>.pdf /tmp/pdf-preview/p -png
```

Then read each page as an image:

```
Read /tmp/pdf-preview/p-001.png
Read /tmp/pdf-preview/p-002.png
...
```

100 DPI is enough for visual review. Higher DPI (200) only if you suspect glyph corruption.

## Step 3 — checklist (page by page)

Front matter:
- [ ] Page backgrounds fill the full sheet; no white gutters around paper-colored pages
- [ ] No blank page after title page, copyright, or epigraph
- [ ] Page 1 — cover bleeds full, no margin showing
- [ ] Page 2 — title page centered, no awkward wrap, no orphan blank
- [ ] Page 3 — copyright fits on one page
- [ ] Page 4 — epigraph centered, italic, no justification artifacts

TOC:
- [ ] Sumário heading correct, leader dots aligned
- [ ] Part labels (Parte I, II, ...) right-aligned cleanly
- [ ] Chapter rows fit width without wrapping more than 2 lines
- [ ] Front matter entry ("Sobre este livro") shows as italic with em-dash

Parts:
- [ ] The next page after each part is a chapter, not a blank overflow page
- [ ] Each part has Roman numeral centered, large
- [ ] Eyebrow "PARTE N" above
- [ ] Tagline italic below
- [ ] Page is full-bleed (no header/footer)

Chapters:
- [ ] Each chapter starts on a new page
- [ ] Eyebrow "CAPÍTULO N" small caps
- [ ] Chapter title h2 readable, not clipped
- [ ] Drop cap rendered (look for 4× height initial letter)
- [ ] First line in small caps
- [ ] Body paragraphs justified with hyphens
- [ ] H3 subsections have hairline rule above
- [ ] Running header (recto) shows chapter title
- [ ] Page numbers in outer corners

Conclusion / appendices / colophon:
- [ ] Conclusion mid-book has its eyebrow ("ENCERRAMENTO")
- [ ] Appendix divider full-bleed with "MATERIAL COMPLEMENTAR"
- [ ] Each appendix opens new page
- [ ] Colophon at the very end, centered, italic

## Step 4 — spot-check mid-book

Render 4 random middle pages:

```bash
TOTAL=$(pdfinfo <output>.pdf | awk '/^Pages/ {print $2}')
for i in 50 100 150 200; do
  if [ "$i" -le "$TOTAL" ]; then
    pdftoppm -r 100 -f $i -l $i <output>.pdf /tmp/pdf-preview/spot -png
  fi
done
```

Read each and check running header consistency, page number position, paragraph flow.

## Step 5 — text extraction (sanity)

```bash
pdftotext <output>.pdf - | wc -w
```

Should match approximately the markdown word count (`wc -w <input>.md`). Big delta = content lost or duplicated.

```bash
pdftotext <output>.pdf - | head -50
```

Top of file should be cover/title page text — easy to verify.

## Step 6 — open in Preview

The final smell test. Always at least open the PDF in macOS Preview before declaring done:

```bash
open <output>.pdf
```

Look at: cover at full size (does it actually feel premium?), the back of the book, and any chapter you customized.

## What to report to the user

A single concise summary line:

```
✓ PDF gerado: <filename>.pdf — 232 páginas, 152×229mm, 2.24 MB.
  Estilo: stoic. Capa, sumário, 8 partes, 39 capítulos, conclusão, 4 apêndices, colophon.
  Para regenerar: node build.js
```

If something didn't quite work and you couldn't fix it (e.g. TOC page numbers blank because Chrome doesn't support target-counter), state it explicitly:

```
⚠ Limitação: o sumário não tem números de página (Chrome headless não resolve target-counter).
  Aceito como característica do design (leader dots sem números são comuns em livros literários),
  ou posso trocar o renderer para Paged.js / WeasyPrint se for crítico.
```

## When to re-render

Re-render if:
- The user changed the markdown
- The user requested a style change
- The user pointed out a visual bug

Don't re-render if:
- You just want to "double-check" — Read the existing previews
- The user asked a question — answer it from existing artifacts first

Each render is ~10s of compute. Cheap, but not free.

## Diff between renders

If the user iterates on the design and you want to compare:

```bash
mv <output>.pdf <output>.v1.pdf
node build.js
# now compare:
pdfinfo <output>.v1.pdf | grep Pages
pdfinfo <output>.pdf | grep Pages
```

Or render both versions of the same page and view side by side:

```bash
pdftoppm -r 100 -f 1 -l 1 <output>.v1.pdf /tmp/pdf-preview/v1-cover -png
pdftoppm -r 100 -f 1 -l 1 <output>.pdf    /tmp/pdf-preview/v2-cover -png
```
