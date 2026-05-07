# 07 — Build Pipeline

The full Node + Chrome pipeline. Self-contained, runnable from any project root with a markdown file.

## Bootstrap (run once per project)

```bash
cd <project_dir>
[ -f package.json ] || npm init -y >/dev/null 2>&1
npm install marked --silent
which pdftoppm pdfinfo >/dev/null || brew install poppler
```

If Chrome isn't present at `/Applications/Google Chrome.app`, abort and tell the user to install it (or use the Brave fallback below).

## Build script anatomy

The build script lives in `assets/templates/_base/build.js`. Copy it to the project root and edit only:
- `MD_PATH` — input markdown
- `PDF_OUT` — output PDF
- The optional fixed front matter (cover title, author, year, epigraph) at the top

Pipeline:

```
read MD → strip YAML → split by headings → classify blocks → render via marked
       → wrap each block in semantic <section> → build TOC → assemble full HTML
       → write ebook.html → spawn Chrome headless → write PDF
```

## Chrome flags (the ones that matter)

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --no-pdf-header-footer \
  --print-to-pdf-no-header \
  --virtual-time-budget=10000 \
  --run-all-compositor-stages-before-draw \
  --print-to-pdf="$PDF_OUT" \
  "file://$HTML_PATH"
```

| Flag | Why |
|---|---|
| `--headless=new` | Modern headless mode — better fonts, layout |
| `--disable-gpu` | Avoids GPU compositing issues on macOS |
| `--no-pdf-header-footer` and `--print-to-pdf-no-header` | Strips Chrome's default URL header/page-N footer (we provide our own via `@page`) |
| `--virtual-time-budget=10000` | Waits 10s for fonts/network before printing |
| `--run-all-compositor-stages-before-draw` | Ensures full layout settles before snapshot |

Page size and margins come from `@page` in the CSS — Chrome respects them.

## Markdown classifier (key regexes)

```js
let m;
m = line.match(/^# Parte (\d+)\.\s+(.+)$/);
if (m) { start('part', { num: +m[1], title: m[2].trim() }); continue; }

m = line.match(/^## Capítulo (\d+)\.\s+(.+)$/);
if (m) { start('chapter', { num: +m[1], title: m[2].trim() }); continue; }

m = line.match(/^## Conclusão\.\s+(.+)$/);
if (m) { start('conclusion', { title: m[1].trim() }); continue; }

m = line.match(/^## Apêndice ([A-Z])\.\s+(.+)$/);
if (m) { start('appendix', { letter: m[1], title: m[2].trim() }); continue; }

if (/^# Apêndices\s*$/.test(line)) { start('appendix-divider', {}); continue; }

m = line.match(/^# (Sobre este livro|Prefácio|Introdução|Agradecimentos)\s*$/);
if (m) { start('frontmatter', { title: m[1] }); continue; }

if (cur) cur.body.push(line);   // default: append to current block
```

For non-Portuguese books, generalize the regexes:
```js
/^# Part (\d+)\.\s+(.+)$/   /^## Chapter (\d+)\.\s+(.+)$/
/^## Conclusion\.\s+(.+)$/  /^## Appendix ([A-Z])\.\s+(.+)$/
```

Or make the regexes user-configurable via the script header.

## Roman numerals

```js
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
// part numeral = ROMAN[part.num - 1] || part.num
```

For books with more than 12 parts (rare), generate dynamically:
```js
function toRoman(n) {
  const map = [['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]];
  return map.reduce((acc, [s, v]) => { while (n >= v) { acc += s; n -= v; } return acc; }, '');
}
```

## TOC generation

After classifying all blocks, walk them in order:
- `part` opens a part group
- subsequent `chapter` blocks attach to that group
- `conclusion`, `appendix` are top-level entries
- `frontmatter` shows as italic light entry above first part

Don't render page numbers — Chrome can't fill them. Use leader dots only.

## Image handling

If the markdown contains `![alt](./figures/x.png)`:

```js
// Resolve relative paths to absolute paths so Chrome finds them
const html = renderBlock(b.body.join('\n'))
  .replace(/src="\.\//g, `src="${path.dirname(MD_PATH)}/`);
```

If images are remote URLs, no rewrite needed — Chrome loads them naturally (give `--virtual-time-budget=10000`).

## Code block styling

For technical books, post-process `<pre><code>` to add a language tag corner:

```js
html = html.replace(/<pre><code class="language-(\w+)">/g,
  '<pre data-lang="$1"><code class="language-$1">');
```

Then in CSS:
```css
pre {
  position: relative;
  background: var(--code-bg);
  border: 0.4pt solid var(--code-border);
  padding: 0.8em 1em;
  font-family: var(--mono);
  font-size: 9.5pt;
}
pre::after {
  content: attr(data-lang);
  position: absolute;
  top: 0.3em; right: 0.6em;
  font-size: 8pt;
  color: var(--whisper);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

## Alternative renderers (when Chrome isn't enough)

If you need TOC page numbers, advanced page-break control, footnotes with target-counter, or proper widow/orphan handling:

| Renderer | Pros | Install |
|---|---|---|
| **Paged.js** | Pure JS, runs in headless Chrome with polyfill | `npm install pagedjs` then load `<script src="node_modules/pagedjs/dist/paged.polyfill.js"></script>` in HTML |
| **WeasyPrint** | Python, excellent CSS Paged Media support | `brew install weasyprint`, then `weasyprint ebook.html out.pdf` |
| **Prince XML** | Best-in-class, commercial | https://princexml.com (free for non-commercial) |

The skill defaults to plain Chrome because it's zero-install on macOS. Switch if the user requests proper TOC numbering.

## Brave / Edge fallback

If Chrome isn't installed, use Brave or Edge — same `--print-to-pdf` flag works:

```bash
"/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"   # Brave
"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" # Edge
```

Detect at script start:
```js
const candidates = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
];
const CHROME = candidates.find(p => fs.existsSync(p));
if (!CHROME) throw new Error('No Chromium-based browser found. Install Google Chrome.');
```

## Performance numbers

For a 232-page stoic book on M1 MacBook:
- Parse + write HTML: ~150ms
- Chrome PDF render: ~6–10s (with `--virtual-time-budget=10000`)
- Total wall clock: ~8s

If render is slow (>30s), check:
- `@import url(...)` is fetching too many fonts → trim weights
- Markdown contains huge tables → consider splitting
- High image count without dimensions specified → add `width`/`height` attrs
