# 04 — Design Styles Catalog

Six visual moods. Each is a recipe of fonts + palette + ornaments. The HTML schema (see `03-html-structure.md`) is identical across them — only CSS variables and a few rules change.

## How to apply a recipe

1. Start from `assets/templates/_base/style.css` (the shared skeleton — page rules, resets, sections).
2. Overlay the chosen recipe (CSS variables + style-specific overrides) on top.
3. Keep the merged file as `style.css` in the project root.

## Style 1 — Stoic (default for premium ebooks)

**Mood**: timeless, solemn, contemplative.
**Reference**: classic Penguin Classics, Everyman's Library.

```css
:root {
  --ink: #0a0a0a;
  --paper: #fdfcf8;       /* warm marfim */
  --rule: #1a1a1a;
  --muted: #555;
  --whisper: #888;
  --serif: 'EB Garamond', 'Garamond', 'Times New Roman', serif;
  --display: 'Cormorant Garamond', 'EB Garamond', serif;
  --sans: 'Inter', system-ui, sans-serif;
}
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');
```

Body 10.5pt, line-height 1.55. Drop caps in display italic. Roman numerals on parts. Ornament: `❦` (floral heart). Cover: pure black with off-white frame.

## Style 2 — Academic

**Mood**: scholarly, dense, cited.
**Reference**: Oxford monographs, university press.

```css
:root {
  --ink: #1a1a1a;
  --paper: #ffffff;
  --rule: #444;
  --muted: #555;
  --whisper: #777;
  --serif: 'Crimson Pro', 'Garamond', serif;
  --display: 'Crimson Pro', serif;
  --sans: 'Source Sans 3', system-ui, sans-serif;
  --mono: 'IBM Plex Mono', 'Courier New', monospace;
}
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
```

Body 10pt, line-height 1.45. **No drop caps**. Section numbers (1.1, 1.2) instead of just titles. Footnotes inline-styled with `.footnote { font-size: 0.85em; color: var(--muted); }`. Cover: white with thin gray rule, sans subtitle.

## Style 3 — Modern Minimal

**Mood**: contemporary, breathing, elegant.
**Reference**: Apple book, Penguin Modern.

```css
:root {
  --ink: #111;
  --paper: #fafafa;
  --rule: #ddd;
  --muted: #666;
  --whisper: #999;
  --serif: 'Source Serif 4', Georgia, serif;
  --display: 'Source Serif 4', serif;
  --sans: 'Inter', system-ui, sans-serif;
}
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Inter:wght@300;400;500;700&display=swap');
```

Sans-serif headings, serif body. Generous line-height 1.65. **No ornaments**. Numerals are arabic, not Roman. Cover: white with a single thin black rule, sans-serif title in light weight.

## Style 4 — Narrative / Literary

**Mood**: storytelling, intimate, novelistic.
**Reference**: Vintage paperbacks, Picador.

```css
:root {
  --ink: #1c1c1c;
  --paper: #f8f5ee;       /* yellower paper */
  --rule: #2a2a2a;
  --muted: #4a4a4a;
  --whisper: #888;
  --serif: 'Lora', 'Georgia', serif;
  --display: 'Playfair Display', 'Lora', serif;
  --sans: 'Lora', serif;  /* sans almost unused */
}
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&display=swap');
```

Body 11pt, line-height 1.6. **Drop cap on every chapter and major section**. Italic subtitles. Decorative scene-break: `* * *` centered. Cover: textured warm paper, italic serif title, no rules.

## Style 5 — Editorial / Magazine

**Mood**: journalistic, dynamic, photographic.
**Reference**: New Yorker, The Atlantic compilation books.

```css
:root {
  --ink: #1a1a1a;
  --paper: #ffffff;
  --rule: #1a1a1a;
  --muted: #555;
  --whisper: #888;
  --serif: 'Source Serif 4', serif;
  --display: 'Domine', 'Source Serif 4', serif;
  --sans: 'Inter', system-ui, sans-serif;
}
```

Bold display headings (700 weight). Sans eyebrow labels in CAPS with letter-spacing 0.4em. Pull-quotes large, italic, with colored background tint. Cover: bold display title set tight, photo placeholder square, byline in sans caps.

## Style 6 — Technical / Developer

**Mood**: precise, code-first, terminal-friendly.
**Reference**: O'Reilly, Pragmatic Bookshelf.

```css
:root {
  --ink: #111;
  --paper: #ffffff;
  --rule: #ccc;
  --muted: #555;
  --code-bg: #f4f4f4;
  --code-border: #e0e0e0;
  --serif: 'Source Serif 4', Georgia, serif;
  --display: 'Inter', system-ui, sans-serif;
  --sans: 'Inter', system-ui, sans-serif;
  --mono: 'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace;
}
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

**Sans display**, serif body. Code blocks with language tag in top-right corner, light gray background, hairline border, mono 9.5pt. Inline mono in `--code-bg`. No drop caps. Cover: sans bold title, square code-pattern background, version label.

## Switching styles in the build script

The build script reads a `STYLE` constant. To switch:

```js
const STYLE = 'stoic'; // or 'academic' | 'modern-minimal' | 'narrative' | 'editorial' | 'technical'
```

Then loads `assets/templates/_base/style.css` + `assets/recipes/<style>.css` and concatenates them into the output. (See `assets/recipes/` for the actual style files.)

## Do not blend styles silently

If the user asks for "stoic but with technical code blocks", confirm you understand: this is a stoic base + an additional code-block treatment. Don't mix more than 2 recipe variables without checking, or you'll lose visual coherence.
