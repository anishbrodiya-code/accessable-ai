# AccessAble AI

Hackathon application connecting **Understand**, **Experience**, and **Improve**.

## Setup

1. Install Node.js 20.9+ and npm.
2. Run `npm install`.
3. Run `cp .env.example .env.local` and set `OPENAI_API_KEY` to a valid OpenAI API key.
4. Run `npm run dev` and visit http://localhost:3000.
5. Run `npm test` and `npm run build` before deploying.

## PDF worker

Copy the PDF.js worker from `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `public/pdf.worker.min.mjs` after installation (the `postinstall` script below can automate this if configured). Scanned/image-only PDFs are not supported.

## Deployment

1. `git init && git add . && git commit -m "Initial AccessAble AI"`
2. Create a private GitHub repository, then `git remote add origin <YOUR_REPO_URL>` and `git push -u origin main` (set branch with `git branch -M main` if needed).
3. Import repository into Vercel, select Next.js, add `OPENAI_API_KEY` and optional `OPENAI_MODEL` in Environment Variables.
4. Deploy, then test AI routes, PDF extraction, voice controls, and report downloads on the live URL.
5. Never commit `.env.local`. OpenAI API billing is separate from ChatGPT subscriptions.

## Scope and limitations

- Checker analyzes **pasted HTML**, not live URLs, and never executes scripts. It uses deterministic checks; it is not a WCAG certification. Score is a heuristic, not a compliance metric.
- PDF extraction is browser-side, limited to 5 MB and 40 pages, and requires selectable text.
- History is browser-local. Automatic saving is disabled by default. Browser speech voice availability varies.
- AI requires a configured server-side key and external network access. Never enter confidential information without authorization.
- Demo: Load sample text in Understand and sample HTML in Checker.

## Test status

Source files generated in a sandbox without npm registry access. Dependencies, build, and automated tests have **not** been executed. Run the commands above and resolve any version-specific errors before treating this as production-ready.


## Editorial redesign (October 2026)

The interface uses an editorial cream/plum/chartreuse design system, top navigation, a redesigned landing page, and a unified `/workspace` for simplification and reading controls. `/understand` redirects to `/workspace`; `/reader` remains for existing history deep links. API routes, checker logic, PDF processing, storage, and report generation are retained from the original project.

**Validation status:** This environment could not install dependencies from npm, so TypeScript compilation, browser tests, production build, and real AI integration remain unverified. Run `npm install`, `npm test`, and `npm run build` locally and fix any failures before deployment. Do not deploy until npm audit findings are reviewed.

On Windows PowerShell use `npm.cmd install`, `npm.cmd run dev`, `npm.cmd test`, and `npm.cmd run build`.


## AccessAble AI 2.0 incremental update

New `/analyze` page: paste or upload text-based PDF/TXT, get AI-supported vocabulary/action findings with exact-source checks and local structural heuristics, ask document-grounded questions, and transfer text to `/workspace`. Existing HTML checker remains at `/checker` under Developer Tools. The dark-mode CSS changes from the uploaded archive are preserved.

This is a **first functional increment**, not the entire 2.0 specification. Original/simplified synchronized diff, DOCX, quiz, improved library, full retrieval for long documents, full dark-mode browser audit, and production deployment still require work. API routes require `OPENAI_API_KEY` in `.env.local`.
