/**
 * HUMMBL Token Usage Routes
 * 
 * Track AI token consumption and costs (Phase 2.1)
 * 
 * @module routes/tokens
 * @version 2.0.0
 * 
 * Mental Models:
 * - T4 (Observation): Track costs to enable optimization
 * - DE3 (Decomposition): Break down by model, agent, workflow
 */

import { Hono } from 'hono';
import type { Env } from '../types';

const tokens = new Hono<{ Bindings: Env }>();

/**
 * Get token usage summary
 * GET /api/tokens/usage?range=30d
 */
tokens.get('/usage', async (c) => {
  try {
    const range = c.req.query('range') || '30d';
    const rangeMs = range === '7d' ? 604800000 : range === '30d' ? 2592000000 : 7776000000;
    const since = Math.floor((Date.now() - rangeMs) / 1000);

    // Get total token usage
    const totals = await c.env.DB.prepare(`
      SELECT 
        SUM(total_tokens) as total_tokens,
        SUM(cost_usd) as total_cost
      FROM token_usage
      WHERE created_at > ?
    `).bind(since).first();

    // Get usage by model
    const byModel = await c.env.DB.prepare(`
      SELECT 
        model,
        SUM(total_tokens) as tokens,
        SUM(cost_usd) as cost,
        COUNT(*) as call_count
      FROM token_usage
      WHERE created_at > ?
      GROUP BY model
      ORDER BY tokens DESC
    `).bind(since).all();

    // Calculate percentages
    const totalTokens = (totals?.total_tokens as number) || 0;
    const modelStats = byModel.results.map(m => ({
      model: m.model,
      tokens: m.tokens,
      cost: m.cost,
      percentage: totalTokens > 0 ? Math.round(((m.tokens as number) / totalTokens) * 100) : 0,
      callCount: m.call_count,
    }));

    // Get usage by agent
    const byAgent = await c.env.DB.prepare(`
      SELECT 
        agent_id,
        SUM(total_tokens) as tokens,
        SUM(cost_usd) as cost,
        COUNT(DISTINCT execution_id) as executions
      FROM token_usage
      WHERE created_at > ? AND agent_id IS NOT NULL
      GROUP BY agent_id
      ORDER BY tokens DESC
    `).bind(since).all();

    // Get previous period for comparison
    const prevSince = Math.floor((Date.now() - rangeMs * 2) / 1000);
    const prevTotals = await c.env.DB.prepare(`
      SELECT 
        SUM(total_tokens) as total_tokens,
        SUM(cost_usd) as total_cost
      FROM token_usage
      WHERE created_at > ? AND created_at <= ?
    `).bind(prevSince, since).first();

    // Calculate trends
    const prevTokens = (prevTotals?.total_tokens as number) || 0;
    const prevCost = (prevTotals?.total_cost as number) || 0;
    const tokensChange = prevTokens > 0 
      ? Math.round(((totalTokens - prevTokens) / prevTokens) * 100) 
      : 0;
    const costChange = prevCost > 0 
      ? Math.round((((totals?.total_cost as number || 0) - prevCost) / prevCost) * 100) 
      : 0;

    return c.json({
      totalTokens,
      totalCost: (totals?.total_cost as number) || 0,
      byModel: modelStats,
      byAgent: byAgent.results.map(a => ({
        agent: a.agent_id,
        tokens: a.tokens,
        cost: a.cost,
        executions: a.executions,
      })),
      trend: {
        tokensChange,
        costChange,
      },
      period: range,
    });
  } catch (error) {
    console.error('Token usage error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch token usage' },
      500
    );
  }
});

/**
 * Get token usage history (for charts)
 * GET /api/tokens/history?range=30d&granularity=day
 */
tokens.get('/history', async (c) => {
  try {
    const range = c.req.query('range') || '30d';
    const granularity = c.req.query('granularity') || 'day';
    const rangeMs = range === '7d' ? 604800000 : range === '30d' ? 2592000000 : 7776000000;
    const since = Math.floor((Date.now() - rangeMs) / 1000);

    // Calculate bucket size based on granularity
    const bucketSize = granularity === 'hour' ? 3600 : 86400; // seconds

    const history = await c.env.DB.prepare(`
      SELECT 
        (created_at / ${bucketSize}) * ${bucketSize} as time_bucket,
        SUM(total_tokens) as tokens,
        SUM(cost_usd) as cost,
        model
      FROM token_usage
      WHERE created_at > ?
      GROUP BY time_bucket, model
      ORDER BY time_bucket ASC
    `).bind(since).all();

    // Group by time bucket
    const grouped = new Map<number, { tokens: number; cost: number; byModel: Record<string, number> }>();
    
    for (const row of history.results) {
      const bucket = row.time_bucket as number;
      if (!grouped.has(bucket)) {
        grouped.set(bucket, { tokens: 0, cost: 0, byModel: {} });
      }
      const data = grouped.get(bucket)!;
      data.tokens += row.tokens as number;
      data.cost += row.cost as number;
      data.byModel[row.model as string] = (row.tokens as number);
    }

    const timeline = Array.from(grouped.entries()).map(([bucket, data]) => ({
      timestamp: bucket * 1000, // Convert to ms
      date: new Date(bucket * 1000).toISOString(),
      tokens: data.tokens,
      cost: data.cost,
      byModel: data.byModel,
    }));

    return c.json({
      timeline,
      granularity,
      period: range,
    });
  } catch (error) {
    console.error('Token history error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch token history' },
      500
    );
  }
});

/**
 * Record token usage (called during workflow execution)
 * POST /api/tokens/record
 */
tokens.post('/record', async (c) => {
  try {
    const usage = await c.req.json<{
      executionId: string;
      workflowId: string;
      agentId?: string;
      taskId?: string;
      model: string;
      promptTokens: number;
      completionTokens: number;
      costUsd: number;
    }>();

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(`
      INSERT INTO token_usage (
        id, execution_id, workflow_id, agent_id, task_id, 
        model, prompt_tokens, completion_tokens, total_tokens, cost_usd, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      usage.executionId,
      usage.workflowId,
      usage.agentId || null,
      usage.taskId || null,
      usage.model,
      usage.promptTokens,
      usage.completionTokens,
      usage.promptTokens + usage.completionTokens,
      usage.costUsd,
      now
    ).run();

    return c.json({ success: true, id });
  } catch (error) {
    console.error('Record token error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to record token usage' },
      500
    );
  }
});

/**
 * Get token usage by workflow
 * GET /api/tokens/by-workflow?workflowId=xxx
 */
tokens.get('/by-workflow', async (c) => {
  try {
    const workflowId = c.req.query('workflowId');
    if (!workflowId) {
      return c.json({ error: 'workflowId is required' }, 400);
    }

    const usage = await c.env.DB.prepare(`
      SELECT 
        workflow_id,
        model,
        SUM(total_tokens) as total_tokens,
        SUM(cost_usd) as total_cost,
        COUNT(*) as call_count,
        AVG(total_tokens) as avg_tokens,
        MAX(created_at) as last_used
      FROM token_usage
      WHERE workflow_id = ?
      GROUP BY workflow_id, model
      ORDER BY total_tokens DESC
    `).bind(workflowId).all();

    return c.json({
      workflowId,
      usage: usage.results,
    });
  } catch (error) {
    console.error('Workflow token usage error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch workflow token usage' },
      500
    );
  }
});

export default tokens;
