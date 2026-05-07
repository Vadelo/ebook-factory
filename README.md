# King Context Ebook Factory Use Case

Cookbook-ready example of using King Context to create researched ebooks with local Codex skills.

The use case combines:

- `ebook-factory`: orchestrates the ebook workflow.
- `king-context`: searches local indexed corpora with `kctx`.
- `king-research`: builds reusable research corpora.
- `pdf-generator`: renders a polished PDF from Markdown.

The current example topic is:

> A evolucao da IA desde seus primordios ate o momento atual de 2026.

## What This Repo Contains

```text
.agents/skills/
  ebook-factory/      # ebook orchestration skill
  king-context/       # kctx search/read skill
  king-research/      # topic corpus creation skill
  pdf-generator/      # Markdown -> HTML/PDF skill

.king-context/
  bin/                # thin Windows wrappers for kctx / king-research / king-scrape
  .env.example        # API key template, no secrets

output/
  build-evolucao-ia-2026.js
  evolucao-da-ia-ate-2026.md
  evolucao-da-ia-ate-2026.html
  evolucao-da-ia-ate-2026.pdf
```

The `output/` files are only an example artifact. They can be removed before publishing if the cookbook should demonstrate full regeneration from scratch.

Generated stores and local runtimes are intentionally ignored:

- `.king-context/core/`
- `.king-context/research/`
- `.king-context/docs/`
- `.king-context/data/`
- `.king-context/_temp/`
- `.king-context/_learned/`
- `node_modules/`
- `.pdfdeps/`

## Prerequisites

- Node.js and npm.
- Google Chrome, used by `pdf-generator` to render PDFs.
- A Codex/Codex-like environment that can load local skills from `.agents/skills`.
- API keys for research corpus creation:
  - `EXA_API_KEY`
  - `OPENROUTER_API_KEY`
  - optional `JINA_API_KEY`
  - optional `FIRECRAWL_API_KEY` if you also scrape docs with `king-scrape`

## 1. Install King Context

From the repository root:

```powershell
npx @king-context/cli init
```

This initializes the King Context runtime for the project.

This repo also includes thin wrappers in `.king-context/bin/`:

- `.\.king-context\bin\kctx`
- `.\.king-context\bin\king-research`
- `.\.king-context\bin\king-scrape`

The wrappers first try `.king-context/core/venv/Scripts/*.exe`. If that local runtime is not present, they fall back to commands available on `PATH`.

Verify:

```powershell
.\.king-context\bin\kctx list
```

On a clean clone, it is fine if no corpora exist yet.

## 2. Configure API Keys

Copy the example env file:

```powershell
Copy-Item .king-context\.env.example .king-context\.env
```

Fill in:

```text
EXA_API_KEY=
OPENROUTER_API_KEY=
JINA_API_KEY=
FIRECRAWL_API_KEY=
```

Do not commit `.king-context/.env`.

## 3. Install Node Dependencies

```powershell
npm install
```

The PDF build script uses `marked`.

## 4. How The Ebook Factory Bootstraps Itself

The `ebook-factory` skill requires permanent research corpora for editorial workflow, writing, quality, ethics, review, and PDF design.

Required corpora:

- `ebook-factory-workflow`
- `ebook-factory-writing`
- `ebook-factory-research-quality`
- `ebook-factory-business-ethics`
- `ebook-factory-review-qa`
- `design-de-pdfs-para-ebooks`

On a clean clone, these corpora are not committed. That is intentional.

The skill now follows this rule:

1. Run `.\.king-context\bin\kctx list`.
2. Check whether the required corpora exist under `Research`.
3. For each missing corpus, read the seed prompt in:

```text
.agents/skills/ebook-factory/assets/corpora/
```

4. Create the missing corpus with `king-research`.
5. Re-run `kctx list`.
6. Continue only after the core corpora exist.

Manual example:

```powershell
.\.king-context\bin\king-research "ebook creation workflow for AI-assisted nonfiction ebooks, including editorial brief refinement, audience promise, chapter architecture, source planning, manuscript pipeline, review gates, and production handoff" --medium --yes --name ebook-factory-workflow
```

