import { Hono } from 'hono'

export interface Env {
  CONTACT_LOG: KVNamespace
}

interface ContactPayload {
  email: string
  message?: string
  source?: string
}

const app = new Hono<{ Bindings: Env }>()

app.post('/api/contact', async (c) => {
  const payload = (await c.req.json()) as ContactPayload

  if (!payload.email || typeof payload.email !== 'string') {
    return c.json({ error: 'Missing email' }, 400)
  }

  const entry = {
    email: payload.email,
    message: payload.message ?? '',
    source: payload.source ?? 'unknown',
    receivedAt: new Date().toISOString(),
  }

  await c.env.CONTACT_LOG.put(
    `contact:${entry.receivedAt}:${entry.email}`,
    JSON.stringify(entry),
  )

  return c.json({ ok: true })
})

app.get('/api/health', (c) => {
  return c.json({ ok: true, service: 'hummbl-contact', version: '0.1.0' })
})

export default app
