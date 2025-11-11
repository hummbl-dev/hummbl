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
import { sendEmail, generateVerificationEmail } from '../lib/email';

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
      'SELECT id, email, password_hash, name, role, is_active, email_verified FROM users WHERE email = ?'
    )
      .bind(email.toLowerCase())
      .first<{
        id: string;
        email: string;
        password_hash: string;
        name: string;
        role: string;
        is_active: number;
        email_verified: number;
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
        emailVerified: user.email_verified === 1,
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
      emailVerified: user.email_verified === 1,
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
      `INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, email.toLowerCase(), passwordHash, name || null, 'user', 1, now, now, 0)
      .run();

    // Generate verification token
    const verificationToken = crypto.randomUUID().replace(/-/g, '');
    const verificationId = `verify-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = now + (24 * 60 * 60); // 24 hours

    await c.env.DB.prepare(
      `INSERT INTO email_verifications (id, user_id, token, email, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(verificationId, userId, verificationToken, email.toLowerCase(), expiresAt, now)
      .run();

    // Send verification email
    const appUrl = c.env.APP_URL || 'https://hummbl.vercel.app';
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;
    const emailContent = generateVerificationEmail(name || email, verificationUrl);

    await sendEmail(
      {
        to: email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      },
      c.env
    );

    // Create session (user can use app while unverified, but with limited access)
    const token = await createSession(userId, c.env.DB);

    logger.info('User registered, verification email sent', { userId, email });

    return c.json(
      {
        success: true,
        token,
        user: {
          id: userId,
          email: email.toLowerCase(),
          name,
          role: 'user',
          emailVerified: false,
        },
        message: 'Account created! Please check your email to verify your account.',
      },
      201
    );
  } catch (error) {
    logger.error('Registration failed', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

/**
 * GET /auth/verify-email/:token
 * Verify email address with token
 */
app.get('/verify-email/:token', async (c) => {
  try {
    const token = c.req.param('token');

    if (!token) {
      return c.json({ error: 'Verification token required' }, 400);
    }

    const now = Math.floor(Date.now() / 1000);

    // Get verification record
    const verification = await c.env.DB.prepare(
      `SELECT id, user_id, email, expires_at, verified_at
       FROM email_verifications
       WHERE token = ?`
    )
      .bind(token)
      .first<{
        id: string;
        user_id: string;
        email: string;
        expires_at: number;
        verified_at: number | null;
      }>();

    if (!verification) {
      return c.json({ error: 'Invalid verification token' }, 404);
    }

    if (verification.verified_at) {
      return c.json({ error: 'Email already verified' }, 400);
    }

    if (verification.expires_at < now) {
      return c.json({ error: 'Verification token expired' }, 400);
    }

    // Update user and verification record
    await c.env.DB.batch([
      c.env.DB.prepare(
        `UPDATE users
         SET email_verified = 1, email_verified_at = ?, updated_at = ?
         WHERE id = ?`
      ).bind(now, now, verification.user_id),
      c.env.DB.prepare(
        `UPDATE email_verifications
         SET verified_at = ?
         WHERE id = ?`
      ).bind(now, verification.id),
    ]);

    logger.info('Email verified', { userId: verification.user_id, email: verification.email });

    return c.json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    logger.error('Email verification failed', error);
    return c.json({ error: 'Verification failed' }, 500);
  }
});

/**
 * POST /auth/resend-verification
 * Resend verification email
 */
app.post('/resend-verification', requireAuth, async (c) => {
  try {
    const user = c.get('user');

    // Check if already verified
    const userRecord = await c.env.DB.prepare(
      'SELECT email_verified FROM users WHERE id = ?'
    )
      .bind(user.id)
      .first<{ email_verified: number }>();

    if (userRecord?.email_verified) {
      return c.json({ error: 'Email already verified' }, 400);
    }

    // Check for recent verification emails (rate limit: 1 per 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = now - (5 * 60);

    const recentVerification = await c.env.DB.prepare(
      `SELECT id FROM email_verifications
       WHERE user_id = ? AND created_at > ?
       ORDER BY created_at DESC
       LIMIT 1`
    )
      .bind(user.id, fiveMinutesAgo)
      .first();

    if (recentVerification) {
      return c.json(
        { error: 'Please wait 5 minutes before requesting another verification email' },
        429
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomUUID().replace(/-/g, '');
    const verificationId = `verify-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = now + (24 * 60 * 60); // 24 hours

    await c.env.DB.prepare(
      `INSERT INTO email_verifications (id, user_id, token, email, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(verificationId, user.id, verificationToken, user.email, expiresAt, now)
      .run();

    // Send verification email
    const appUrl = c.env.APP_URL || 'https://hummbl.vercel.app';
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;
    const emailContent = generateVerificationEmail(user.name || user.email, verificationUrl);

    const sent = await sendEmail(
      {
        to: user.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      },
      c.env
    );

    if (!sent) {
      return c.json({ error: 'Failed to send verification email' }, 500);
    }

    logger.info('Verification email resent', { userId: user.id, email: user.email });

    return c.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    logger.error('Failed to resend verification email', error);
    return c.json({ error: 'Failed to send verification email' }, 500);
  }
});

export default app;
