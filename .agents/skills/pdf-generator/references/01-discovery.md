# 01 — Discovery

Goal: in 2 minutes, know what document you're producing, who it's for, and what visual mood fits.

## Read the request first

Look for explicit signals in the user's message:

| Signal | Meaning |
|---|---|
| "ebook", "livro", "book" | Long-form, generous margins, drop caps OK |
| "manual", "guide" | Cleaner, sans-serif headers, more whitespace, callouts |
| "whitepaper", "report" | Modern minimal, system fonts OK, executive summary |
| "para venda", "sale-ready", "premium" | Print-quality, no shortcuts on typography |
| "estoico", "clássico", "atemporal" | Serif throughout, Roman numerals, italic display, ornaments (❦) |
| "moderno", "minimal" | Sans+serif mix, generous line-height, no ornaments |
| "acadêmico", "scholarly" | Serif body, footnotes, references, smaller margins |
| "narrativo", "literário" | Serif, drop caps, light decoration |
| "técnico", "developer" | Mono for code, inline mono, sans for headings, lots of code blocks |

## Read the markdown second

Open the file. Look for:

```bash
head -30 <file>.md   # YAML frontmatter usually has hints
grep -cE "^# Parte" <file>.md       # parts present?
grep -cE "^## Capítulo" <file>.md   # numbered chapters?
grep -cE "^```" <file>.md           # how much code?
grep -cE "^!" <file>.md             # how many images?
grep -cE "^- |^  -" <file>.md       # how list-heavy?
wc -l <file>.md                     # length
```

Use these counts to size the design:
- < 200 lines → article/essay → single-section design, simple TOC or none
- 200–800 lines → manual/whitepaper → chapters but no parts
- 800+ lines → book → full part/chapter hierarchy with cover and back matter
- High code count (>50 fences) → technical → mono fonts mandatory, language tags styled
- High image count (>10) → editorial → reserve space for figures, captions

## Page format defaults

| Use case | Format | Rationale |
|---|---|---|
| Trade book / ebook | 152×229mm (6"×9") | Royal octavo — classic, fits Kindle/iPad too |
| Pocket book | 127×203mm (5"×8") | More intimate, denser feel |
| Whitepaper / report | A4 (210×297mm) | Default for business contexts |
| Manual | A5 (148×210mm) | Half-A4, easy to handle |
| Magazine | 210×270mm | Wider for multi-column layouts |
| Photo book | Square (240×240mm) | Imagery-first |

Default to 152×229mm unless the user specifies otherwise or the document type strongly implies another.

## When to ask the user

Ask **at most 2 questions**, only when truly ambiguous. Examples:

> "Vou usar um layout estoico (preto e branco, serifa clássica, drop caps). Confirma esse mood ou prefere algo mais moderno (sans+serif, cinza claro)?"

> "Formato 6"×9" (clássico de livro) ou A4 (relatório)?"

If the user already gave you enough context (file is clearly a book, mood is clearly stated), proceed without asking.

## Output of this phase

Write a 5-line decision summary to your working memory (no file needed):

```
Document: <book/manual/whitepaper>
Audience: <general/students/technical/premium>
Mood: <stoic/academic/modern/narrative/editorial/technical>
Format: <152×229mm / A4 / A5 / ...>
Length: <X chapters, Y parts, Z appendices>
```

Then proceed to Phase 2 (research).
