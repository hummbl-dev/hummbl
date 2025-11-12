import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth, getAuthenticatedUserId } from '../lib/auth';
import { executeWorkflow, type WorkflowData } from '../services/executor';

const executions = new Hono<{ Bindings: Env }>();

executions.post('/', requireAuth, async (c) => {
  const userId = getAuthenticatedUserId(c);
  const body = await c.req.json();
  const result = await executeWorkflow(c.env, userId, body.workflowData, body.input);
  return c.json(result);
});

executions.get('/:id', requireAuth, async (c) => {
  const userId = getAuthenticatedUserId(c);
  const executionId = c.req.param('id');
  const execution = await c.env.DB.prepare('SELECT * FROM executions WHERE id = ? AND user_id = ?').bind(executionId, userId).first();
  if (!execution) return c.json({ error: 'Not found' }, 404);
  const tasks = await c.env.DB.prepare('SELECT * FROM execution_tasks WHERE execution_id = ?').bind(executionId).all();
  return c.json({ execution, tasks: tasks.results });
});

executions.get('/', requireAuth, async (c) => {
  const userId = getAuthenticatedUserId(c);
  const result = await c.env.DB.prepare('SELECT * FROM executions WHERE user_id = ? ORDER BY started_at DESC LIMIT 20').bind(userId).all();
  return c.json({ executions: result.results });
});

export default executions;
