# Assets — Templates and Recipes

## How they fit together

```
_base/                    Universal skeleton (CSS + build.js)
  style.css               Page rules, sections, reset, structural CSS
  build.js                Markdown parser + Chrome PDF renderer
recipes/                  Style overlays (CSS variable + minor overrides)
  stoic.css
  academic.css
  modern-minimal.css
  narrative.css
  editorial.css
  technical.css
templates/                Fully-baked working examples
  stoic/                  Reference implementation (CSS + JS already merged)
```

## Building a PDF

Two approaches:

### A. Quick — copy a fully-baked template

```bash
cp .claude/skills/pdf-generator/assets/templates/stoic/style.css ./style.css
cp .claude/skills/pdf-generator/assets/templates/stoic/build.js  ./build.js
# Adjust MD_PATH and PDF_OUT in build.js, then:
node build.js
```

Use this when the user asked for the stoic style and you don't need to modify visuals.

### B. Compose — base + recipe

```bash
cat .claude/skills/pdf-generator/assets/templates/_base/style.css \
    .claude/skills/pdf-generator/assets/recipes/<style>.css > ./style.css
cp .claude/skills/pdf-generator/assets/templates/_base/build.js  ./build.js
node build.js
```

Use this for academic, modern-minimal, narrative, editorial, technical, or any custom mood.

The recipes only set CSS variables and a few overrides — the structural CSS in `_base/style.css` already implements the section schema. The cascade order matters: base first, recipe second.

When a recipe changes `--paper`, it also changes the PDF page background because `_base/style.css` paints `@page` with `var(--paper)`. Keep that behavior intact; coloring only `html`, `body`, or a section leaves white gutters in Chrome headless.

Avoid exact physical heights on typographic special pages in recipes. `height: 229mm` is reserved for true bleed surfaces such as covers. Title pages, epigraphs, part dividers, appendix dividers, and colophons should use natural height plus vertical padding so Chrome does not create blank overflow pages.

## Customizing the cover/title page content

Open `build.js` and edit the constants at the top:
- `BOOK_TITLE`, `BOOK_SUBTITLE`, `AUTHOR`, `YEAR`
- The cover ornament character (e.g. `❦`, `*`, `—`)
- The epigraph quote and attribution
- The colophon paragraph

These are HTML strings; change them as you would any text.

## Adding a new recipe

1. Copy `recipes/stoic.css` to `recipes/<new-name>.css`
2. Adjust the `:root` variables (palette, fonts)
3. Add any overrides for chapter title weight, drop cap, ornaments
4. Document the recipe in `references/04-design-styles.md` with mood, references, and trade-offs
