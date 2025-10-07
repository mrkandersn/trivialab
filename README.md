
# trivia

A small React trivia app that uses Anthropic (Claude) via serverless functions.

Getting started (local)
1. Copy the example env file and fill in secrets:

```bash
cp .env.example .env
# edit .env and add your CLAUDE_API_KEY
```

2. Install dependencies:

```bash
npm install
```

3. Start local development (serves frontend + Netlify functions):

```bash
npm run dev
```

4. (Optional) Run a quick smoke test against the local function after `netlify dev` is running:

```bash
npm run test-local
```

Deploying to Netlify
1. Push this repo to a Git provider (GitHub, GitLab, or Bitbucket).
2. Create a new site in Netlify and connect your repository.
3. Set the build command to:

```
npm run build
```

4. Set the publish directory to:

```
dist
```

5. Add environment variables in the Netlify site settings (Site settings → Build & deploy → Environment):

- `CLAUDE_API_KEY` = your Anthropic Claude API key

6. Deploy the site. Netlify will run the build and deploy functions automatically.

Notes
- Functions are proxied from `/api/*` to `/.netlify/functions/*` via `netlify.toml`. No client-side changes are required.
- Netlify Functions have execution time limits; if you see timeouts, consider reducing token usage or implementing background processing.

