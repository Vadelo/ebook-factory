# 06 — Pitfalls (the bugs the skill author already paid for)

Each entry: **symptom → cause → fix**. Read this before debugging — it'll save you hours.

## P1 — Blank phantom page between sections

**Symptom**: between two full-bleed pages (e.g. cover and title page) there's an unexpected blank page.

**Cause**: a full-page element with `page-break-after: always` triggers Chrome to insert an extra blank, because the content already filled the page.

**Fix**: never use `page-break-after: always` on full-page elements. Use `page-break-before: always` on the *next* element instead.

```css
/* wrong */
.cover         { page-break-after: always; }
.title-page    { /* no rule, follows cover */ }

/* right */
.cover         { /* no break rule */ }
.title-page    { page-break-before: always; }
```

## P2 — Cover/part content overflows onto a second page

**Symptom**: cover or part-divider content appears split — title at end of page 1, author at start of page 2.

**Cause**: `@page` has default margins (set in your top-level `@page {}` block), and `min-height: 220mm` (or similar) pushes content area below the fold.

**Fix**: declare `@page no-header { margin: 0; ... }` and apply `page: no-header` to all full-bleed sections. Use `height: 229mm` only on true bleed surfaces such as covers. For typographic special pages, use natural height plus deliberate vertical padding; see P22.

```css
@page no-header {
  margin: 0;        /* MUST be 0 */
  @top-left { content: ""; }
  @top-right { content: ""; }
  @bottom-left { content: ""; }
  @bottom-right { content: ""; }
}
.cover, .title-page, .part, .colophon {
  page: no-header;
  /* height: 229mm only for true bleed surfaces; otherwise use padding */
}
```

## P3 — Title wraps awkwardly: "Estoicismo / na Era / Moderna"

**Symptom**: a title splits across 3 lines because the container is narrower than expected.

**Cause**: the title page is using `display: flex; align-items: center;` which constrains intrinsic width.

**Fix**: switch to `display: block` with explicit padding. Add `white-space: nowrap` to the title element if you want a forced single line. If wrapping is OK, give the line-break a deliberate `<br/>` in the HTML rather than letting CSS guess.

```html
<h1 class="title-page-title">Estoicismo<br/>na Era Moderna</h1>
```

## P4 — Justified epigraph with letter-spacing artifacts

**Symptom**: epigraph quote like `"N ã o   n o s   p e r t u r b a m"` — letters are spaced absurdly far apart.

**Cause**: `text-align: justify` is inherited from `<p>` defaults, and the short quote has too few words to distribute, so each letter gets its own space.

**Fix**: explicitly center-align epigraph content and disable hyphenation:

```css
.epigraph-quote {
  text-align: center;
  text-indent: 0;
  hyphens: none;
  -webkit-hyphens: none;
  max-width: 100mm;
  margin: 0 auto;
}
.epigraph-attr {
  text-align: center;
  white-space: nowrap;   /* keeps "— EPICTETO, ENQUIRÍDIO, V" on one line */
}
```

## P5 — Drop cap doesn't render

**Symptom**: first paragraph of chapter looks like body text — no oversized initial.

**Cause**: one of:
1. The first paragraph is wrapped in flex/grid (drop cap requires block flow with float).
2. The first paragraph has `text-indent: 1.2em` — drop cap floats over the indent space.
3. The first character is a quotation mark (`::first-letter` picks the quote, not the letter).

**Fix**:
```css
.chapter > .chapter-body > p:first-of-type {
  text-indent: 0;
}
.chapter > .chapter-body > p:first-of-type::first-letter {
  float: left;
  font-size: 4.6em;
  ...
}
```
And inspect the markdown — if the first paragraph starts with `"`, ask the user to rephrase or strip it programmatically.

## P6 — Chapters bleed into each other (no page break)

**Symptom**: "Chapter 2" starts at the bottom of "Chapter 1"'s last page.

**Cause**: `.chapter` lacks `page-break-before` rule.

**Fix**:
```css
.chapter {
  page-break-before: always;
  break-before: page;
}
```

## P7 — Running header shows the wrong chapter

**Symptom**: page 50 has running header "Chapter 1" even though it's deep inside Chapter 3.

**Cause**: the `string-set` directive is missing or applied at the wrong selector.

**Fix**:
```css
.chapter { string-set: chapter-title attr(data-chapter-title); }
@page :right { @top-right { content: string(chapter-title); } }
```
And every `.chapter` element must have `data-chapter-title="..."` — set this from the build script.

## P8 — Page count "off by one" after edits

**Symptom**: you edit the CSS, regenerate, but `mdls` still shows the old page count.

**Cause**: macOS Spotlight metadata is cached.

**Fix**: use `pdfinfo <file> | grep Pages` for accurate count. Never trust `mdls` after a rebuild.

