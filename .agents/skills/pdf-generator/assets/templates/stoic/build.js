#!/usr/bin/env node
/* eslint-disable no-console */
// Estoicismo na Era Moderna — gerador HTML/PDF
// Lê o markdown, converte em HTML semântico estruturado (capa, sumário,
// abertura de partes, abertura de capítulos, apêndices) e gera PDF via Chrome.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { marked } = require('marked');

const ROOT = __dirname;
const MD_PATH = path.join(ROOT, 'ebook-estoicismo-era-moderna.md');
const CSS_PATH = path.join(ROOT, 'style.css');
const HTML_OUT = path.join(ROOT, 'ebook.html');
const PDF_OUT = path.join(ROOT, 'estoicismo-na-era-moderna.pdf');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const APPENDIX_LETTER = { 'A': 'I', 'B': 'II', 'C': 'III', 'D': 'IV' };

// ---------- Utilidades ----------
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escapeAttr(s) { return escapeHtml(s); }

function renderInline(md) {
  // marked.parseInline para frases simples
  return marked.parseInline(md, { async: false }).trim();
}
function renderBlock(md) {
  return marked.parse(md, { async: false });
}

// ---------- Carregar markdown e remover YAML frontmatter ----------
let raw = fs.readFileSync(MD_PATH, 'utf8');
raw = raw.replace(/^---[\s\S]*?---\s*/, '');
raw = raw.replace(/\\newpage/g, ''); // tratamos quebras via classes

// ---------- Parser estrutural baseado em headings ----------
const lines = raw.split('\n');
const blocks = []; // sequência de seções estruturadas

