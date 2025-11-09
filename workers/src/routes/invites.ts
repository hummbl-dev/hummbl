/**
 * HUMMBL Invites Routes
 *
 * User invitation system for team management (Phase 3)
 *
 * @module routes/invites
 * @version 3.0.0
 *
 * Mental Models:
 * - T2 (Collaboration): Team member onboarding
 * - T3 (Operations): Invitation lifecycle management
 */

import { Hono } from 'hono';
import type { Env } from '../types';

const invites = new Hono<{ Bindings: Env }>();

/**
 * Get pending invitations
 * GET /api/invites
 */
invites.get('/', async (c) => {
  try {
    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    // Check permissions
    const currentUser = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(currentUserId).first();

    if (!currentUser || !['owner', 'admin'].includes(currentUser.role as string)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const result = await c.env.DB.prepare(`
      SELECT
        i.id, i.email, i.role, i.invited_by, i.expires_at, i.accepted, i.accepted_at, i.created_at,
        u.name as invited_by_name
      FROM invites i
      LEFT JOIN users u ON i.invited_by = u.id
      WHERE i.accepted = 0 AND i.expires_at > ?
      ORDER BY i.created_at DESC
    `).bind(Math.floor(Date.now() / 1000)).all();

    return c.json({
      invites: result.results.map(i => ({
        id: i.id,
        email: i.email,
        role: i.role,
        invitedBy: i.invited_by,
        invitedByName: i.invited_by_name,
        expiresAt: (i.expires_at as number) * 1000,
        accepted: Boolean(i.accepted),
        acceptedAt: i.accepted_at ? (i.accepted_at as number) * 1000 : null,
        createdAt: (i.created_at as number) * 1000,
      })),
    });
  } catch (error) {
    console.error('Get invites error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch invites' },
      500
    );
  }
});

/**
 * Send invitation
 * POST /api/invites
 */
invites.post('/', async (c) => {
  try {
    const inviteData = await c.req.json<{
      email: string;
      role: string;
    }>();

    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    // Check permissions
    const currentUser = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(currentUserId).first();

    if (!currentUser || !['owner', 'admin'].includes(currentUser.role as string)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(inviteData.email).first();

    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }

    // Check if invitation already exists
    const existingInvite = await c.env.DB.prepare(`
      SELECT id FROM invites WHERE email = ? AND accepted = 0 AND expires_at > ?
    `).bind(inviteData.email, Math.floor(Date.now() / 1000)).first();

    if (existingInvite) {
      return c.json({ error: 'Invitation already sent to this email' }, 400);
    }

    const id = crypto.randomUUID();
    const token = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (7 * 24 * 60 * 60); // 7 days

    await c.env.DB.prepare(`
      INSERT INTO invites (
        id, email, role, token, invited_by, expires_at, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      inviteData.email,
      inviteData.role,
      token,
      currentUserId,
      expiresAt,
      now
    ).run();

    return c.json({
      success: true,
      invite: {
        id,
        email: inviteData.email,
        role: inviteData.role,
        token,
        expiresAt: expiresAt * 1000,
        createdAt: now * 1000,
      }
    });
  } catch (error) {
    console.error('Create invite error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to create invitation' },
      500
    );
  }
});

/**
 * Accept invitation
 * POST /api/invites/:token/accept
 */
invites.post('/:token/accept', async (c) => {
  try {
    const token = c.req.param('token');
    const userData = await c.req.json<{
      name: string;
      password?: string; // For future auth implementation
    }>();

    // Find the invitation
    const invite = await c.env.DB.prepare(`
      SELECT * FROM invites WHERE token = ? AND accepted = 0 AND expires_at > ?
    `).bind(token, Math.floor(Date.now() / 1000)).first();

    if (!invite) {
      return c.json({ error: 'Invalid or expired invitation' }, 400);
    }

    const now = Math.floor(Date.now() / 1000);
    const userId = crypto.randomUUID();

    // Create the user
    await c.env.DB.prepare(`
      INSERT INTO users (
        id, email, name, role, status, invited_by, joined_at, created_at
      )
      VALUES (?, ?, ?, ?, 'active', ?, ?, ?)
    `).bind(
      userId,
      invite.email,
      userData.name,
      invite.role,
      invite.invited_by,
      now,
      now
    ).run();

    // Mark invitation as accepted
    await c.env.DB.prepare(`
      UPDATE invites
      SET accepted = 1, accepted_at = ?
      WHERE id = ?
    `).bind(now, invite.id).run();

    return c.json({
      success: true,
      user: {
        id: userId,
        email: invite.email,
        name: userData.name,
        role: invite.role,
        joinedAt: now * 1000,
      }
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to accept invitation' },
      500
    );
  }
});

/**
 * Cancel invitation
 * DELETE /api/invites/:id
 */
invites.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    // Check permissions
    const currentUser = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(currentUserId).first();

    if (!currentUser || !['owner', 'admin'].includes(currentUser.role as string)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const result = await c.env.DB.prepare(`
      DELETE FROM invites WHERE id = ? AND accepted = 0
    `).bind(id).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Invitation not found or already accepted' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete invite error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel invitation' },
      500
    );
  }
});

/**
 * Resend invitation
 * POST /api/invites/:id/resend
 */
invites.post('/:id/resend', async (c) => {
  try {
    const id = c.req.param('id');
    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    // Check permissions
    const currentUser = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(currentUserId).first();

    if (!currentUser || !['owner', 'admin'].includes(currentUser.role as string)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const now = Math.floor(Date.now() / 1000);
    const newExpiresAt = now + (7 * 24 * 60 * 60); // 7 days from now

    const result = await c.env.DB.prepare(`
      UPDATE invites
      SET expires_at = ?, created_at = ?
      WHERE id = ? AND accepted = 0
    `).bind(newExpiresAt, now, id).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Invitation not found or already accepted' }, 404);
    }

    return c.json({
      success: true,
      newExpiresAt: newExpiresAt * 1000
    });
  } catch (error) {
    console.error('Resend invite error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to resend invitation' },
      500
    );
  }
});

export default invites;
