# 03 — HTML Structure for Books

Goal: a fixed, semantic skeleton that every PDF respects, regardless of visual style.

## Section order (front matter → body → back matter)

```
1. <section class="cover">              full-bleed, page 1
2. <section class="title-page">         recto, page-break-before
3. <section class="copyright-page">     verso of title (or next page)
4. <section class="epigraph-page">      optional, recto
5. <section class="toc">                opens TOC
6. <section class="frontmatter-section"> e.g. "Sobre este livro" (intro)
7. <section class="part">               for each Part (full-bleed, Roman numeral)
8. <section class="chapter">            for each Chapter
9. <section class="conclusion">         optional, treated as a chapter
10. <section class="appendix-divider">  full-bleed, "Apêndices"
11. <section class="chapter appendix">  for each Appendix (A, B, C, ...)
12. <section class="colophon">          full-bleed, end matter
```

Note: "full-bleed" in this structure means "no running header/footer and allowed to use the whole sheet." In CSS, reserve exact physical height (`height: 229mm`) for true bleed surfaces such as covers. Typographic dividers and colophons should usually use natural height plus vertical padding, with the sheet color supplied by `@page`.

## Required attributes

| Element | Attribute | Why |
|---|---|---|
| `.chapter` | `data-chapter-title="..."` | feeds `string-set` for running header |
| `.chapter-body > p:first-of-type` | none, but must NOT be wrapped in flex/grid | needed for `::first-letter` drop cap |

## Markdown → HTML mapping

The build script tokenizes by heading rules:

| Markdown | HTML class |
|---|---|
| `# Parte N. Title` | `<section class="part">` (with computed Roman numeral) |
| `## Capítulo N. Title` | `<section class="chapter" data-chapter-title="...">` |
| `## Conclusão. Title` | `<section class="chapter conclusion">` |
| `# Apêndices` | `<section class="appendix-divider">` |
| `## Apêndice X. Title` | `<section class="chapter appendix">` |
| `# Sobre este livro` (and similar) | `<section class="frontmatter-section">` |
| `### subsection` inside chapter | `<h3>` (styled with hairline rule) |

Anything else (paragraphs, lists, blockquotes, code) flows through `marked` unchanged.

## Chapter opener structure

```html
<section class="chapter" data-chapter-title="Por que o estoicismo voltou?">
  <header class="chapter-opening">
    <span class="chapter-eyebrow">Capítulo 1</span>
    <div class="chapter-rule"></div>
    <h2 class="chapter-title">Por que o estoicismo voltou?</h2>
  </header>
  <div class="chapter-body">
    <p>Existe uma estatística informal …</p>   <!-- first p gets drop cap -->
    <p>Outras frases …</p>
    <h3>Um mundo sem chão estável</h3>
    <p>…</p>
  </div>
</section>
```

## Part divider structure

```html
<section class="part">
  <div class="part-eyebrow">Parte 1</div>
  <div class="part-numeral">I</div>
  <div class="part-rule"></div>
  <h1 class="part-title">O Pórtico Antes do Instagram</h1>
  <p class="part-tagline">A filosofia antes do slogan — origem, escola, cosmologia.</p>
</section>
```

The Roman numeral comes from a JS array `['I','II','III',...]` indexed by part number.

The tagline is **optional** — if your book provides epigraphs per part in its markdown, use them; otherwise either omit or generate one short tagline per part as part of the build script (it's editorial, not generic — confirm with user).

## TOC structure

```html
<section class="toc">
  <h1>Sumário</h1>
  <div class="toc-rule"></div>

  <div class="toc-chapter toc-extra">
    <span class="toc-chapter-num">—</span>
    <span class="toc-chapter-title"><em>Sobre este livro</em></span>
    <span class="toc-chapter-leader"></span>
    <span class="toc-chapter-page"></span>
  </div>

  <div class="toc-part">
    <span>O Pórtico Antes do Instagram</span>
    <span class="toc-part-num">Parte I</span>
  </div>
  <div class="toc-chapter">
    <span class="toc-chapter-num">Cap. 1</span>
    <span class="toc-chapter-title">Por que o estoicismo voltou?</span>
    <span class="toc-chapter-leader"></span>
    <span class="toc-chapter-page"></span>
  </div>
  ...
</section>
```

Page numbers are intentionally left blank — Chrome headless cannot resolve cross-references. Leader dots alone read as a deliberate stylistic choice. If the user requires page numbers, the build pipeline must switch to Paged.js or WeasyPrint (see `07-build-pipeline.md` § "Alternative renderers").

## Cover structure (dark variant)

```html
<section class="cover">
  <div class="cover-frame"></div>            <!-- inset border -->
  <div class="cover-top">
    <div class="cover-mark">Filosofia • Vida Examinada</div>
    <h1 class="cover-title">Estoicismo<em>na Era Moderna</em></h1>
    <p class="cover-subtitle">Uma filosofia antiga<br/>para uma vida instável</p>
  </div>
  <div>
    <div class="cover-symbol-rule"></div>
    <div class="cover-symbol">❦</div>
    <div class="cover-symbol-rule"></div>
  </div>
  <div class="cover-bottom">
    <div class="cover-author">Bruce Tavares</div>
    <div class="cover-publisher">Edição de autor • mmxxvi</div>
  </div>
</section>
```

For a light cover, swap the dark/light variables in CSS and remove the frame border for a more minimal feel.

## Colophon

```html
<section class="colophon">
  <div class="colophon-symbol">❦</div>
  <div class="colophon-rule"></div>
  <p class="colophon-text">
    Esta edição de <strong>...</strong> foi composta nos tipos digitais ...
  </p>
</section>
```

## Why this rigidity helps

The build script is parser-driven: it reads markdown, classifies each block, and emits one of these 11 section types. Visual styles change by swapping CSS — the HTML schema stays identical. That's what makes "stoic", "academic", "modern" etc. interchangeable.
