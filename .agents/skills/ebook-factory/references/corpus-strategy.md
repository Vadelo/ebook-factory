# Corpus Strategy

## Permanent Research Corpora

These are local, reusable knowledge bases. They are intentionally small enough for a test use case and broad enough to demonstrate King Context retrieval.

In this skill, "local-first" means local runtime and local artifact ownership: the workflow starts as a machine-local skill/CLI process, not as a hosted server, SaaS API, or remote app. It does not prohibit open-web research.

King Context responsibilities must stay explicit:

- `king-research` is responsible for creating or refreshing permanent ebook-factory knowledge corpora and subject-matter corpora from research.
- `kctx` is responsible for listing, searching, and reading indexed corpora.
- `kctx ingest` is not the primary path for ebook-factory knowledge. Local seed files may exist as historical bootstrap material, but the production workflow should rely on `research` corpora.
- A user topic such as "ganhar dinheiro online" should normally become a topic corpus via `king-research` before outline/manuscript generation.
- When a same-named legacy `docs` corpus exists, use `kctx search ... --source research` so retrieval comes from the richer research corpus.

| Corpus | Purpose |
|---|---|
| `ebook-factory-workflow` | Turn vague ideas into editorial briefs, outlines, chapter plans, and production steps. |
| `ebook-factory-writing` | Teach through ebooks: explanations, exercises, examples, checklists, practical progression. |
| `ebook-factory-research-quality` | Evaluate sources, claims, recency, evidence, and unsafe or unsupported advice. |
| `ebook-factory-business-ethics` | Handle money/business/self-improvement ebooks without fake guarantees or manipulative claims. |
| `ebook-factory-review-qa` | Final editorial, factual, structural, and PDF-readiness checks. |
| `design-de-pdfs-para-ebooks` | Existing design corpus for typography, page structure, and visual decisions. |

The `ebook-factory` skill should not assume these corpora are committed. They are generated King Context stores. On a clean clone, the skill must check `kctx list`, create missing corpora from `assets/corpora/<corpus-name>.md`, then re-check before writing the ebook.

## Creation Commands

Run from repo root:

```powershell
.\.king-context\bin\king-research "ebook creation workflow for AI-assisted nonfiction ebooks, including editorial brief refinement, audience promise, chapter architecture, source planning, manuscript pipeline, review gates, and production handoff" --medium --yes --name ebook-factory-workflow
.\.king-context\bin\king-research "nonfiction ebook writing pedagogy for practical guides, including clear explanations, beginner progression, examples, exercises, checklists, chapter flow, cognitive load, learning outcomes, and actionable reader transformation" --medium --yes --name ebook-factory-writing
.\.king-context\bin\king-research "research quality for AI-assisted nonfiction ebooks, including source evaluation, evidence hierarchy, fact checking, citation practices, recency, claim verification, misinformation risk, safety caveats, and editorial standards" --medium --yes --name ebook-factory-research-quality
.\.king-context\bin\king-research "ethical business and marketing for nonfiction ebooks and digital products, including truthful claims, realistic expectations, consumer protection, anti-scam guidance, disclaimers, responsible monetization, persuasion ethics, and self-improvement business risks" --medium --yes --name ebook-factory-business-ethics
.\.king-context\bin\king-research "editorial review and quality assurance for AI-assisted nonfiction ebook production, including manuscript QA, structural review, fact checks, repetition control, readability, accessibility, source audit, PDF readiness, and final production checklists" --medium --yes --name ebook-factory-review-qa
.\.king-context\bin\king-research "design de PDFs para ebooks profissionais, incluindo tipografia editorial, hierarquia visual, capa, front matter, sumario, abertura de capitulos, margens de livro, CSS print, Chrome headless, acessibilidade, verificacao visual, layout premium e armadilhas comuns em PDFs gerados a partir de Markdown" --medium --yes --name design-de-pdfs-para-ebooks
```

## Retrieval Commands

```powershell
.\.king-context\bin\kctx search "ebook outline promise audience chapters" --doc ebook-factory-workflow --source research --top 4
.\.king-context\bin\kctx search "teaching practical steps exercises examples" --doc ebook-factory-writing --source research --top 4
.\.king-context\bin\kctx search "claims source quality risk fact checking" --doc ebook-factory-research-quality --source research --top 4
.\.king-context\bin\kctx search "truthful claims realistic expectations consumer protection" --doc ebook-factory-business-ethics --source research --top 4
.\.king-context\bin\kctx search "manuscript QA factual structural PDF readiness" --doc ebook-factory-review-qa --source research --top 4
.\.king-context\bin\kctx search "ebook typography layout cover print pdf design" --doc design-de-pdfs-para-ebooks --source research --top 4
```

## Topic Corpus Policy

Create a topic corpus with `king-research` when:

- the user asks for a theme not already indexed;
- the topic is current, controversial, technical, medical, legal, financial, or market-dependent;
- the ebook makes practical claims that need evidence.
- the test is demonstrating the full King Context use case, including corpus creation from a small user input.

Do not create a new topic corpus when:

- the user is testing structure only;
- the theme is already indexed with enough coverage and is not stale;
- the output is a fictional/sample ebook with no factual claims.

## Prompt Refinement For Topic Research

Before `king-research`, expand the user's phrase into a research query:

```text
<topic> for <audience>, including beginner concepts, practical steps, common mistakes,
risks, ethical constraints, examples, recent trends, and source-backed recommendations
```

For money topics:

```text
legitimate ways to make money online for beginners, including business models,
skills required, realistic expectations, risks, scams to avoid, platform trends,
legal/tax caveats, and ethical marketing
```

Use `--high` for money topics if the ebook is meant to be sold or presented as advice.
