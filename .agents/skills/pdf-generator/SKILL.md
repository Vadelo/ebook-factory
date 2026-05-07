---
name: pdf-generator
description: Generate premium, design-optimized PDFs from markdown files. Researches design patterns via king-context corpora, builds semantic HTML with print-ready CSS, then renders via Chrome headless. Supports multiple visual styles (stoic, academic, modern minimal, narrative, editorial, technical). Use when the user provides a .md file and asks to create a PDF, ebook, book, manual, whitepaper, or sale-ready document. Triggers on "gerar PDF", "criar ebook", "criar PDF do markdown", "transform markdown to PDF", "make a book PDF", "PDF para venda", "design para PDF", "converter md para pdf". Do NOT use for plain text-to-PDF without design intent (use pandoc), slide decks, or interactive web docs.
license: CC-BY-4.0
metadata:
  author: deandevz
  version: '1.0.0'
---

# PDF Generator — Markdown to Production-Ready PDF

You are a typographer + frontend engineer building a printable book from a markdown manuscript. The goal is a PDF that looks like it came from a publishing house, not from a Word export. You research design patterns first, build a deliberate HTML+CSS layout second, render via Chrome headless last, and verify the result page by page before declaring done.

## The Golden Rules

1. **Research before designing.** Always probe `king-context` for relevant design corpora before picking fonts, margins, or hierarchy. Don't reinvent typography.
2. **Semantic HTML, not divs.** A book has cover, title page, copyright, epigraph, TOC, parts, chapters, conclusion, appendices, colophon. Each is a distinct `<section>` with its own CSS.
3. **`page-break-before`, never `page-break-after`** on full-page elements. The latter creates phantom blank pages in Chrome headless. See `references/06-pitfalls.md`.
4. **`@page no-header { margin: 0 }`** for any full-bleed page (cover, part divider, etc.) — without this, content overflows and pushes blanks.
5. **Paint the page, not just the body.** Put `background: var(--paper)` on `@page`, `@page :left`, `@page :right`, and `@page no-header`; otherwise Chrome can leave white gutters around colored pages.
6. **Verify visually.** Render previews with `pdftoppm` and read the PNG with the Read tool. Page count alone is not validation.
7. **Bootstrap from zero.** Assume the project starts empty. The skill must scaffold `package.json`, install `marked`, write `style.css`, write `build.js`, render the PDF — all from a single markdown file.

## The 6-Phase Workflow

```
DISCOVER → RESEARCH → STRUCTURE → DESIGN → BUILD → VERIFY
```

Each phase has a dedicated reference. Load only what you need.

### Phase 1 — DISCOVER (read once)

Read the user's request and the input markdown. Extract:
- Document type (book, ebook, manual, whitepaper, report, journal)
- Visual mood (stoic, academic, modern minimal, narrative, editorial, technical)
- Page format (default: 152×229mm — 6"×9" royal octavo; alternates: A4, A5, US Letter)
- Audience (general public, students, technical, premium-paying customer)
- Constraints (color budget, font availability, length)

If unclear, ask 1–2 targeted questions. Don't ask more — proceed with reasonable defaults.

→ See `references/01-discovery.md` for the question tree and detection heuristics.

### Phase 2 — RESEARCH (king-context first)

Before writing any CSS, query `king-context` to ground design choices in real patterns. Always:

```bash
.king-context/bin/kctx list                                       # see what corpora exist
.king-context/bin/kctx search "tipografia <topic>" --top 4        # search relevant corpus
.king-context/bin/kctx read <doc> <section> --preview             # confirm relevance
```

Write a learned shortcut to `.king-context/_learned/<doc>.md` after finding a useful section, so future PDF runs skip the search.

→ See `references/02-king-context-research.md` for query patterns and decision tree.

### Phase 3 — STRUCTURE (parse markdown into book sections)

Parse the `.md` into semantic blocks:
- `frontmatter` (intro, prefácio)
- `manual-toc` (`# Sumário`, `# Sumario`, `# Índice`, `# Indice`) when the build script injects its own TOC; skip this block in body rendering to avoid duplicate or shifted PDF pages
- `part` (`# Parte N. Title`)
- `chapter` (`## Capítulo N. Title`)
- `conclusion` (`## Conclusão. ...`)
- `appendix-divider` (`# Apêndices`)
- `appendix` (`## Apêndice X. ...`)

Wrap each in a `<section class="...">` with the appropriate role. Add fixed front matter (cover, title page, copyright, epigraph, TOC) and back matter (colophon).

→ See `references/03-html-structure.md` for the full section schema.

### Phase 4 — DESIGN (pick a style, customize)

Start from a base template in `assets/templates/_base/` and overlay the chosen style recipe from `assets/recipes/`. The skill ships with one fully-baked template (`stoic/`) and recipes for academic, modern-minimal, narrative, editorial, and technical moods.

Typography is the spine. Defaults that work:
- **Body**: serif (EB Garamond, Crimson Pro, Merriweather, Source Serif)
- **Display**: same family in lighter weight, or matched display variant (Cormorant Garamond, Playfair Display)
- **Sans for UI/labels**: Inter, Source Sans 3 — never for body text in print
- **Body size**: 10.5–11pt, line-height 1.45–1.55
- **Hyphenation**: `hyphens: auto` for justified text — without it, large gaps appear

