# Ebook Factory com King Context

Este e um use case simples: instale o King Context, abra o Codex neste projeto e peca um ebook.

A skill `ebook-factory` faz o resto:

- cria os corpora essenciais se eles ainda nao existirem;
- pesquisa o tema com `king-research`;
- consulta o conhecimento indexado com `kctx`;
- escreve o manuscrito em Markdown;
- entrega para `pdf-generator`;
- gera HTML e PDF.

## Instalacao

Na raiz do projeto:

```powershell
npx @king-context/cli init
npm install
```

Copie o arquivo de ambiente:

```powershell
Copy-Item .king-context\.env.example .king-context\.env
```

Preencha `.king-context/.env` com suas chaves:

```text
EXA_API_KEY=
OPENROUTER_API_KEY=
JINA_API_KEY=
FIRECRAWL_API_KEY=
```

Para este use case, as principais sao `EXA_API_KEY` e `OPENROUTER_API_KEY`, usadas pelo `king-research`.

## Uso

Abra o Codex neste repositorio e peca:

```text
use ebook-factory para criar um ebook que fale sobre a evolucao da I.A desde seus primordios ate o momento atual de 2026
```

Ou troque o tema:

```text
use ebook-factory para criar um ebook sobre produtividade para programadores freelancers
```

```text
use ebook-factory para criar um ebook sobre receitas brasileiras para vender no Paraguai
```

```text
use ebook-factory para criar um ebook sobre estoicismo aplicado a vida moderna
```

E isso. A proposta do exemplo e mostrar que o King Context vira a camada de conhecimento local, enquanto a skill conduz o fluxo inteiro.

## O Que Acontece Por Baixo

Quando voce chama `ebook-factory`, a skill:

1. verifica se existem os corpora essenciais `ebook-factory-*`;
2. se faltar algum, cria automaticamente com `king-research`;
3. transforma seu pedido em um brief editorial;
4. cria ou reutiliza um corpus de pesquisa sobre o tema do ebook;
5. consulta os corpora com `kctx`;
6. escreve o Markdown;
7. revisa estrutura, claims, etica e qualidade;
8. gera o PDF com `pdf-generator`.

Os corpora essenciais nao sao commitados. Eles sao gerados localmente na primeira execucao.

## Exemplo Incluido

Este repositorio inclui um exemplo ja gerado:

```text
output/evolucao-da-ia-ate-2026.md
output/evolucao-da-ia-ate-2026.html
output/evolucao-da-ia-ate-2026.pdf
output/build-evolucao-ia-2026.js
```

Voce pode mante-los no repositorio para mostrar o resultado final, ou remove-los se quiser que o cookbook seja 100% regeneravel.

Para reconstruir o PDF do exemplo:

```powershell
npm run build:example
```

Para checar os scripts:

```powershell
npm run check:scripts
```

No Windows, se o PowerShell bloquear `npm.ps1`, use:

```powershell
npm.cmd run check:scripts
```

## Estrutura

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
  exemplo gerado
```

## Para Publicar

Nao commite:

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

Esses itens ja estao no `.gitignore`.

## Nota Para Mantenedores

Os prompts que recriam os corpora essenciais ficam em:

```text
.agents/skills/ebook-factory/assets/corpora/
```

A regra esta em:

```text
.agents/skills/ebook-factory/SKILL.md
```

Se os corpora essenciais nao existirem, a skill deve cria-los antes de escrever qualquer ebook.
