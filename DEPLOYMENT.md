# Deploy AccessAble AI (Windows)

1. Extract the project ZIP. Open the `accessable-ai` folder in VS Code.
2. Open PowerShell in the project folder and run `npm.cmd install`.
3. Create `.env.local` in the project root using `.env.example` as a template. Set `OPENAI_API_KEY` to your own secret and `OPENAI_MODEL=gpt-4.1-mini`. Never commit the key.
4. Run `npm.cmd run dev`, open http://localhost:3000 and test Analyze, Understand, Experience, themes and document upload.
5. Run `npm.cmd test`, `npx.cmd tsc --noEmit`, and `npm.cmd run build` before publishing.
6. Create an empty repository at https://github.com/new and run `git init`, `git add .`, `git commit -m "Deploy AccessAble AI"`, `git branch -M main`, `git remote add origin https://github.com/YOUR_USERNAME/accessable-ai.git`, `git push -u origin main`. Verify `.env.local` is ignored first.
7. Go to https://vercel.com/new, import the repository, set `OPENAI_API_KEY` and `OPENAI_MODEL` in project Environment Variables, then deploy.
8. Test the Vercel URL with a real AI request. Add environment variables and redeploy if the live version says the provider is not configured.
9. To publish changes later, run `git add .`, `git commit -m "Update site"`, `git push`. Vercel redeploys from GitHub.

Note: The API key is intentionally not included in the ZIP. Browser-based speech synthesis depends on the user's browser. PDF reading order is not guaranteed for complex multi-column layouts.
