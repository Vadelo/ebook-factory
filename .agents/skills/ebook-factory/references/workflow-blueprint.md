# Workflow Blueprint

## Local Runtime Skill-First MVP

The initial product shape is local execution: skills, `king-research`, `kctx`, markdown files, generated assets, and PDFs run from the user's machine. Avoid assuming a backend server, hosted queue, public API, or multi-user persistence layer during the first use case test.

Local execution should still use `king-research` for new user themes. The local-first boundary is about where the workflow is orchestrated and where artifacts are stored, not about skipping research.

Input:

```json
{
  "topic": "quero um ebook que ensine pessoas a ganhar dinheiro online",
  "audience": "iniciantes",
  "tone": "prático e honesto",
  "length": "medium",
  "format": "markdown + premium PDF"
}
```

Pipeline:

1. Normalize the brief.
2. Search permanent research corpora with `kctx --source research`.
3. Build or refresh the topic corpus with `king-research`.
4. Query the new topic corpus with `kctx`.
5. Generate editorial plan.
6. Write markdown.
7. Review claims and structure.
8. Choose PDF style.
9. Generate and verify PDF.

## Future App Modules

- **Brief UI**: captures theme, audience, tone, outcome, length, and constraints.
- **Research Worker**: manages locally launched `king-research` jobs that create and index topic corpora.
- **Retrieval Layer**: queries permanent research and topic corpora with traceable section paths.
- **Manuscript Worker**: produces markdown and revision drafts.
- **Review Worker**: applies safety, evidence, and quality gates.
- **PDF Worker**: calls `pdf-generator`.
- **Project Store**: tracks briefs, corpora, manuscript versions, reviews, PDFs, and previews.

## Data Objects

- `EbookProject`
- `UserBrief`
- `RefinedBrief`
- `CorpusSet`
- `EditorialPlan`
- `ManuscriptDraft`
- `ReviewReport`
- `PdfBuild`

## Demonstration Flow

For collaborators:

1. Ask for an ebook from one sentence.
2. Show the refined brief.
3. Show `kctx search` results used.
4. Show topic corpus creation or reuse.
5. Generate markdown.
6. Generate PDF.
7. Show verification artifacts.

This makes King Context visible as the knowledge layer instead of hiding it behind a generic generator.
