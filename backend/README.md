# HUMMBL Backend (`hummbl-backend`)

Cloudflare Workers + Hono service that powers HUMMBL's `/api/contact` endpoint and a lightweight `/api/health` check.

## Local development

```bash
cd hummbl-backend
npm install
npx wrangler dev
```

This runs the Worker at `http://127.0.0.1:8787` with:

- `POST /api/contact` – accepts `{ email, message?, source? }`, validates the email, and stores the payload in the `CONTACT_LOG` KV namespace.
- `GET /api/health` – returns `{ "ok": true, "service": "hummbl-contact", "version": "0.1.0" }` for liveness and version checks.

## KV configuration

`wrangler.toml` binds the KV namespace used to persist contact submissions:

```toml
[[kv_namespaces]]
binding = "CONTACT_LOG"
id = "<your KV namespace id>"
```

Create the namespace via **Cloudflare Dashboard → Workers & Pages → Workers KV**, then paste its ID into the config.

## Deploying the Worker

```bash
cd hummbl-backend
npx wrangler deploy
```

Wrangler prints the production endpoint (e.g. `https://hummbl-backend.<account>.workers.dev`). Verify with:

```bash
curl https://hummbl-backend.<account>.workers.dev/api/health
```

## Routing `/api/*` in production

For the production setup (Cloudflare in front of Vercel):

1. Point your domain (e.g. `hummbl.io`) at Vercel but keep it proxied through Cloudflare.
2. In **Workers & Pages → hummbl-backend → Triggers**, add a route:

   ```text
   https://hummbl.io/api/*
   ```

   (Adjust for `www` if needed.)

Now: `https://hummbl.io/api/contact` hits the Worker, while all other paths (`/`, `/whitepaper`, `/deck`) continue to Vercel. The frontend keeps using relative calls like `fetch('/api/contact')` in both dev and prod.

## Notes

- Uses `@cloudflare/workers-types` for typings and Hono for routing.
- Contact submissions are stored in KV (key format `contact:<timestamp>:<email>`). Extend with email notifications or D1 persistence later if desired.
- `/api/health` should be wired into uptime monitors once deployed.