let cur = null;
function flush() {
  if (cur) { blocks.push(cur); cur = null; }
}
function start(kind, meta) {
  flush();
  cur = { kind, meta, body: [] };
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Parte
  let m = line.match(/^# Parte (\d+)\.\s+(.+)$/);
  if (m) { start('part', { num: parseInt(m[1],10), title: m[2].trim() }); continue; }

  // Capítulo
  m = line.match(/^## Capítulo (\d+)\.\s+(.+)$/);
  if (m) { start('chapter', { num: parseInt(m[1],10), title: m[2].trim() }); continue; }

  // Conclusão
  m = line.match(/^## Conclusão\.\s+(.+)$/);
  if (m) { start('conclusion', { title: m[1].trim() }); continue; }

  // Apêndice header (## Apêndice X. Título)
  m = line.match(/^## Apêndice ([A-D])\.\s+(.+)$/);
  if (m) { start('appendix', { letter: m[1], title: m[2].trim() }); continue; }

  // # Apêndices  (divisor)
  if (/^# Apêndices\s*$/.test(line)) { start('appendix-divider', {}); continue; }

  // # Sobre este livro (frontmatter)
  m = line.match(/^# (Sobre este livro|Nota editorial|Prefácio|Prefacio|Introdução|Introducao|Agradecimentos)\s*$/);
  if (m) { start('frontmatter', { title: m[1] }); continue; }

  // A manuscript may include its own Markdown TOC. The build script generates
  // a semantic TOC, so keep manual TOCs out of the rendered body to avoid
  // duplicate or displaced front-matter pages in Chrome PDF output.
  m = line.match(/^# (Sumário|Sumario|Índice|Indice)\s*$/);
  if (m) { start('manual-toc', { title: m[1] }); continue; }

  // Default: append to current block
  if (cur) {
    cur.body.push(line);
  }
}
flush();

// ---------- Renderização de cada bloco ----------
function renderFrontmatter(b) {
  const html = renderBlock(b.body.join('\n'));
  const noteClass = /^nota editorial$/i.test(b.meta.title) ? ' frontmatter-note' : '';
  return `<section class="frontmatter-section${noteClass}">
    <h1>${escapeHtml(b.meta.title)}</h1>
    <div class="frontmatter-body">${html}</div>
  </section>`;
}

function partTagline(num) {
  // Pequena epígrafe orientadora por parte
  const taglines = {
    1: 'A filosofia antes do slogan — origem, escola, cosmologia.',
    2: 'A vida boa segundo virtude, sabedoria, coragem, justiça e temperança.',
    3: 'O que depende de nós, o que escapa, e o que se faz com isso.',
    4: 'Onde o estoicismo encontra a psicologia clínica moderna.',
    5: 'A filosofia em ato no trabalho, no amor, na perda, na tela.',
    6: 'As caricaturas do estoicismo e por que recusá-las.',
    7: 'Conversas com epicurismo, cinismo, existencialismo e cristianismo.',
    8: 'Um método: diário, protocolo de crise e plano de trinta dias.'
  };
  return taglines[num] || '';
}

function renderPart(b) {
  const tag = partTagline(b.meta.num);
  return `<section class="part">
    <div class="part-eyebrow">Parte ${b.meta.num}</div>
    <div class="part-numeral">${ROMAN[b.meta.num-1] || b.meta.num}</div>
    <div class="part-rule"></div>
    <h1 class="part-title">${escapeHtml(b.meta.title)}</h1>
    ${tag ? `<p class="part-tagline">${escapeHtml(tag)}</p>` : ''}
  </section>`;
}

function renderChapter(b) {
  const html = renderBlock(b.body.join('\n'));
  const titleEsc = escapeAttr(b.meta.title);
  return `<section class="chapter" data-chapter-title="${titleEsc}">
    <header class="chapter-opening">
      <span class="chapter-eyebrow">Capítulo ${b.meta.num}</span>
      <div class="chapter-rule"></div>
      <h2 class="chapter-title">${escapeHtml(b.meta.title)}</h2>
    </header>
    <div class="chapter-body">${html}</div>
  </section>`;
}

function renderConclusion(b) {
  const html = renderBlock(b.body.join('\n'));
  return `<section class="chapter conclusion" data-chapter-title="Conclusão">
    <header class="chapter-opening">
      <span class="chapter-eyebrow">Encerramento</span>
      <div class="chapter-rule"></div>
      <h2 class="chapter-title">${escapeHtml(b.meta.title)}</h2>
    </header>
    <div class="chapter-body">${html}</div>
  </section>`;
}

function renderAppendixDivider() {
  return `<section class="appendix-divider">
    <div class="appendix-divider-eyebrow">Material complementar</div>
    <div class="appendix-divider-title">Apêndices</div>
    <div class="appendix-divider-rule"></div>
    <div class="appendix-divider-tag">Glossário, exercícios, sínteses</div>
  </section>`;
}

function renderAppendix(b) {
  const html = renderBlock(b.body.join('\n'));
  const titleEsc = escapeAttr(b.meta.title);
  return `<section class="chapter appendix" data-chapter-title="Apêndice ${b.meta.letter}">
    <header class="chapter-opening">
      <span class="appendix-eyebrow">Apêndice ${b.meta.letter}</span>
      <div class="appendix-rule"></div>
      <h2 class="chapter-title">${escapeHtml(b.meta.title)}</h2>
    </header>
    <div class="chapter-body">${html}</div>
  </section>`;
}

// ---------- Sumário (TOC) ----------
function buildTOC() {
  const items = [];
  let curPart = null;
  for (const b of blocks) {
    if (b.kind === 'part') {
      curPart = { num: b.meta.num, title: b.meta.title, chapters: [] };
      items.push({ kind: 'part', data: curPart });
    } else if (b.kind === 'chapter' && curPart) {
      curPart.chapters.push({ num: b.meta.num, title: b.meta.title });
    } else if (b.kind === 'conclusion') {
      items.push({ kind: 'conclusion', data: { title: b.meta.title } });
    } else if (b.kind === 'appendix') {
      items.push({ kind: 'appendix', data: { letter: b.meta.letter, title: b.meta.title } });
    } else if (b.kind === 'frontmatter') {
      items.push({ kind: 'front', data: { title: b.meta.title } });
    }
  }

  let html = `<section class="toc">
    <h1>Sumário</h1>
    <div class="toc-rule"></div>`;
  for (const it of items) {
    if (it.kind === 'front') {
      html += `<div class="toc-chapter toc-extra">
        <span class="toc-chapter-num">—</span>
        <span class="toc-chapter-title"><em>${escapeHtml(it.data.title)}</em></span>
        <span class="toc-chapter-leader"></span>
        <span class="toc-chapter-page"></span>
      </div>`;
    } else if (it.kind === 'part') {
      html += `<div class="toc-part">
        <span>${escapeHtml(it.data.title)}</span>
        <span class="toc-part-num">Parte ${ROMAN[it.data.num-1] || it.data.num}</span>
      </div>`;
      for (const ch of it.data.chapters) {
        html += `<div class="toc-chapter">
          <span class="toc-chapter-num">Cap. ${ch.num}</span>
          <span class="toc-chapter-title">${escapeHtml(ch.title)}</span>
          <span class="toc-chapter-leader"></span>
          <span class="toc-chapter-page"></span>
        </div>`;
      }
    } else if (it.kind === 'conclusion') {
      html += `<div class="toc-part" style="margin-top:9mm">
        <span>Conclusão</span>
        <span class="toc-part-num">${escapeHtml(it.data.title)}</span>
      </div>`;
    } else if (it.kind === 'appendix') {
      html += `<div class="toc-chapter toc-extra">
        <span class="toc-chapter-num">Ap. ${escapeHtml(it.data.letter)}</span>
        <span class="toc-chapter-title">${escapeHtml(it.data.title)}</span>
        <span class="toc-chapter-leader"></span>
        <span class="toc-chapter-page"></span>
      </div>`;
    }
  }
  html += `</section>`;
  return html;
}

// ---------- Renderiza tudo em ordem ----------
const sections = [];
let appendixDividerInserted = false;

for (let i = 0; i < blocks.length; i++) {
  const b = blocks[i];
  if (b.kind === 'frontmatter') sections.push(renderFrontmatter(b));
  else if (b.kind === 'manual-toc') continue;
  else if (b.kind === 'part') sections.push(renderPart(b));
  else if (b.kind === 'chapter') sections.push(renderChapter(b));
  else if (b.kind === 'conclusion') sections.push(renderConclusion(b));
  else if (b.kind === 'appendix-divider') { sections.push(renderAppendixDivider()); appendixDividerInserted = true; }
  else if (b.kind === 'appendix') sections.push(renderAppendix(b));
}

// ---------- Frontmatter fixo (cover, title, copyright, epigraph, toc) ----------
const COVER = `<section class="cover">
  <div class="cover-frame"></div>
  <div class="cover-top">
    <div class="cover-mark">Filosofia • Vida Examinada</div>
    <h1 class="cover-title">Estoicismo<em>na Era Moderna</em></h1>
    <p class="cover-subtitle">Uma filosofia antiga<br/>para uma vida instável</p>
  </div>
  <div>
    <div class="cover-symbol-rule"></div>
    <div class="cover-symbol">❦</div>
    <div class="cover-symbol-rule"></div>
  </div>
  <div class="cover-bottom">
    <div class="cover-author">Bruce Tavares</div>
    <div class="cover-publisher">Edição de autor • mmxxvi</div>
  </div>
</section>`;

const TITLE_PAGE = `<section class="title-page">
  <div class="title-page-mark">Filosofia • Vida Examinada</div>
  <h1 class="title-page-title">Estoicismo<br/>na Era Moderna</h1>
  <p class="title-page-subtitle">Uma filosofia antiga para uma vida instável</p>
  <div class="title-page-rule"></div>
  <div class="title-page-author">Bruce Tavares</div>
  <div class="title-page-publisher">Edição de autor &nbsp;•&nbsp; 2026</div>
</section>`;

const COPYRIGHT_PAGE = `<section class="copyright-page">
  <p><strong>Estoicismo na Era Moderna</strong><br/>
  <em>Uma filosofia antiga para uma vida instável</em></p>
  <p>Copyright © 2026 por Bruce Tavares.<br/>
  Todos os direitos reservados.</p>
  <p>É expressamente proibida a reprodução total ou parcial desta obra, por quaisquer meios, sem autorização prévia e por escrito do autor, conforme a Lei nº 9.610/98.</p>
  <p>1ª edição — 2026</p>
  <p>Composição tipográfica em <em>EB Garamond</em> e <em>Cormorant Garamond</em>.<br/>
  Projeto gráfico e diagramação do autor.</p>
  <p style="margin-top:6mm;font-size:9pt;">As citações de Sêneca, Epicteto, Marco Aurélio, Cícero, Diógenes Laércio, Pierre Hadot, Massimo Pigliucci, Donald Robertson, Albert Ellis e Aaron Beck obedecem aos princípios de uso justo para fins de comentário, crítica e estudo, com a devida atribuição autoral.</p>
</section>`;

const EPIGRAPH = `<section class="epigraph-page">
  <p class="epigraph-quote">"Não nos perturbam as coisas, mas as opiniões que temos sobre as coisas."</p>
  <p class="epigraph-attr">— Epicteto, <em>Enquirídio</em>, V</p>
</section>`;

const COLOPHON = `<section class="colophon">
  <div class="colophon-symbol">❦</div>
  <div class="colophon-rule"></div>
  <p class="colophon-text">
    Esta edição de <strong>Estoicismo na Era Moderna</strong> foi composta nos tipos digitais <em>EB Garamond</em>, desenhado por Georg Duffner a partir das matrizes de Claude Garamond, e <em>Cormorant Garamond</em>, de Christian Thalmann.
    <br/><br/>
    Concluída em maio de 2026, sob o sol estável de uma cidade qualquer, e oferecida ao leitor que sustenta a busca por viver bem.
  </p>
</section>`;

const TOC = buildTOC();

// ---------- HTML completo ----------
const css = fs.readFileSync(CSS_PATH, 'utf8');
const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Estoicismo na Era Moderna — Bruce Tavares</title>
<style>
${css}
</style>
</head>
<body>
${COVER}
${TITLE_PAGE}
${COPYRIGHT_PAGE}
${EPIGRAPH}
${TOC}
${sections.join('\n')}
${COLOPHON}
</body>
</html>`;

fs.writeFileSync(HTML_OUT, html, 'utf8');
console.log(`✓ HTML escrito: ${HTML_OUT}  (${(html.length/1024).toFixed(1)} kb)`);

// ---------- Geração de PDF via Chrome headless ----------
const fileURL = 'file://' + HTML_OUT;
const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--no-sandbox',
  '--virtual-time-budget=10000',
  '--run-all-compositor-stages-before-draw',
  `--print-to-pdf=${PDF_OUT}`,
  '--print-to-pdf-no-header',
  fileURL
];
console.log('→ Renderizando PDF com Chrome headless…');
const r = spawnSync(CHROME, args, { stdio: 'inherit' });
if (r.status !== 0) {
  console.error('✗ Falha na geração do PDF', r.error || '');
  process.exit(1);
}
const stat = fs.statSync(PDF_OUT);
console.log(`✓ PDF gerado: ${PDF_OUT}  (${(stat.size/1024/1024).toFixed(2)} MB)`);
