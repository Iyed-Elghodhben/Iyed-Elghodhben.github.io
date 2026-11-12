# Elghodhben Iyed — Portfolio

Personal portfolio site. Built with Vue 3 + Vite.

## Stack

- Vue 3 (`<script setup>`)
- Vite
- Plain CSS (no framework) — design tokens in `src/style.css`
- Self-hosted fonts via `@fontsource` (IBM Plex Serif / Sans / Mono)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## AI career agent

A chat widget (`src/components/CareerAgent.vue`) lets visitors ask an AI about Iyed's career instead of reading the whole page. It calls a Cloudflare Worker that holds the Gemini API key server-side and builds its system prompt directly from `src/data/content.js` — so the agent's knowledge always matches the site content, nothing is duplicated.

### Deploy the worker (one-time)

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put GEMINI_API_KEY   # paste your Gemini API key from aistudio.google.com
npx wrangler deploy
```

Wrangler prints the deployed URL (`https://iyed-career-agent.<your-subdomain>.workers.dev`). Copy it into `AGENT_ENDPOINT` at the top of `src/components/CareerAgent.vue`, then rebuild/redeploy the site.

For local testing, copy `worker/.dev.vars.example` to `worker/.dev.vars`, fill in the key, and run `npm run dev` inside `worker/`.

The worker only accepts requests from `https://iyed-elghodhben.github.io` and `localhost:5173` (see `ALLOWED_ORIGINS` in `worker/src/index.js`) — update that list if the domain changes.
