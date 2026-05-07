# King Context Ebook Factory Cookbook Example

This project is a minimal cookbook use case for producing researched ebooks with King Context and local skills.

Use these skills together:

- `ebook-factory`: orchestrates intake, corpus checks, topic research, outline, manuscript, review, and PDF handoff.
- `king-context`: queries indexed corpora with `.king-context/bin/kctx`.
- `king-research`: builds new topic corpora with `.king-context/bin/king-research`.
- `pdf-generator`: renders Markdown manuscripts into print-ready PDFs.

Generated stores and local runtimes are intentionally not committed:

- `.king-context/core/`
- `.king-context/research/`
- `.king-context/docs/`
- `.king-context/data/`
- `.king-context/_temp/`
- `.king-context/_learned/`
- `node_modules/`
- `.pdfdeps/`

For setup and reproduction steps, read `README.md`.
