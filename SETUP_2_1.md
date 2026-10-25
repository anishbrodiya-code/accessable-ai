# Local setup (Windows PowerShell)

1. Open the `accessable-ai` folder in VS Code (the folder containing `package.json`).
2. Run `npm.cmd install` and `npm.cmd run build`.
3. Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` and `OPENAI_MODEL`. Never commit `.env.local`.
4. Create a Supabase project, run `supabase/migrations/001_documents.sql` in the SQL Editor.
5. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`. Use the public anon/publishable key, never the service-role key.
6. Configure Site URL and allowed redirect URLs in Supabase Authentication to include `http://localhost:3000` and `http://localhost:3000/auth/update-password`.
7. Run `npm.cmd run dev`; visit `http://localhost:3000`.
8. Test the HTML checker with `<html><body><img src="x"></body></html>`; it must score below 100.
9. Test Analyze and Understand with a valid OpenAI key; inspect VS Code terminal for diagnostic errors.
10. Test sign-up, email verification, sign-in, guest import, cross-browser document access, deletion and sign-out.
11. Before Vercel deployment, configure all four environment variables in Vercel and add your deployment URL to Supabase Auth URL configuration.

If npm reports dependency conflicts, do not use `--force` until investigating the package versions.
