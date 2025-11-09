/**
 * Authentication Middleware
 * 
 * JWT-based authentication for protected routes
 * 
 * @module workers/lib/auth
 * @version 1.0.0
 */

import { Context } from 'hono';
import { createLogger } from './logger';
import type { Env } from '../types';

const logger = createLogger('Auth');

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user' | 'viewer';
  is_active?: boolean;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
}

// Extend Hono context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: User;
  }
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify session token and get user
 */
export async function verifyToken(
  token: string,
  db: D1Database
): Promise<User | null> {
  try {
    // Get session from database
    const session = await db
      .prepare(
        `SELECT s.*, u.email, u.name, u.role, u.is_active
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.token = ? AND s.expires_at > ?`
      )
      .bind(token, Math.floor(Date.now() / 1000))
      .first<Session & User>();

    if (!session) {
      logger.debug('Invalid or expired token');
      return null;
    }

    if (!session.is_active) {
      logger.warn('Inactive user attempted access', { userId: session.userId });
      return null;
    }

    return {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    };
  } catch (error) {
    logger.error('Token verification failed', error);
    return null;
  }
}

/**
 * Authentication middleware
 * Requires valid session token
 */
export async function requireAuth(
  c: Context<{ Bindings: Env }>,
  next: () => Promise<void>
) {
  const authHeader = c.req.header('Authorization') || null;
  const token = extractBearerToken(authHeader);

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const user = await verifyToken(token, c.env.DB);

  if (!user) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Attach user to context
  c.set('user', user);

  await next();
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...allowedRoles: Array<'admin' | 'user' | 'viewer'>) {
  return async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
    const user = c.get('user') as User | undefined;

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      logger.warn('Insufficient permissions', {
        userId: user.id,
        role: user.role,
        required: allowedRoles,
      });
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
}

/**
 * Create new session token
 */
export async function createSession(
  userId: string,
  db: D1Database,
  ttl: number = 7 * 24 * 60 * 60 // 7 days
): Promise<string> {
  const token = generateToken();
  const sessionId = generateId();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + ttl;

  await db
    .prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(sessionId, userId, token, expiresAt, now)
    .run();

  logger.info('Session created', { userId, expiresAt });

  return token;
}

/**
 * Delete session (logout)
 */
export async function deleteSession(token: string, db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  logger.info('Session deleted');
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(db: D1Database): Promise<number> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare('DELETE FROM sessions WHERE expires_at < ?')
    .bind(now)
    .run();

  const deleted = result.meta.changes || 0;
  if (deleted > 0) {
    logger.info(`Cleaned up ${deleted} expired sessions`);
  }

  return deleted;
}

/**
 * Generate secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Hash password (using Web Crypto API)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
