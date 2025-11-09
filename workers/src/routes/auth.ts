/**
 * Authentication Routes
 * 
 * Handles login, logout, and token management
 * 
 * @module workers/routes/auth
 * @version 1.0.0
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { createLogger } from '../lib/logger';
import {
  createSession,
  deleteSession,
  extractBearerToken,
  hashPassword,
  requireAuth,
  verifyPassword,
} from '../lib/auth';
import { rateLimit, RATE_LIMITS } from '../lib/rateLimit';

const logger = createLogger('AuthRoutes');
const app = new Hono<{ Bindings: Env }>();

// Apply rate limiting to all auth routes
app.use('*', rateLimit(RATE_LIMITS.auth));

/**
 * POST /auth/login
 * Authenticate user and create session
 */
app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    // Get user from database
    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = ?'
    )
      .bind(email.toLowerCase())
      .first<{
        id: string;
        email: string;
        password_hash: string;
        name: string;
        role: string;
        is_active: number;
      }>();

    if (!user) {
      logger.warn('Login attempt for non-existent user', { email });
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    if (!user.is_active) {
      logger.warn('Login attempt for inactive user', { email });
      return c.json({ error: 'Account disabled' }, 403);
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      logger.warn('Invalid password attempt', { email });
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Create session
    const token = await createSession(user.id, c.env.DB);

    logger.info('User logged in', { userId: user.id, email: user.email });

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login failed', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

/**
 * POST /auth/logout
 * Delete session token
 */
app.post('/logout', requireAuth, async (c) => {
  try {
    const authHeader = c.req.header('Authorization') || null;
    const token = extractBearerToken(authHeader);

    if (token) {
      await deleteSession(token, c.env.DB);
    }

    logger.info('User logged out');

    return c.json({ success: true });
  } catch (error) {
    logger.error('Logout failed', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
});

/**
 * GET /auth/me
 * Get current user info
 */
app.get('/me', requireAuth, async (c) => {
  const user = c.get('user');

  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

/**
 * POST /auth/register
 * Create new user account
 */
app.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }

    // Check if user exists
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first();

    if (existing) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, email.toLowerCase(), passwordHash, name || null, 'user', 1, now, now)
      .run();

    // Create session
    const token = await createSession(userId, c.env.DB);

    logger.info('User registered', { userId, email });

    return c.json(
      {
        success: true,
        token,
        user: {
          id: userId,
          email: email.toLowerCase(),
          name,
          role: 'user',
        },
      },
      201
    );
  } catch (error) {
    logger.error('Registration failed', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

export default app;
