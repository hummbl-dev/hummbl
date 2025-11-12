import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth, getAuthenticatedUserId } from '../lib/auth';
import { executeWorkflow, type WorkflowData } from '../services/executor';

const executions = new Hono<{ Bindings: Env }>();

executions.post('/', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userId = user?.id;
    const body = await c.req.json();
    
    console.log('Execution request received:', { 
      user,
      userId, 
      hasWorkflowData: !!body.workflowData,
      workflowId: body.workflowData?.id,
      workflowName: body.workflowData?.name,
      tasksCount: body.workflowData?.tasks?.length,
      agentsCount: body.workflowData?.agents?.length
    });
    
    if (!userId) {
      return c.json({ error: 'User ID not found in authentication context' }, 401);
    }
    
    if (!body.workflowData) {
      return c.json({ error: 'Missing workflowData in request body' }, 400);
    }
    
    if (!body.workflowData.tasks || body.workflowData.tasks.length === 0) {
      return c.json({ error: 'Workflow must have at least one task' }, 400);
    }
    
    if (!body.workflowData.agents || body.workflowData.agents.length === 0) {
      return c.json({ error: 'Workflow must have at least one agent' }, 400);
    }
    
    const result = await executeWorkflow(c.env, userId, body.workflowData, body.input, body.apiKeys);
    return c.json(result);
  } catch (error) {
    console.error('Error executing workflow:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ 
      error: 'Failed to execute workflow',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
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
