/**
 * HUMMBL API Keys Routes
 *
 * API key management system (Phase 2.3)
 *
 * @module routes/keys
 * @version 2.3.0
 *
 * Mental Models:
 * - T1 (Security): Encrypted storage, controlled access
 * - T3 (Operations): Key lifecycle management
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth, getAuthenticatedUserId } from '../lib/auth';

const keys = new Hono<{ Bindings: Env }>();

/**
 * Get user's API keys
 * GET /api/keys
 */
keys.get('/', requireAuth, async (c) => {
  try {
    const userId = getAuthenticatedUserId(c);

    const result = await c.env.DB.prepare(`
      SELECT
        id, user_id, name, service, usage_count, last_used_at,
        status, created_at
      FROM api_keys
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(userId).all();

    return c.json({
      keys: result.results.map(k => ({
        id: k.id,
        name: k.name,
        service: k.service,
        usageCount: k.usage_count || 0,
        lastUsedAt: k.last_used_at ? (k.last_used_at as number) * 1000 : null,
        status: k.status,
        createdAt: (k.created_at as number) * 1000,
      })),
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch API keys' },
      500
    );
  }
});

/**
 * Create new API key
 * POST /api/keys
 */
keys.post('/', requireAuth, async (c) => {
  try {
    const keyData = await c.req.json<{
      name: string;
      service: string;
      key: string; // Plain text key to encrypt
    }>();

    const userId = getAuthenticatedUserId(c);
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    // Simple encryption (in production, use proper encryption)
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(keyData.key);
    const encrypted = btoa(String.fromCharCode(...keyBytes)); // Base64 encode

    // Create hash for verification
    const hash = await crypto.subtle.digest('SHA-256', keyBytes);
    const keyHash = btoa(String.fromCharCode(...new Uint8Array(hash)));

    await c.env.DB.prepare(`
      INSERT INTO api_keys (
        id, user_id, name, service, key_encrypted, key_hash,
        status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `).bind(
      id,
      userId,
      keyData.name,
      keyData.service,
      encrypted,
      keyHash,
      now
    ).run();

    return c.json({
      success: true,
      key: {
        id,
        name: keyData.name,
        service: keyData.service,
        status: 'active',
        createdAt: now * 1000,
      }
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to create API key' },
      500
    );
  }
});

/**
 * Update API key
 * PATCH /api/keys/:id
 */
keys.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json<{
      name?: string;
      status?: string;
    }>();

    const setParts = [];
    const params = [];

    if (updates.name) {
      setParts.push('name = ?');
      params.push(updates.name);
    }

    if (updates.status) {
      setParts.push('status = ?');
      params.push(updates.status);
    }

    if (setParts.length === 0) {
      return c.json({ error: 'No valid updates provided' }, 400);
    }

    params.push(id);

    await c.env.DB.prepare(`
      UPDATE api_keys
      SET ${setParts.join(', ')}
      WHERE id = ?
    `).bind(...params).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Update API key error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to update API key' },
      500
    );
  }
});

/**
 * Delete API key
 * DELETE /api/keys/:id
 */
keys.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const result = await c.env.DB.prepare(`
      DELETE FROM api_keys WHERE id = ?
    `).bind(id).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'API key not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to delete API key' },
      500
    );
  }
});

/**
 * Get API key usage stats
 * GET /api/keys/stats
 */
keys.get('/stats', requireAuth, async (c) => {
  try {
    const userId = getAuthenticatedUserId(c);

    const stats = await c.env.DB.prepare(`
      SELECT
        service,
        COUNT(*) as count,
        SUM(usage_count) as total_usage,
        AVG(usage_count) as avg_usage
      FROM api_keys
      WHERE user_id = ? AND status = 'active'
      GROUP BY service
    `).bind(userId).all();

    return c.json({
      stats: stats.results.map(s => ({
        service: s.service,
        count: s.count,
        totalUsage: s.total_usage || 0,
        avgUsage: s.avg_usage || 0,
      })),
    });
  } catch (error) {
    console.error('Get API key stats error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch API key stats' },
      500
    );
  }
});

/**
 * Validate API key (for external use)
 * POST /api/keys/validate
 */
keys.post('/validate', async (c) => {
  try {
    const { service, key } = await c.req.json<{ service: string; key: string }>();

    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(key);
    const hash = await crypto.subtle.digest('SHA-256', keyBytes);
    const keyHash = btoa(String.fromCharCode(...new Uint8Array(hash)));

    const result = await c.env.DB.prepare(`
      SELECT id, name, status
      FROM api_keys
      WHERE service = ? AND key_hash = ? AND status = 'active'
      LIMIT 1
    `).bind(service, keyHash).first();

    if (result) {
      // Update usage count and last used
      const now = Math.floor(Date.now() / 1000);
      await c.env.DB.prepare(`
        UPDATE api_keys
        SET usage_count = usage_count + 1, last_used_at = ?
        WHERE id = ?
      `).bind(now, result.id).run();

      return c.json({
        valid: true,
        keyId: result.id,
        name: result.name
      });
    } else {
      return c.json({ valid: false }, 401);
    }
  } catch (error) {
    console.error('Validate API key error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to validate API key' },
      500
    );
  }
});

export default keys;
