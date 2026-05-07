#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { spawnSync } = require('child_process');
const { marked } = require('marked');

const OUT_DIR = __dirname;
const MD_PATH = path.join(OUT_DIR, 'evolucao-da-ia-ate-2026.md');
const HTML_OUT = path.join(OUT_DIR, 'evolucao-da-ia-ate-2026.html');
const PDF_OUT = path.join(OUT_DIR, 'evolucao-da-ia-ate-2026.pdf');
const CHROME_PROFILE = path.join(OUT_DIR, '.chrome-evolucao-ia');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMd(lines) {
  return marked.parse(lines.join('\n'), { async: false });
}

let raw = fs.readFileSync(MD_PATH, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
const lines = raw.split(/\r?\n/);

let title = 'A Evolucao da Inteligencia Artificial';
let subtitle = 'Dos primeiros sonhos mecanicos aos agentes multimodais de 2026';
if (/^#\s+/.test(lines[0] || '')) title = lines.shift().replace(/^#\s+/, '').trim();
while (lines.length && lines[0].trim() === '') lines.shift();
if (/^##\s+/.test(lines[0] || '')) subtitle = lines.shift().replace(/^##\s+/, '').trim();

const blocks = [];
let cur = null;

function flush() {
  if (!cur) return;
  cur.html = renderMd(cur.lines);
  blocks.push(cur);
  cur = null;
}

function start(type, titleText) {
  flush();
  cur = { type, title: titleText, lines: [] };
}

for (const line of lines) {
  let m = line.match(/^#\s+Parte\s+(\d+)\.\s+(.+)$/i);
  if (m) {
    flush();
    blocks.push({ type: 'part', num: Number(m[1]), title: m[2].trim(), html: '' });
    continue;
  }

  m = line.match(/^##\s+Capitulo\s+(\d+)\.\s+(.+)$/i);
  if (m) {
    start('chapter', `Capitulo ${m[1]}. ${m[2].trim()}`);
    continue;
  }

  m = line.match(/^#\s+Conclusao\.\s+(.+)$/i);
  if (m) {
    start('conclusion', `Conclusao. ${m[1].trim()}`);
    continue;
  }

  m = line.match(/^#\s+Apendice\s+([A-Z])\.\s+(.+)$/i);
  if (m) {
    start('appendix', `Apendice ${m[1]}. ${m[2].trim()}`);
    continue;
  }

  m = line.match(/^#\s+(.+)$/);
  if (m) {
    const heading = m[1].trim();
    const type = /^sumario$/i.test(heading)
      ? 'manual-toc'
      : /fontes comentadas/i.test(heading)
        ? 'sources'
        : 'frontmatter';
    start(type, heading);
    continue;
  }

  if (cur) cur.lines.push(line);
}
flush();

const tocRows = blocks
  .filter((block) => ['frontmatter', 'part', 'chapter', 'conclusion', 'appendix', 'sources'].includes(block.type))
  .map((block) => {
    const label = block.type === 'part' ? `Parte ${block.num}` : '';
    const titleText = block.type === 'part' ? block.title : block.title;
    return `<div class="toc-row toc-${block.type}"><span class="toc-label">${escapeHtml(label)}</span><span class="toc-title">${escapeHtml(titleText)}</span><span class="toc-line"></span></div>`;
  })
  .join('\n');

const partNotes = {
  1: 'As ideias que tornaram possivel imaginar pensamento como procedimento.',
  2: 'O periodo das regras, dos especialistas artificiais e das primeiras decepcoes.',
  3: 'A transicao para dados, estatistica, redes neurais e aprendizado profundo.',
  4: 'A IA generativa como infraestrutura cultural, economica e politica.'
};

const content = blocks.map((block) => {
  if (block.type === 'part') {
    return `<section class="part-divider">
      <div class="part-kicker">Parte ${block.num}</div>
      <div class="part-numeral">${['I', 'II', 'III', 'IV'][block.num - 1] || block.num}</div>
      <h1>${escapeHtml(block.title)}</h1>
      <p>${escapeHtml(partNotes[block.num] || 'Um eixo historico para compreender a inteligencia artificial.')}</p>
    </section>`;
  }

  if (block.type === 'chapter') {
    const clean = block.title.replace(/^Capitulo\s+(\d+)\.\s+/i, '');
    const num = (block.title.match(/^Capitulo\s+(\d+)/i) || [null, ''])[1];
    return `<section class="chapter">
      <header class="chapter-header">
        <div class="chapter-kicker">Capitulo ${escapeHtml(num)}</div>
        <h1>${escapeHtml(clean)}</h1>
      </header>
      <div class="chapter-body">${block.html}</div>
    </section>`;
  }

  const className = {
    frontmatter: 'frontmatter',
    conclusion: 'chapter conclusion',
    appendix: 'chapter appendix',
    sources: 'chapter sources'
  }[block.type] || 'chapter';
  if (block.type === 'manual-toc') return '';

  const frontMatterClass = /^nota editorial$/i.test(block.title)
    ? ' frontmatter-note'
    : '';

  return `<section class="${className}${frontMatterClass}">
    <header class="chapter-header compact">
      <h1>${escapeHtml(block.title)}</h1>
    </header>
    <div class="chapter-body">${block.html}</div>
  </section>`;
}).join('\n');

const css = `
@page {
  size: 152mm 229mm;
  margin: 18mm 16mm 20mm;
  background: #f8f6ef;
}
@page no-header {
  margin: 0;
  background: #101820;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #f8f6ef; color: #192026; }
body {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 10.8pt;
  line-height: 1.52;
  text-rendering: optimizeLegibility;
}
p { margin: 0 0 0.75em; text-align: justify; hyphens: auto; }
strong { font-weight: 700; }
em { color: #3b4b58; }

.cover {
  page: no-header;
  height: 229mm;
  padding: 21mm 18mm;
  background:
    linear-gradient(135deg, rgba(26, 115, 140, 0.23), rgba(232, 190, 92, 0.13)),
    #101820;
  color: #f9f5ea;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  page-break-before: always;
}
.cover-kicker {
  font-family: Arial, sans-serif;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #e8be5c;
}
.cover h1 {
  margin: 22mm 0 0;
  font-family: Arial, sans-serif;
  font-size: 30pt;
  line-height: 1.02;
  letter-spacing: 0;
  max-width: 105mm;
}
.cover-subtitle {
  margin-top: 8mm;
  max-width: 100mm;
  font-size: 15pt;
  line-height: 1.25;
  text-align: left;
  color: #e9edf0;
}
.cover-rule {
  width: 34mm;
  height: 1.2mm;
  background: #e8be5c;
  margin-bottom: 7mm;
}
.cover-edition {
  font-family: Arial, sans-serif;
  color: #b8c5ce;
  font-size: 8.5pt;
}

.title-page, .copyright, .toc {
  page-break-before: always;
  break-before: page;
  min-height: 170mm;
  overflow: hidden;
}
.title-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
.title-page h1 {
  font-family: Arial, sans-serif;
  font-size: 23pt;
  line-height: 1.08;
  margin: 0 0 8mm;
}
.title-page p {
  text-align: center;
  color: #3d4b55;
  font-size: 12.5pt;
}
.copyright {
  font-size: 9.3pt;
  color: #44515b;
  padding-top: 60mm;
}
.copyright p { text-align: left; }
.toc h1 {
  font-family: Arial, sans-serif;
  font-size: 20pt;
  margin: 0 0 7mm;
}
.toc-row {
  display: grid;
  grid-template-columns: 18mm 1fr 6mm;
  gap: 2mm;
  align-items: baseline;
  margin: 0 0 2.1mm;
  font-size: 8.1pt;
  line-height: 1.18;
  break-inside: avoid;
  page-break-inside: avoid;
}
.toc-row.toc-part {
  margin-top: 4mm;
  font-family: Arial, sans-serif;
  font-weight: 700;
  color: #1a738c;
}
.toc-label {
  font-family: Arial, sans-serif;
  font-size: 7.5pt;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #687681;
}
.toc-line { border-bottom: 0.35pt solid #c9c0ad; height: 1px; }

section.frontmatter, section.chapter {
  page-break-before: always;
  break-before: page;
}
.frontmatter-note {
  min-height: 170mm;
  overflow: hidden;
}
section.frontmatter h1, .chapter-header h1 {
  font-family: Arial, sans-serif;
  font-size: 19pt;
  line-height: 1.12;
  margin: 0 0 9mm;
  color: #101820;
}
section.frontmatter .chapter-body, .chapter-body {
  max-width: 116mm;
}
section.frontmatter p:first-of-type::first-letter,
section.chapter:not(.appendix):not(.sources) .chapter-body p:first-of-type::first-letter {
  float: left;
  font-size: 42pt;
  line-height: 0.82;
  padding-right: 2.2mm;
  font-family: Georgia, serif;
  color: #1a738c;
}
.chapter-kicker {
  font-family: Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #1a738c;
  font-size: 8pt;
  margin-bottom: 4mm;
}
.chapter-header {
  border-top: 1.2pt solid #e8be5c;
  padding-top: 7mm;
  margin-bottom: 6mm;
}
.chapter-header.compact {
  padding-top: 9mm;
}
.part-divider {
  page: no-header;
  height: 229mm;
  background: #101820;
  color: #f8f6ef;
  padding: 35mm 20mm;
  page-break-before: always;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.part-kicker {
  font-family: Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #e8be5c;
  font-size: 8pt;
}
.part-numeral {
  font-family: Georgia, serif;
  font-size: 48pt;
  color: rgba(232, 190, 92, 0.5);
  line-height: 1;
  margin: 8mm 0 2mm;
}
.part-divider h1 {
  font-family: Arial, sans-serif;
  margin: 0 0 8mm;
  font-size: 23pt;
  line-height: 1.05;
}
.part-divider p {
  max-width: 90mm;
  text-align: left;
  font-size: 12pt;
  color: #d5dde2;
}
h2, h3 {
  font-family: Arial, sans-serif;
  color: #1a738c;
  margin: 1.1em 0 0.45em;
  page-break-after: avoid;
}
ul { margin: 0.4em 0 1em 0; padding-left: 5mm; }
li { margin-bottom: 0.35em; }
section.appendix p, section.sources p { text-align: left; }
section.sources strong { color: #1a738c; }
`;

const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
  <section class="cover">
    <div>
      <div class="cover-kicker">Historia, tecnologia e sociedade</div>
      <h1>${escapeHtml(title)}</h1>
      <p class="cover-subtitle">${escapeHtml(subtitle)}</p>
    </div>
    <div>
      <div class="cover-rule"></div>
      <div class="cover-edition">Edicao digital revisada | Maio de 2026</div>
    </div>
  </section>
  <section class="title-page">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(subtitle)}</p>
  </section>
  <section class="copyright">
    <p><strong>${escapeHtml(title)}</strong></p>
    <p>Edicao digital independente, criada como material panoramico de estudo.</p>
    <p>Este ebook foi preparado em maio de 2026. O campo de IA muda rapidamente; leitores devem verificar dados regulatorios, benchmarks e produtos antes de tomar decisoes profissionais ou institucionais.</p>
  </section>
  <section class="toc">
    <h1>Sumario</h1>
    ${tocRows}
  </section>
  ${content}
</body>
</html>`;

fs.writeFileSync(HTML_OUT, html, 'utf8');

if (!fs.existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}`);
  process.exit(1);
}

const result = spawnSync(CHROME, [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-crash-reporter',
  '--disable-breakpad',
  `--user-data-dir=${CHROME_PROFILE}`,
  '--allow-file-access-from-files',
  '--run-all-compositor-stages-before-draw',
  '--virtual-time-budget=10000',
  '--no-pdf-header-footer',
  `--print-to-pdf=${PDF_OUT}`,
  '--print-to-pdf-no-header',
  pathToFileURL(HTML_OUT).href
], { stdio: 'inherit' });

if (result.status !== 0) process.exit(result.status || 1);
console.log(`Wrote ${PDF_OUT}`);