## P9 — Chrome can't load Google Fonts

**Symptom**: font fallback (Times New Roman) appears in the PDF instead of EB Garamond.

**Cause**: Chrome headless prints before font fetch completes.

**Fix**: pass `--virtual-time-budget=10000` so Chrome waits up to 10s for network resources before printing:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu \
  --virtual-time-budget=10000 \
  --run-all-compositor-stages-before-draw \
  --print-to-pdf-no-header \
  --print-to-pdf=output.pdf \
  file:///path/to/ebook.html
```

For air-gapped/reproducible builds, self-host fonts in `assets/fonts/` and use `@font-face` with local file URIs.

## P10 — TOC page numbers blank

**Symptom**: TOC shows leader dots but no page numbers.

**Cause**: Chrome headless does not implement CSS Paged Media's `target-counter()` for cross-references.

**Fix**: two paths:
- **Accept blank**: leader dots without numbers read as a deliberate stylistic choice — common in literary/premium books. For most ebooks, this is fine.
- **Switch renderer**: install Paged.js (`npm install pagedjs`) or WeasyPrint (Python) — both implement target-counter properly. See `07-build-pipeline.md` § "Alternative renderers".

## P11 — Build fails with "Cannot find module 'marked'"

**Symptom**: Node throws on `require('marked')`.

**Fix**: bootstrap dependency:
```bash
[ -f package.json ] || npm init -y >/dev/null
npm install marked --silent
```

## P12 — Section before TOC shows in book body, not front matter

**Symptom**: "Sobre este livro" appears between Chapter 5 and Chapter 6.

**Cause**: parser missed the heading rule. `# Sobre este livro` looked like an `H1` not matching `# Parte N. ...`, so it fell through to the default branch.

**Fix**: in the build script, match by exact title set:
```js
m = line.match(/^# (Sobre este livro|Prefácio|Introdução|Agradecimentos)\s*$/);
if (m) { start('frontmatter', { title: m[1] }); continue; }
```

## P13 — Apêndice content concatenated under previous appendix

**Symptom**: Appendix B text appears under Appendix A's heading.

**Cause**: parser reset rule for `## Apêndice X.` is missing or wrong regex.

**Fix**:
```js
m = line.match(/^## Apêndice ([A-Z])\.\s+(.+)$/);
if (m) { start('appendix', { letter: m[1], title: m[2].trim() }); continue; }
```

## P14 — Image paths break in HTML output

**Symptom**: `<img src="./figures/fig1.png">` renders as broken icon in PDF.

**Cause**: Chrome resolves paths relative to the HTML file location. If `ebook.html` is in project root and the image path is relative to the markdown source, paths may not match.

**Fix**: rewrite image paths in the build script:
```js
const html = renderBlock(b.body.join('\n'))
  .replace(/src="\.\//g, `src="${path.dirname(MD_PATH)}/`);
