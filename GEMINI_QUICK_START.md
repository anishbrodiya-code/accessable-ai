# Free-first AI setup

1. Create a key at https://aistudio.google.com/api-keys (check free-tier eligibility).
2. Copy your existing `.env.local` to the new project.
3. Add `GEMINI_API_KEY=your_key` and `GEMINI_MODEL=gemini-2.5-flash`.
4. Remove `OPENAI_API_KEY` from `.env.local` to avoid OpenAI requests.
5. Run `npm.cmd install`, `npm.cmd run build`, `npm.cmd run dev` in the inner `accessable-ai` folder.
6. Test Analyze, Understand and Developer Intelligence Generate AI fixes.

All five AI endpoints now prefer Gemini; OpenAI is only used when GEMINI_API_KEY is absent. No new packages needed. Free-tier quotas/eligibility vary. Never share or commit `.env.local`.
