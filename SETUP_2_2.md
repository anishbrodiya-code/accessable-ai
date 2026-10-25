# AccessAble AI 2.2 Setup

1. Open the `accessable-ai` folder containing `package.json` in VS Code.
2. Run `npm.cmd install` then `npm.cmd run build` and `npm.cmd run dev`.
3. The public `/` landing and `/demo` pages do not require credentials.
4. Copy `.env.example` to `.env.local`. Add `OPENAI_API_KEY`, `OPENAI_MODEL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Create a Supabase project, then execute `supabase/migrations/001_documents.sql` in its SQL editor.
6. Configure Supabase Authentication URL settings: `http://localhost:3000`, redirect allowlist `http://localhost:3000/**` and `http://localhost:3000/auth/update-password`.
7. Restart the dev server after changing environment variables.
8. Never commit `.env.local`, OpenAI keys, or Supabase service role keys.

## Important limitations

This package is a development candidate. The build and live OpenAI/Supabase workflows have **not** been verified here. Authentication uses server-side middleware with `@supabase/ssr`, but sensitive API routes still require separate server-side authorization/rate-limiting review before public deployment. Existing document persistence and PDF handling require regression testing. The public demo uses predefined fictional content and makes no AI calls.
