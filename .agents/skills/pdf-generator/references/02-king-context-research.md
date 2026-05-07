# 02 — King Context Research for PDF Design

Goal: anchor every design choice in real corpus knowledge before writing CSS.

## Step 0 — check the learned shortcuts first

```bash
ls .king-context/_learned/ 2>/dev/null
```

If a previous PDF run saved shortcuts (e.g. `design-de-pdfs-para-ebooks.md`), read them. They contain the corpus paths that already proved useful.

## Step 1 — inventory the corpora

```bash
.king-context/bin/kctx list
```

Look for design/typography corpora. Common names you may find:
- `design-de-pdfs-para-ebooks`
- `tipografia-livros`
- `editorial-design`
- `print-typography`

If none exist, proceed with sensible defaults from the recipes — but flag to the user that no corpus is indexed and offer to scrape one with `king-research`:

```bash
.king-context/bin/king-research "design de PDFs para ebooks tipografia" --medium
```

## Step 2 — search by intent

| You're choosing… | Query |
|---|---|
| Body font (serif vs sans) | `kctx search "serifadas sans serif texto longo" --doc <design-corpus> --top 4` |
| Heading hierarchy | `kctx search "hierarquia tipográfica títulos" --top 4` |
| Margin sizes | `kctx search "margens espaçamento livro" --top 4` |
| Line spacing / leading | `kctx search "leading entrelinhas" --top 3` |
| Common errors | `kctx search "erros comuns layout ebook" --top 3` |
| Drop cap / capitular | `kctx search "capitular drop cap inicial" --top 3` |
| Cover design | `kctx search "capa livro design" --top 3` |
| Pull quotes / citations | `kctx search "citações pull-quote destaque" --top 3` |

Always pass `--top 3` or `--top 4` to keep tokens low. Always scope with `--doc <corpus>` when you know the corpus name.

## Step 3 — read with `--preview` first

Never read full sections blindly. Check relevance:

```bash
.king-context/bin/kctx read <doc> <section-path> --preview
```

If the preview is on-target, read fully:

```bash
.king-context/bin/kctx read <doc> <section-path>
```

If not, search again with different keywords.

## Step 4 — save what you learned

After confirming a useful section:

```markdown
# <design-corpus> — Learned Shortcuts

## <Topic>
- **<What>** → `<section-path>`
- Store: research
- Rule: <one-line synthesis>
- Gotcha: <if any non-obvious behavior>
```

Write to `.king-context/_learned/<corpus-name>.md`. Future runs (and the skill) read this first and skip re-searching.

## Decision tree for "should I research?"

```
User explicitly named a style mood?
├── Yes → research is verification only. 1–2 quick searches, then proceed.
└── No  → user wants premium/distinctive design.
        Research broader: 4–6 searches across body, headings, margins, cover.
```

If `kctx list` shows no relevant corpus AND the user wants premium design, propose:

> "Não temos um corpus indexado sobre design de PDFs. Posso rodar `king-research \"design de livros impressos\" --medium` (~3 min) antes de começar, ou seguir com defaults de tipografia clássica?"

## Token budget guidance

A full PDF design research session should fit in ~6 `kctx` calls and ~3000 tokens of corpus content. If you're spending more, you're over-researching — pick a recipe and move on.

## Transferable findings (bake into recipes when proven)

When a corpus rule appears in 2+ PDFs you build, promote it from `_learned/` into a recipe in `assets/recipes/<rule-name>.md` so it becomes reusable.