In normal use, you should let the `ebook-factory` skill perform this bootstrap.

## 5. Create A New Ebook With The Skill

Ask Codex to use the skill:

```text
use ebook-factory para criar um ebook que fale sobre a evolução da I.A desde seus primórdios até o momento atual de 2026
```

The skill workflow is:

1. Intake: extract topic, audience, tone, length, output format, and sensitivity.
2. Brief refiner: turn the prompt into an editorial brief.
3. Core corpus check: create missing `ebook-factory-*` corpora first.
4. Editorial research: query workflow, writing, research-quality, review, ethics, and design corpora.
5. Topic corpus: create or reuse a topic corpus with `king-research`.
6. Outline: create title, subtitle, parts, chapters, appendices, and source plan.
7. Manuscript: write Markdown compatible with `pdf-generator`.
8. Review gate: check factual claims, repetition, unsafe claims, caveats, and structure.
9. PDF handoff: render HTML/PDF and verify the output.

## 6. Create The Topic Corpus Manually

For the included AI example:

```powershell
.\.king-context\bin\king-research "evolution of artificial intelligence from early symbolic AI to generative AI agents and multimodal models, including key milestones, AI winters, machine learning, deep learning, transformers, ChatGPT, regulation, industry adoption, safety, open models, and developments through 2026" --medium --yes --name evolucao-ia-2026-ebook
```

Verify:

```powershell
.\.king-context\bin\kctx list
.\.king-context\bin\kctx search "transformers generative AI 2026" --doc evolucao-ia-2026-ebook --source research --top 5
```

For sensitive, fast-changing, legal, medical, financial, or money-making topics, use `--high` instead of `--medium`.

## 7. Expected Markdown Structure

The manuscript should use this shape:

```markdown
# Title

## Subtitle

# Nota editorial

# Parte 1. ...

## Capitulo 1. ...

# Conclusao. ...

# Apendice A. ...
```

Do not rely on a manual `# Sumario` for PDF navigation. The PDF generator creates a semantic TOC automatically. If a manual `# Sumario` exists, the build script should treat it as `manual-toc` and skip it in body rendering.

## 8. Render The Included Example PDF

If you keep the included example files:

```powershell
npm run build:example
```

Outputs:

- `output/evolucao-da-ia-ate-2026.html`
- `output/evolucao-da-ia-ate-2026.pdf`

Validate scripts:

```powershell
npm run check:scripts
```

Optional PDF text check, if `pypdf` is installed:

```powershell
python -c "from pypdf import PdfReader; r=PdfReader('output/evolucao-da-ia-ate-2026.pdf'); print(len(r.pages)); print(r.pages[3].extract_text()[:300]); print(r.pages[4].extract_text()[:300])"
```

The fixed example should have page 4 as the TOC and page 5 as the editorial note.

## 9. Publishing Checklist

Before pushing to a public cookbook repo:

```powershell
npm run check:scripts
```

Confirm these are absent:

```text
.king-context/.env
.king-context/core/
.king-context/research/
.king-context/docs/
.king-context/data/
.king-context/_temp/
.king-context/_learned/
node_modules/
.pdfdeps/
output/.chrome*/
output/previews*/
```

The example outputs may stay if you want the cookbook reader to inspect the final result immediately:

```text
output/evolucao-da-ia-ate-2026.md
output/evolucao-da-ia-ate-2026.html
output/evolucao-da-ia-ate-2026.pdf
output/build-evolucao-ia-2026.js
```

If you want the repo to be fully generative, remove the example outputs and keep only the instructions.

## 10. Important Implementation Notes

- Core corpora are generated, not committed.
- Seed prompts live in `.agents/skills/ebook-factory/assets/corpora/`.
- The `pdf-generator` templates guard against TOC pagination bugs by namespacing TOC row classes (`toc-chapter`, `toc-part`, etc.).
- Avoid using global section classes like `chapter`, `part`, or `frontmatter` inside internal TOC rows, because print CSS may apply page breaks to them.
- Use `page-break-before` / `break-before`, not `page-break-after`, for PDF sections.
