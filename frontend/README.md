# HUMMBL Frontend (`hummbl-io`)

React 18 + Vite + TypeScript frontend for HUMMBL (Base120 reasoning substrate).

## Local development

```bash
cd hummbl-io
npm install
npm run dev
```

- App runs at `http://localhost:5173` (or similar).
- Backend API calls use relative paths like `/api/contact` so that the same code works in dev and prod.

### API proxy in dev

`vite.config.ts` proxies `/api/*` to the local Cloudflare Worker:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
```

Local flow: `browser → Vite dev server → proxy → Worker dev → KV`.

## Key routes

- `/` – Landing page (problem, what/how, examples, roadmap, API status, contact form).
- `/whitepaper` – Long-form technical & strategic paper.
- `/deck` – Narrative investor overview.

The **Get early access** form posts to `/api/contact` and shows inline success/error state. If the backend is unavailable it falls back to `mailto:hello@hummbl.io`.

## Deploying the frontend

Typical flow:

1. Build assets:

   ```bash
   npm run build
   ```

2. Deploy `dist/` to your host (e.g., Vercel).

### Production routing (Cloudflare + Vercel)

- Domain (e.g., `https://hummbl.io`) is proxied through Cloudflare and served by Vercel for static assets.
- Cloudflare routes `/api/*` to the `hummbl-backend` Worker (see backend README).
- Because the frontend always calls `/api/...`, no code changes are needed between dev and prod.

## Contact

- Email: `hello@hummbl.io`
- HUMMBL Systems · Base120 mental models for human–AI systems
