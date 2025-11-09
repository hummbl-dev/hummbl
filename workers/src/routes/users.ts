/**
 * HUMMBL Users Routes
 *
 * Team management and user administration (Phase 3)
 *
 * @module routes/users
 * @version 3.0.0
 *
 * Mental Models:
 * - T2 (Collaboration): Multi-user team coordination
 * - T3 (Operations): User lifecycle management
 */

import { Hono } from 'hono';
import type { Env } from '../types';

const users = new Hono<{ Bindings: Env }>();

/**
 * Get all users in the organization
 * GET /api/users
 */
users.get('/', async (c) => {
  try {
    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    // Only owners and admins can see all users
    const currentUser = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(currentUserId).first();

    if (!currentUser || !['owner', 'admin'].includes(currentUser.role as string)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const result = await c.env.DB.prepare(`
      SELECT
        id, email, name, role, status, invited_by,
        joined_at, last_active_at, workflows_created, executions_run, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    return c.json({
      users: result.results.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        invitedBy: u.invited_by,
        joinedAt: u.joined_at ? (u.joined_at as number) * 1000 : null,
        lastActiveAt: u.last_active_at ? (u.last_active_at as number) * 1000 : null,
        workflowsCreated: u.workflows_created || 0,
        executionsRun: u.executions_run || 0,
        createdAt: (u.created_at as number) * 1000,
      })),
    });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      500
    );
  }
});

/**
 * Get current user profile
 * GET /api/users/me
 */
users.get('/me', async (c) => {
  try {
    const userId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    const result = await c.env.DB.prepare(`
      SELECT
        id, email, name, role, status, invited_by,
        joined_at, last_active_at, workflows_created, executions_run, created_at
      FROM users
      WHERE id = ?
    `).bind(userId).first();

    if (!result) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        status: result.status,
        invitedBy: result.invited_by,
        joinedAt: result.joined_at ? (result.joined_at as number) * 1000 : null,
        lastActiveAt: result.last_active_at ? (result.last_active_at as number) * 1000 : null,
        workflowsCreated: result.workflows_created || 0,
        executionsRun: result.executions_run || 0,
        createdAt: (result.created_at as number) * 1000,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user profile' },
      500
    );
  }
});

/**
 * Update user (role, status, etc.)
 * PATCH /api/users/:id
 */
users.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json<{
      name?: string;
      role?: string;
      status?: string;
    }>();

    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    // Check permissions
    const currentUser = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(currentUserId).first();

    if (!currentUser) {
      return c.json({ error: 'Current user not found' }, 404);
    }

    // Only owners can change roles, admins and owners can change status
    if (updates.role && currentUser.role !== 'owner') {
      return c.json({ error: 'Only owners can change user roles' }, 403);
    }

    if (updates.status && !['owner', 'admin'].includes(currentUser.role as string)) {
      return c.json({ error: 'Insufficient permissions to change user status' }, 403);
    }

    const setParts = [];
    const params = [];

    if (updates.name) {
      setParts.push('name = ?');
      params.push(updates.name);
    }

    if (updates.role) {
      setParts.push('role = ?');
      params.push(updates.role);
    }

    if (updates.status) {
      setParts.push('status = ?');
      params.push(updates.status);
    }

    if (setParts.length === 0) {
      return c.json({ error: 'No valid updates provided' }, 400);
    }

    params.push(id);

    const result = await c.env.DB.prepare(`
      UPDATE users
      SET ${setParts.join(', ')}
      WHERE id = ?
    `).bind(...params).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to update user' },
      500
    );
  }
});

/**
 * Remove user from organization
 * DELETE /api/users/:id
 */
users.delete('/:id', async (c) => {
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

    // Prevent deleting the last owner
    if (currentUser.role === 'owner') {
      const ownerCount = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM users WHERE role = 'owner' AND id != ?
      `).bind(id).first();

      if ((ownerCount?.count as number) === 0) {
        return c.json({ error: 'Cannot delete the last owner' }, 400);
      }
    }

    const result = await c.env.DB.prepare(`
      DELETE FROM users WHERE id = ?
    `).bind(id).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to delete user' },
      500
    );
  }
});

/**
 * Get team statistics
 * GET /api/users/stats
 */
users.get('/stats', async (c) => {
  try {
    const currentUserId = c.req.query('userId') || 'user-default'; // TODO: Get from auth

    // Check permissions
    const currentUser = await c.env.DB.prepare(`
      SELECT role FROM users WHERE id = ?
    `).bind(currentUserId).first();

    if (!currentUser || !['owner', 'admin'].includes(currentUser.role as string)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const stats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'member' THEN 1 END) as members,
        COUNT(CASE WHEN role = 'viewer' THEN 1 END) as viewers
      FROM users
    `).first();

    return c.json({
      stats: {
        totalUsers: stats?.total_users || 0,
        activeUsers: stats?.active_users || 0,
        owners: stats?.owners || 0,
        admins: stats?.admins || 0,
        members: stats?.members || 0,
        viewers: stats?.viewers || 0,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user stats' },
      500
    );
  }
});

export default users;
