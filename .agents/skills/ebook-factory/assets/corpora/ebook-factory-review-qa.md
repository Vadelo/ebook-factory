# Ebook Factory Review QA

## Editorial Review

Check:

- promise matches content;
- chapters are ordered logically;
- no chapter repeats the same idea without adding depth;
- examples are concrete;
- exercises are useful;
- conclusion synthesizes and moves to action.

## Factual Review

Check:

- current claims are sourced or softened;
- high-stakes advice has caveats;
- no invented statistics;
- no unsupported quotes;
- no fake authority.

## Reader Experience

Check:

- paragraphs are short enough;
- headings are scannable;
- lists are not overused;
- tone matches audience;
- the ebook feels complete at the requested length.

## PDF Readiness

Before PDF:

- markdown headings follow the contract;
- front matter exists;
- appendices have clear titles;
- long URLs are avoided in body text;
- tables are avoided unless the PDF style supports them.

After PDF:

- run `pdfinfo`;
- render previews with `pdftoppm`;
- inspect cover, title page, TOC, part opener, chapter opener, mid-chapter, conclusion, appendix, colophon;
- report limitations.
