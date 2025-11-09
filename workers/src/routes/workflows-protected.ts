/**
 * Protected Workflow Routes Example
 * 
 * Shows how to protect workflow management endpoints with authentication
 * 
 * @module workers/routes/workflows-protected
 */

import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth, requireRole } from '../lib/auth';
import { rateLimit, RATE_LIMITS } from '../lib/rateLimit';
import { createLogger } from '../lib/logger';

const logger = createLogger('WorkflowsProtected');
const app = new Hono<{ Bindings: Env }>();

// Apply rate limiting to all workflow management endpoints
app.use('*', rateLimit(RATE_LIMITS.general));

/**
 * GET /workflows
 * List user's workflows (authenticated)
 */
app.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  
  try {
    const workflows = await c.env.DB.prepare(
      `SELECT id, name, description, status, created_at, updated_at
       FROM workflows
       WHERE user_id = ?
       ORDER BY updated_at DESC
       LIMIT 100`
    )
      .bind(user.id)
      .all();

    return c.json({
      success: true,
      workflows: workflows.results || [],
    });
  } catch (error) {
    logger.error('Failed to fetch workflows', error);
    return c.json({ error: 'Failed to fetch workflows' }, 500);
  }
});

/**
 * POST /workflows
 * Create new workflow (authenticated)
 */
app.post('/', requireAuth, async (c) => {
  const user = c.get('user');
  
  try {
    const body = await c.req.json();
    const { name, description, workflow_data } = body;

    if (!name) {
      return c.json({ error: 'Workflow name required' }, 400);
    }

    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(
      `INSERT INTO workflows (id, user_id, name, description, workflow_data, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        workflowId,
        user.id,
        name,
        description || null,
        JSON.stringify(workflow_data || {}),
        'draft',
        now,
        now
      )
      .run();

    logger.info('Workflow created', { workflowId, userId: user.id });

    return c.json(
      {
        success: true,
        workflow: {
          id: workflowId,
          name,
          description,
          status: 'draft',
          created_at: now,
        },
      },
      201
    );
  } catch (error) {
    logger.error('Failed to create workflow', error);
    return c.json({ error: 'Failed to create workflow' }, 500);
  }
});

/**
 * DELETE /workflows/:id
 * Delete workflow (owner or admin only)
 */
app.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const workflowId = c.req.param('id');

  try {
    // Check ownership or admin role
    const workflow = await c.env.DB.prepare(
      'SELECT user_id FROM workflows WHERE id = ?'
    )
      .bind(workflowId)
      .first<{ user_id: string }>();

    if (!workflow) {
      return c.json({ error: 'Workflow not found' }, 404);
    }

    if (workflow.user_id !== user.id && user.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await c.env.DB.prepare('DELETE FROM workflows WHERE id = ?').bind(workflowId).run();

    logger.info('Workflow deleted', { workflowId, userId: user.id });

    return c.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete workflow', error);
    return c.json({ error: 'Failed to delete workflow' }, 500);
  }
});

/**
 * GET /admin/workflows
 * List all workflows (admin only)
 */
app.get('/admin/workflows', requireAuth, requireRole('admin'), async (c) => {
  try {
    const workflows = await c.env.DB.prepare(
      `SELECT w.*, u.email as user_email
       FROM workflows w
       LEFT JOIN users u ON w.user_id = u.id
       ORDER BY w.updated_at DESC
       LIMIT 1000`
    ).all();

    return c.json({
      success: true,
      workflows: workflows.results || [],
    });
  } catch (error) {
    logger.error('Failed to fetch all workflows', error);
    return c.json({ error: 'Failed to fetch workflows' }, 500);
  }
});

export default app;
