# Ebook Factory Workflow

## From Idea To Brief

A strong ebook starts with a transformation, not a topic. Convert "an ebook about X" into: who the reader is, what they want, what blocks them, what the ebook helps them do, and what is outside scope.

Use this brief shape:

- Topic
- Audience
- Starting point
- Desired outcome
- Promise
- Constraints
- Risks
- Tone
- Length

## Research Handoff

After the brief is refined, convert the topic into a `king-research` query before writing a factual outline. The topic corpus should contain the market, audience problems, practical methods, risks, examples, and source-backed constraints. After the corpus is created and indexed, use `kctx search` and `kctx read` to ground the outline and manuscript.

## Editorial Promise

The promise should be concrete, honest, and testable. Avoid "everything about" and prefer "a practical guide to achieve X without Y." For sensitive domains, add boundaries: educational, not medical/legal/financial advice.

## Outline Pattern

Use this structure for practical nonfiction:

1. Orientation: what the reader is trying to solve.
2. Foundations: terms, mental models, context.
3. Framework: the method or decision system.
4. Application: step-by-step execution.
5. Mistakes and risks.
6. Case examples.
7. Action plan.
8. Appendices: checklist, glossary, resources.

## Chapter Job

Every chapter needs one job:

- explain a concept;
- change a belief;
- teach a process;
- help decide;
- provide practice;
- prevent a mistake.

If a chapter has no job, merge or delete it.

## Markdown Contract

Use semantic markdown compatible with `pdf-generator`:

- `# Title`
- `## Subtitle`
- `## Introducao`
- `# Parte N. Title`
- `## Capitulo N. Title`
- `# Conclusao. Title`
- `# Apendice A. Title`

Prefer short paragraphs, clear exercises, and explicit section headings.