```
Or copy images alongside the HTML and use relative paths consistently.

## P15 — `\newpage` LaTeX directive bleeds into HTML

**Symptom**: literal `\newpage` text appears in the PDF.

**Cause**: the markdown was authored with Pandoc-style hard breaks, and the build script didn't strip them.

**Fix**:
```js
raw = raw.replace(/\\newpage/g, '');   // we use CSS page-break instead
```

## P16 — YAML frontmatter shows up at top of PDF

**Symptom**: literal `---\ntitle: ...\n---` block at top of cover page.

**Cause**: the build script forgot to strip the YAML preamble.

**Fix**:
```js
raw = raw.replace(/^---[\s\S]*?---\s*/, '');
```

## P17 — Running header appears on cover/parts/colophon

**Symptom**: cover page shows "ESTOICISMO NA ERA MODERNA" and a page number, ruining the design.

**Cause**: the `@page` running header rules apply globally; full-bleed pages inherited them.

**Fix**: tag those sections with `page: no-header` and clear the rules in `@page no-header { ... }`.

## P18 — `mdls` says 245 pages but `pdfinfo` says 232

**Symptom**: page count discrepancy.

**Cause**: Same as P8 — `mdls` cached. Trust `pdfinfo`.

## P19 — Browser preview looks great but PDF looks broken

**Symptom**: opening `ebook.html` in Chrome looks perfect; the PDF has clipped content / wrong margins.

**Cause**: the screen `@media screen { ... }` block applies different styles than `@media print` (which is what `--print-to-pdf` uses).

**Fix**: keep the screen styles inside `@media screen { ... }` and **never** put critical print styles inside it. Also test with Chrome's File → Print preview, which simulates `@media print`.

## P20 — Gigantic file size (10+ MB)

**Symptom**: PDF balloons even though the markdown is text-only.

**Cause**: Google Fonts are embedded as full font files for every weight you imported, even if you only use 2 weights.

**Fix**: import only the weights you use (e.g. `@import url('...?family=EB+Garamond:wght@400;500&display=swap')` — drop the italic and 600/700 if unused). For our 232-page stoic book, the file should be ~2 MB.
 
## P21 - White gutters around colored pages

**Symptom**: page content has the intended paper/color background, but the outer margins and side gutters remain white in the PDF.

**Cause**: Chrome headless paints `html` and `body` backgrounds only inside the page content box. The page margin area belongs to `@page`, so it remains white unless `@page` also defines a background.

**Fix**: set the paper background on every relevant page rule:

```css
@page {
  size: 152mm 229mm;
  margin: 22mm 18mm 24mm 22mm;
  background: var(--paper);
}
@page :left { background: var(--paper); }
@page :right { background: var(--paper); }
@page no-header {
  margin: 0;
  background: var(--paper);
}
```

If a recipe changes `--paper`, make sure it is loaded after the base CSS so the page background resolves to the recipe color.

For dark full-bleed covers, also override `@page :first` to the cover color. Otherwise the cover section may render correctly while tiny rounding gaps on the first sheet show the paper color:

```css
@page :first {
  margin: 0;
  background: var(--ink); /* or the recipe's cover color */
  @top-left { content: ""; }
  @top-right { content: ""; }
  @bottom-left { content: ""; }
  @bottom-right { content: ""; }
}
```

If raster previews still show a 1-2 mm light line on the top or left edge of the cover, add a non-layout overscan:

```css
.cover {
  box-shadow: 0 0 0 3mm var(--ink); /* or the recipe's cover color */
}
```

Use `box-shadow` for this, not a larger `height` or negative margins; changing the cover box size can create overflow pages.

## P22 - Blank page after title, copyright, epigraph, part divider, or appendix divider

**Symptom**: a special page looks correct, but the following PDF page is blank or contains only the bottom of the previous background.

**Cause**: consecutive `page: no-header` sections with `height: 229mm` can round slightly taller than the physical page once padding, borders, fonts, or shadows are applied. Chrome then pushes the overflow or the next break onto a new blank page.

**Fix**: reserve exact physical height for true bleed pages only, usually the cover. For typographic special pages, use natural height with enough vertical padding and let the `@page` background fill the rest:

```css
.title-page,
.copyright-page,
.epigraph-page,
.part,
.appendix-divider,
.colophon {
  page: no-header;
  page-break-before: always;
  break-before: page;
  display: block;
  padding: 72mm 24mm 66mm;
  overflow: hidden;
}

.cover {
  page: no-header;
  height: 229mm;
  overflow: hidden;
}
```

Never fix this by adding `page-break-after: always`; that reintroduces P1.

## P23 - TOC or editorial note appears in HTML but disappears or shifts in PDF

**Symptom**: the browser HTML shows the generated table of contents or a front-matter page such as "Nota editorial", but the PDF skips it, shows a blank page in that position, or moves it away from the expected page.

**Cause**: usually one of these:
1. The manuscript contains a manual `# Sumário`, `# Sumario`, `# Índice`, or `# Indice` while the build script also injects an automatic `<section class="toc">`.
2. Front-matter sections are not parsed semantically, so Chrome paginates them as ordinary body chapters.
3. `.toc` or `.frontmatter-section` relies only on screen preview layout or old `page-break-before` without `break-before`, `display:block`, and overflow control.
4. TOC rows reuse global semantic classes such as `chapter`, `frontmatter`, `part`, `appendix`, or `conclusion`. If the stylesheet has rules like `.chapter { page-break-before: always; }`, every TOC row with that class becomes a page break in Chrome PDF output.

**Fix**: keep exactly one TOC in the rendered HTML. If the build script generates the TOC, parse manuscript TOC headings as `manual-toc` and skip them in body rendering. Treat common front-matter headings explicitly and give them a stable page box:

```js
m = line.match(/^# (Sumário|Sumario|Índice|Indice)\s*$/);
if (m) { start('manual-toc', { title: m[1] }); continue; }

m = line.match(/^# (Sobre este livro|Nota editorial|Prefácio|Prefacio|Introdução|Introducao|Agradecimentos)\s*$/);
if (m) { start('frontmatter', { title: m[1] }); continue; }
```

```css
.toc,
.frontmatter-section {
  page-break-before: always;
  break-before: page;
  display: block;
  min-height: 170mm;
  overflow: hidden;
}
```

Namespace internal TOC classes and scope page-break rules to sections:

```html
<!-- wrong: collides with .chapter and .frontmatter page-break rules -->
<div class="toc-row chapter">...</div>

<!-- right -->
<div class="toc-row toc-chapter">...</div>
```

```css
section.chapter,
section.frontmatter-section {
  page-break-before: always;
  break-before: page;
}
```

Verify by rasterizing the affected pages, not only by opening the HTML preview.
