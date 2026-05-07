# 05 — CSS for Print (the rules that actually matter in PDF)

PDF rendering is not web rendering. These are the rules that make or break a printed book.

## `@page` — the heart of print CSS

```css
@page {
  size: 152mm 229mm;             /* width × height. Use named: A4, A5, letter */
  margin: 22mm 18mm 24mm 22mm;   /* top, outer, bottom, inner (gutter) */
  background: var(--paper);       /* Chrome paints page margins only from @page */
}
@page :left {
  background: var(--paper);
  margin: 22mm 22mm 24mm 18mm;   /* mirrored — outer/inner swap */
  @bottom-left  { content: counter(page); ... }
  @top-left     { content: "Book Title"; ... }
}
@page :right {
  background: var(--paper);
  @bottom-right { content: counter(page); ... }
  @top-right    { content: string(chapter-title); ... }
}
@page :first {
  margin: 0;
  background: var(--ink);         /* match a dark full-bleed cover */
  /* clear all running headers/footers */
}
@page no-header {
  background: var(--paper);
  margin: 0;            /* CRITICAL — must be 0 for full-bleed pages */
  @top-left { content: ""; }
  @top-right { content: ""; }
  @bottom-left { content: ""; }
  @bottom-right { content: ""; }
}
```

Use `page: no-header` on every full-bleed or headerless special page (cover, title page, copyright, epigraph, parts, dividers, colophon).

Important: `html`/`body` backgrounds do **not** paint the page margin area in Chrome headless. If `@page` has no `background`, the PDF can show a colored content rectangle with white gutters around it.

## Page breaks (the source of most bugs)

**Always use `page-break-before`, never `page-break-after`** on full-page elements. Reason: when an element exactly fills a page and has `page-break-after: always`, Chrome inserts a phantom blank page after it.

```css
.chapter, .part, .title-page, .copyright-page, .colophon {
  page-break-before: always;
  break-before: page;            /* modern syntax for the same thing */
}
```

For `right` (recto-only) breaks — only if you're OK with blank verso pages between sections. In ebooks, prefer `always`.

## Headerless special pages: exact height only for true bleed

Only use physical page height (`height: 229mm`) when the element must paint a true bleed surface, such as a cover.

For typographic special pages (title page, copyright, epigraph, part dividers, appendix dividers, colophon), prefer natural-height blocks with deliberate vertical padding:

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
```

Reason: consecutive `page: no-header` sections with `height: 229mm` plus padding/borders can round over the physical page in Chrome and create blank pages after the visible content. The `@page` background keeps the remaining page area visually filled.

## Running headers via `string-set`

```css
.chapter {
  string-set: chapter-title attr(data-chapter-title);
}
@page :right {
  @top-right { content: string(chapter-title); }
}
```

The chapter sets a "string" that the right-page header reads. Each new chapter overwrites it — running header automatically updates.

## Drop caps

```css
.chapter > .chapter-body > p:first-of-type::first-letter {
  font-family: var(--display);
  font-weight: 500;
  font-size: 4.6em;
  float: left;
  line-height: 0.92;
  margin: 0.05em 0.06em -0.02em -0.02em;
}
.chapter > .chapter-body > p:first-of-type::first-line {
  font-variant: small-caps;
  letter-spacing: 0.05em;
}
.chapter > .chapter-body > p:first-of-type {
  text-indent: 0;
}
```

Requires:
- `<p>` directly under `.chapter-body` (not wrapped in flex/grid)
- First paragraph's first letter must be a real letter, not an opening quote/em-dash (else use `::first-letter` exception)
- Ample line-height — drop cap should span 3 body lines

## Justified text + hyphenation

```css
p {
  text-align: justify;
  text-indent: 1.2em;       /* classic book indent */
  hyphens: auto;
  -webkit-hyphens: auto;
  orphans: 3;
  widows: 3;
}
p + p { margin-top: 0; }    /* book-style: indent, no gap */
h1 + p, h2 + p, h3 + p, section > p:first-of-type {
  text-indent: 0;            /* first paragraph after heading */
}
```

Without `hyphens: auto`, justified text creates ugly rivers of whitespace. Always include both prefixed forms.

## Block quotes

```css
blockquote {
  margin: 1.1em 0 1.1em 1.6em;
  padding-left: 0.9em;
  border-left: 0.5pt solid var(--rule);
  font-style: italic;
  color: var(--muted);
  font-size: 0.97em;
}
blockquote p { text-align: left; text-indent: 0; }
```

Block quotes should never be justified — they're already short, and forced justification looks broken.

## Hard "do not break" rules

```css
h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
blockquote, ul, ol { page-break-inside: avoid; break-inside: avoid-page; }
```

Without these, you'll get a heading at the bottom of a page with its body on the next, or a 7-item list split 6/1 across pages.

## Heading hierarchy

```css
h2.chapter-title { font-size: 24pt; line-height: 1.18; }
h3 { font-size: 13.5pt; line-height: 1.25; margin: 1.6em 0 0.55em; }
h4 { font-size: 11pt; ... }     /* rare in book design */
```

Use a tight scale: 10.5 (body) → 13.5 (h3) → 24 (chapter title) → 38–48 (cover title). Avoid more than 4 type sizes in a single book.

## Italics + small caps for chapter labels

```css
.chapter-eyebrow {
  font-family: var(--display);
  font-style: italic;
  font-size: 11pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}
```

The label "Capítulo 1" reads as a label, not a title — italic + uppercase + letter-spacing achieves that without bold weight.

## Ornaments

```css
hr {
  border: none;
  margin: 2em auto;
  text-align: center;
  height: 0.3em;
  position: relative;
}
hr::before {
  content: "❦";          /* or *  *  *  for narrative, or — — for editorial */
  position: absolute;
  inset: 0;
  text-align: center;
  font-family: var(--display);
  font-size: 14pt;
}
```

Choose one ornament per book and stick to it.

## Color palette (B&W books)

For pure black-and-white printing:
- `--ink: #0a0a0a` (slightly off pure-black — easier on eyes, more typographic)
- `--paper: #fdfcf8` (warm off-white — feels like paper, not screen)
- `--muted: #555` (secondary text — old citations, captions)
- `--whisper: #888` (page numbers, footers — faintest hierarchy)

Pure `#000` on pure `#fff` is harsh for long reading. Soften both ends.

## Font loading via Google Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=...&display=swap');
```

Chrome headless **will** fetch these fonts, but slowly. Always pass `--virtual-time-budget=10000` to give the browser 10s to settle before printing — see `07-build-pipeline.md`.

For total reproducibility (no internet at print time), self-host the font files in `assets/fonts/` and `@font-face` from local files.

## Visual numbers worth memorizing

| What | Value |
|---|---|
| Page format (default) | 152×229 mm |
| Outer margin | 18 mm |
| Inner (gutter) margin | 22 mm |
| Top margin | 22 mm |
| Bottom margin | 24 mm |
| Body font size | 10.5 pt |
| Body line-height | 1.55 |
| Chapter title size | 24 pt |
| H3 size | 13.5 pt |
| Drop cap | 4.6 em (≈ 3 lines) |
| Page number size | 9 pt |
| Running header size | 8.5 pt |
