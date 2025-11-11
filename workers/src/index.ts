/**
 * HUMMBL Backend - Cloudflare Workers Entry Point
 * Hono.js API with CORS middleware
 * Base120 T5 (Execution): Global edge orchestration
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { logger } from './lib/logger';
import { getCurrentVersion, verifySchema } from './lib/migrations';
import auth from './routes/auth';
import workflows from './routes/workflows';
import executions from './routes/executions';
import telemetry from './routes/telemetry';
import tokens from './routes/tokens';
import notifications from './routes/notifications';
import keys from './routes/keys';
import users from './routes/users';
import invites from './routes/invites';
import docs from './routes/docs';

// Create Hono app with environment bindings
const app = new Hono<{ Bindings: Env }>();

// Environment validation middleware
app.use('/*', async (c, next) => {
  // Check for required environment variables
  if (!c.env.ANTHROPIC_API_KEY && !c.env.OPENAI_API_KEY) {
    logger.warn('No AI API keys configured in environment. AI features will not work.');
  }
  
  if (!c.env.DB) {
    logger.error('D1 database not bound. Check wrangler.toml configuration.');
    return c.json({ error: 'Database not configured' }, 500);
  }
  
  if (!c.env.CACHE) {
    logger.warn('KV cache not bound. Rate limiting and caching disabled.');
  }
  
  await next();
});

// CORS middleware - Allow frontend to call backend
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://hummbl.io', 'https://*.hummbl.io', 'https://hummbl.vercel.app', 'https://*.vercel.app'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Health check with DB status
app.get('/', async (c) => {
  let dbStatus = 'unknown';
  let schemaVersion = 0;
  
  try {
    if (c.env.DB) {
      schemaVersion = await getCurrentVersion(c.env.DB);
      const verification = await verifySchema(c.env.DB);
      dbStatus = verification.valid ? 'healthy' : 'degraded';
    }
  } catch (error) {
    logger.error('Health check DB error', error);
    dbStatus = 'error';
  }
  
  return c.json({
    service: 'hummbl-backend',
    version: '1.0.0',
    status: 'operational',
    database: {
      status: dbStatus,
      schemaVersion,
    },
    timestamp: Date.now(),
  });
});

// API routes
app.route('/api/auth', auth);
app.route('/api/workflows', workflows);
app.route('/api/executions', executions);
app.route('/api/telemetry', telemetry);
app.route('/api/tokens', tokens);
app.route('/api/notifications', notifications);
app.route('/api/keys', keys);
app.route('/api/users', users);
app.route('/api/invites', invites);
app.route('/api/docs', docs);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  logger.error('Server error', err, {
    path: c.req.path,
    method: c.req.method,
  });
  return c.json(
    {
      error: 'Internal server error',
      message: err.message,
    },
    500
  );
});

export default app;