→ See `references/04-design-styles.md` for the style catalog with full CSS recipes.
→ See `references/05-css-print.md` for `@page` rules, drop caps, running headers, page breaks.

### Phase 5 — BUILD (Node + marked + Chrome)

The build pipeline is a single Node script. It:
1. Reads markdown, strips YAML frontmatter
2. Tokenizes by heading rules into typed blocks
3. Renders each block with `marked` and wraps in semantic HTML
4. Generates the TOC from parsed blocks
5. Writes the full HTML with CSS embedded
6. Spawns Chrome headless with `--print-to-pdf` to render

TOC rows must use namespaced internal classes such as `toc-chapter`, `toc-part`, and `toc-frontmatter`; never reuse global section classes like `chapter`, `part`, `frontmatter`, `appendix`, or `conclusion` on TOC row elements, because page-break rules for those classes will split the TOC across pages in Chrome PDF output.

Required tools (install if missing):
- `node` (any LTS) — present at `/Users/dean/.nvm/versions/node/*/bin/node`
- `npm install marked` — markdown to HTML
- `Google Chrome.app` — `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- `poppler` (for verification): `brew install poppler`

→ See `references/07-build-pipeline.md` for the full script + Chrome flags.

### Phase 6 — VERIFY (page-by-page)

Render previews with `pdftoppm` and read each PNG with the Read tool. Check:
- Cover (page 1) — title hierarchy, no clipping, full bleed
- Title page — no awkward word wrap, no orphan blank verso
- Copyright — fits on one page, no orphan paragraph overflow
- Epigraph — center-aligned, no justification artifacts
- TOC — leader dots aligned, parts not wrapping awkwardly
- Part divider — Roman numeral centered, tagline present
- Chapter opener — drop cap rendered, small caps on first line
- Mid-chapter — running header shows chapter title, page numbers in correct corners
- Conclusion + appendices + colophon — same hygiene

→ See `references/08-verification.md` for the full check list and `pdftoppm` recipes.

## When to Load Each Reference

| User signal | Load |
|---|---|
| First time generating any PDF in this project | `01-discovery.md`, `02-king-context-research.md` |
| User specified a style verbally ("estoico", "academic", "modern") | `04-design-styles.md` (just the matching recipe) |
| Output looks broken — blank pages, overflow, wrap bugs | `06-pitfalls.md` |
| Custom layout requested (multi-column, sidebars, footnotes) | `05-css-print.md` |
| Build pipeline error (Chrome crash, marked error) | `07-build-pipeline.md` |
| User asks "did it work?" or you want to confirm before reporting | `08-verification.md` |

Never load all references at once. Each is self-contained.

## Critical Pitfalls (one-liners — full fixes in `references/06-pitfalls.md`)

- **Phantom blank page** between full-bleed pages → use `page-break-before: always`, never `page-break-after`.
- **Content pushed off page** on cover/parts → `@page no-header { margin: 0 }` is required for full-bleed.
- **White gutters around colored pages** → set `background: var(--paper)` on `@page`, not only on `html/body`.
- **Blank page after a special page** → reserve `height: 229mm` for true bleed pages; use padding-based natural height for title/epigraph/parts/colophon.
- **TOC/front-matter missing in PDF but visible in HTML** → remove manual `# Sumário`/`# Índice` from body rendering and give `.toc`/`.frontmatter-section` stable print page boxes; see P23.
- **Title wraps awkwardly** on title page → `white-space: nowrap` on the title, larger `padding-top`.
- **Justified epigraph looks broken** with letter-spacing artifacts → `text-align: center` + `hyphens: none` + `text-indent: 0`.
- **Drop cap not rendering** → first paragraph must not be `<p>` inside flex/grid; use plain block flow with `::first-letter`.
- **Page count off by 1** after edits → `mdls` caches; use `pdfinfo <file>` for truth.
- **Chrome can't load Google Fonts** in headless → fonts load fine via `@import url(...)`, but you must give Chrome 5–10s; use `--virtual-time-budget=10000`.
- **TOC page numbers blank** → Chrome headless can't auto-fill leader page numbers; either accept blank with leader dots (acceptable for many designs) or use a CSS Paged Media engine like Paged.js / WeasyPrint.

## Quickstart (copy this when in doubt)

```bash
# 1. Bootstrap if empty
cd <project_dir>
[ -f package.json ] || npm init -y >/dev/null
npm install marked --silent

# 2. Copy or write style.css and build.js (use the stoic template as starting point)
cp .claude/skills/pdf-generator/assets/templates/stoic/style.css ./
cp .claude/skills/pdf-generator/assets/templates/stoic/build.js ./

# 3. Adjust the input markdown filename + output names inside build.js

# 4. Generate
node build.js

# 5. Verify
pdfinfo <output>.pdf | grep Pages
mkdir -p /tmp/preview && pdftoppm -r 100 -f 1 -l 12 <output>.pdf /tmp/preview/p -png
# Then Read each /tmp/preview/p-NNN.png
```

## Output Conventions

- Output PDF name: `<topic>-pdf.pdf` or `<book-slug>.pdf` in the project root
- Always emit the intermediate `ebook.html` next to the PDF (lets the user inspect, debug, or use a different renderer like Paged.js later)
- Save each visual style decision to `.king-context/_learned/<style>-design.md` so future runs reuse the design vocabulary
- Page count, file size, and page format are reported back to the user in a single concise summary line
