/**
 * HUMMBL Backend - Cloudflare Workers Entry Point
 * Hono.js API with CORS middleware
 * Base120 T5 (Execution): Global edge orchestration
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import workflows from './routes/workflows';
import executions from './routes/executions';
import telemetry from './routes/telemetry';
import tokens from './routes/tokens';
import notifications from './routes/notifications';
import keys from './routes/keys';

// Create Hono app with environment bindings
const app = new Hono<{ Bindings: Env }>();

// CORS middleware - Allow frontend to call backend
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://hummbl.io', 'https://*.hummbl.io', 'https://hummbl.vercel.app', 'https://*.vercel.app'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({
    service: 'hummbl-backend',
    version: '1.0.0',
    status: 'operational',
    timestamp: Date.now(),
  });
});

// API routes
app.route('/api/workflows', workflows);
app.route('/api/executions', executions);
app.route('/api/telemetry', telemetry);
app.route('/api/tokens', tokens);
app.route('/api/notifications', notifications);
app.route('/api/keys', keys);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      error: 'Internal server error',
      message: err.message,
    },
    500
  );
});

export default app;
