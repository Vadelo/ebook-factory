# Ebook Factory with King Context

This is a simple use case: install King Context, open Codex in this project, and ask for an ebook.

The `ebook-factory` skill does the rest:

- creates the required corpora if they do not exist yet;
- researches the topic with `king-research`;
- queries indexed knowledge with `kctx`;
- writes the manuscript in Markdown;
- hands it off to `pdf-generator`;
- generates HTML and PDF.

## Installation

From the project root:

```powershell
npx @king-context/cli init
npm install
```

Copy the environment template:

```powershell
Copy-Item .king-context\.env.example .king-context\.env
```

Fill `.king-context/.env` with your keys:

```text
EXA_API_KEY=
OPENROUTER_API_KEY=
JINA_API_KEY=
FIRECRAWL_API_KEY=
```

For this use case, the main keys are `EXA_API_KEY` and `OPENROUTER_API_KEY`, used by `king-research`.

## Usage

Open Codex in this repository and ask:

```text
use ebook-factory to create an ebook about the evolution of AI from its earliest beginnings to the current moment in 2026
```

Or change the topic:

```text
use ebook-factory to create an ebook about productivity for freelance programmers
```

```text
use ebook-factory to create an ebook about Brazilian recipes to sell in Paraguay
```

```text
use ebook-factory to create an ebook about Stoicism applied to modern life
```

That is it. The point of this example is to show how King Context becomes the local knowledge layer while the skill runs the whole ebook workflow.

## What Happens Under The Hood

When you call `ebook-factory`, the skill:

1. checks whether the required `ebook-factory-*` corpora exist;
2. creates any missing corpora automatically with `king-research`;
3. turns your request into an editorial brief;
4. creates or reuses a research corpus for the ebook topic;
5. queries the corpora with `kctx`;
6. writes the Markdown manuscript;
7. reviews structure, claims, ethics, and quality;
8. generates the PDF with `pdf-generator`.

The required corpora are not committed. They are generated locally on the first run.

## Included Example

This repository includes an already generated example:

```text
output/evolucao-da-ia-ate-2026.md
output/evolucao-da-ia-ate-2026.html
output/evolucao-da-ia-ate-2026.pdf
output/build-evolucao-ia-2026.js
```

You can keep these files in the repository to show the final result, or remove them if you want the cookbook example to be fully regenerated from scratch.

To rebuild the example PDF:

```powershell
npm run build:example
```

To check the scripts:

```powershell
npm run check:scripts
```

On Windows, if PowerShell blocks `npm.ps1`, use:

```powershell
npm.cmd run check:scripts
```

## Structure

```text
.agents/skills/
  ebook-factory/
  king-context/
  king-research/
  pdf-generator/

.king-context/
  bin/
  .env.example

output/
  generated example
```

## Before Publishing

Do not commit:

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

These paths are already listed in `.gitignore`.

## Maintainer Note

The prompts that recreate the required corpora live in:

```text
.agents/skills/ebook-factory/assets/corpora/
```

The rule lives in:

```text
.agents/skills/ebook-factory/SKILL.md
```

If the required corpora do not exist, the skill must create them before writing any ebook.
