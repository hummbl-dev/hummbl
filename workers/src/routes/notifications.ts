/**
 * HUMMBL Notifications Routes
 * 
 * User notification system (Phase 2.2)
 * 
 * @module routes/notifications
 * @version 2.0.0
 * 
 * Mental Models:
 * - T4 (Observation): Track events to notify users
 * - P1 (Perspective): User-centric alerts
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth, getAuthenticatedUserId } from '../lib/auth';

const notifications = new Hono<{ Bindings: Env }>();

/**
 * Get user notifications
 * GET /api/notifications?unreadOnly=true&category=workflow&limit=50
 */
notifications.get('/', requireAuth, async (c) => {
  try {
    const unreadOnly = c.req.query('unreadOnly') === 'true';
    const category = c.req.query('category'); // workflow, system, team, billing
    const limit = Number(c.req.query('limit')) || 50;
    const userId = getAuthenticatedUserId(c);

    let query = `
      SELECT id, user_id, type, category, title, message, 
             action_url, action_label, read, read_at, created_at
      FROM notifications
      WHERE user_id = ? OR user_id IS NULL
    `;
    
    const params: (string | number)[] = [userId];

    if (unreadOnly) {
      query += ` AND read = 0`;
    }

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    const result = await c.env.DB.prepare(query).bind(...params).all();

    // Get unread count
    const unreadCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE (user_id = ? OR user_id IS NULL) AND read = 0
    `).bind(userId).first();

    return c.json({
      notifications: result.results.map(n => ({
        id: n.id,
        type: n.type,
        category: n.category,
        title: n.title,
        message: n.message,
        actionUrl: n.action_url,
        actionLabel: n.action_label,
        read: Boolean(n.read),
        readAt: n.read_at ? (n.read_at as number) * 1000 : null,
        createdAt: (n.created_at as number) * 1000,
      })),
      unreadCount: (unreadCount?.count as number) || 0,
      total: result.results.length,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      500
    );
  }
});

/**
 * Create notification
 * POST /api/notifications
 */
notifications.post('/', async (c) => {
  try {
    const notification = await c.req.json<{
      userId?: string;
      type: string; // success, error, warning, info
      category: string; // workflow, system, team, billing
      title: string;
      message: string;
      actionUrl?: string;
      actionLabel?: string;
    }>();

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(`
      INSERT INTO notifications (
        id, user_id, type, category, title, message, 
        action_url, action_label, read, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).bind(
      id,
      notification.userId || null,
      notification.type,
      notification.category,
      notification.title,
      notification.message,
      notification.actionUrl || null,
      notification.actionLabel || null,
      now
    ).run();

    return c.json({ success: true, id });
  } catch (error) {
    console.error('Create notification error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to create notification' },
      500
    );
  }
});

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
notifications.patch('/:id/read', async (c) => {
  try {
    const id = c.req.param('id');
    const now = Math.floor(Date.now() / 1000);

    const result = await c.env.DB.prepare(`
      UPDATE notifications
      SET read = 1, read_at = ?
      WHERE id = ?
    `).bind(now, id).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to mark as read' },
      500
    );
  }
});

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
notifications.patch('/read-all', requireAuth, async (c) => {
  try {
    const userId = getAuthenticatedUserId(c);
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(`
      UPDATE notifications
      SET read = 1, read_at = ?
      WHERE (user_id = ? OR user_id IS NULL) AND read = 0
    `).bind(now, userId).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to mark all as read' },
      500
    );
  }
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
notifications.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const result = await c.env.DB.prepare(`
      DELETE FROM notifications WHERE id = ?
    `).bind(id).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to delete notification' },
      500
    );
  }
});

/**
 * Clear read notifications
 * DELETE /api/notifications/clear-read
 */
notifications.delete('/clear-read', requireAuth, async (c) => {
  try {
    const userId = getAuthenticatedUserId(c);

    await c.env.DB.prepare(`
      DELETE FROM notifications
      WHERE (user_id = ? OR user_id IS NULL) AND read = 1
    `).bind(userId).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Clear read error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to clear read notifications' },
      500
    );
  }
});

export default notifications;
