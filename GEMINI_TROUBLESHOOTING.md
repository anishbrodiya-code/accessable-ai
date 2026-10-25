# Gemini model availability fix
All five AI endpoints (Analyze, Simplify/Understand, Ask, Translate, Developer AI Fix) use lib/ai.ts. If GEMINI_API_KEY is set, OpenAI is not called. This patch retries known Gemini model IDs when a model returns HTTP 404. It does not bypass provider quotas or regional availability.

## Setup
Set GEMINI_API_KEY=your_key and GEMINI_MODEL=gemini-2.5-flash in `.env.local`. Remove OPENAI_API_KEY to avoid accidental OpenAI use if the Gemini key is missing. Restart `npm.cmd run dev` after changes.

## If model is still unavailable
In Google AI Studio, check model access for your project and use an exact supported model name in GEMINI_MODEL. API key/project region and free-tier quotas may restrict access. Do not paste your API key into chat.

## Test
1. Analyze a short paragraph.
2. Simplify it in Understand.
3. Ask a question about the document.
4. Test Translate.
5. In Developer Intelligence, paste code and click Generate AI fixes.

Live API integration and Next.js build were not verified in this environment; dependency installation timed out. Supabase remains unchanged.
