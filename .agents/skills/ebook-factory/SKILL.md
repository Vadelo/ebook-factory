---
name: ebook-factory
description: "Use when creating a local skill-first ebook generation workflow with King Context: refine a user's ebook idea, query permanent research corpora for ebook workflow/design/quality, build or reuse a topic corpus with king-research, produce a structured markdown manuscript, and hand off to pdf-generator for premium PDF output."
---

# Ebook Factory

Build a complete ebook from a small user brief by using King Context as the knowledge layer, `king-research` as the corpus creation layer, and `pdf-generator` as the production layer.

This is a local-runtime-first use case for King Context collaborators and users: the MVP should run on the user's machine through skills, CLI commands, local files, and local indexed corpora before becoming a server/API product. "Local-first" does not mean "no web research"; it means the orchestration and artifacts stay local.

Important distinction:

- `king-research` creates or refreshes permanent knowledge corpora and topic corpora from research.
- `kctx` searches and reads corpora after they are indexed.
- This skill is an orchestrator. It should query indexed corpora and call other skills/CLIs; it should not treat local seed files as the primary knowledge base for ebook production.
- Permanent ebook-factory corpora live in the `research` store. When a same-named legacy `docs` corpus exists, query with `--source research`.
- Subject-matter corpora for a user ebook should be produced through `king-research` unless the exact topic corpus already exists and is not stale.

## Trigger Examples

- "Crie um ebook sobre ganhar dinheiro online"
- "Quero gerar um ebook completo a partir de um tema"
- "Transforma essa ideia em markdown + PDF"
- "Use King Context para criar um ebook pesquisado"
- "Monte um workflow local de geração de ebooks"

## Required Corpora

Check with:

```powershell
.\.king-context\bin\kctx list
```

Core research corpora expected for this skill:

- `ebook-factory-workflow`
- `ebook-factory-writing`
- `ebook-factory-research-quality`
- `ebook-factory-business-ethics`
- `ebook-factory-review-qa`
- `design-de-pdfs-para-ebooks`

If a core corpus is missing from the `Research` section of `kctx list`, the skill must create it with `king-research` before doing intake, outline, manuscript, or PDF work.

Bootstrap rules:

1. Run `.\.king-context\bin\kctx list`.
2. Compare the `Research` section with the required corpus names above.
3. For every missing corpus, read the matching seed file in `assets/corpora/<corpus-name>.md`.
4. Run the `Recommended creation command` from that seed file, or run the same query with:

```powershell
.\.king-context\bin\king-research "<seed research query>" --medium --yes --name "<corpus-name>"
```

5. After all missing corpora are created, run `.\.king-context\bin\kctx list` again and verify they appear under `Research`.
6. Only then continue with the ebook workflow.

Do not ask the user to manually create core corpora unless a required API key or King Context CLI command is unavailable. In that case, report the missing prerequisite and point to `.king-context/.env.example`.

See `references/corpus-strategy.md` for the full corpus policy.

## Workflow

1. **Intake**
   Extract: topic, audience, transformation, tone, length, market sensitivity, output format.

2. **Brief Refiner**
   Convert vague input into an editorial brief:
   - thesis;
   - reader pain/desire;
   - promise;
   - exclusions;
   - required disclaimers;
   - topic research query.

3. **Corpus Check**
   Query permanent corpora first:

```powershell
.\.king-context\bin\kctx search "ebook outline promise audience chapters" --doc ebook-factory-workflow --source research --top 4
.\.king-context\bin\kctx search "teaching practical steps exercises examples" --doc ebook-factory-writing --source research --top 4
.\.king-context\bin\kctx search "claims source quality risk fact checking" --doc ebook-factory-research-quality --source research --top 4
```

4. **Topic Corpus**
   For a real ebook topic, create or refresh the subject-matter corpus through `king-research`, then query it with `kctx`. Reuse an existing topic corpus only when `kctx list` shows it already exists and the topic is not stale.

```powershell
.\.king-context\bin\king-research "<refined topic query>" --medium --yes --name "<topic-slug>"
```

Use `--high` for money, health, legal, investment, or fast-changing topics.

5. **Outline**
   Produce title, subtitle, positioning, part/chapter outline, exercises, appendices, and source plan.

6. **Manuscript**
   Write markdown compatible with `pdf-generator`:
   - `# Title`
   - `## Subtitle`
   - front matter sections;
   - `# Parte N. ...`
   - `## Capítulo N. ...`
   - `# Conclusão. ...`
   - `# Apêndice A. ...`

7. **Review Gate**
   Check against `ebook-factory-review-qa` and `ebook-factory-business-ethics` with `--source research`. Fix exaggerated claims, missing caveats, repetition, weak examples, and unsafe instructions.

8. **PDF**
   Use `pdf-generator`. Always run its verify phase before reporting done.

## Read As Needed

- `references/corpus-strategy.md` — which permanent corpora exist, how to ingest them, and when to create topic corpora.
- `references/workflow-blueprint.md` — senior pipeline for the future app.
- `references/quality-gates.md` — review gates before producing PDF.
