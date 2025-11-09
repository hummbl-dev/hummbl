/**
 * HUMMBL Telemetry Routes
 * 
 * BaseN Component tracking and metrics collection (T4: Observation)
 * 
 * @module routes/telemetry
 * @version 1.0.0
 * 
 * Mental Models:
 * - T4 (Observation): Measure everything to enable T5 (Adaptation)
 * - P1 (Perspective): Track user actions, not user identity
 */

import { Hono } from 'hono';
import type { Env } from '../types';

const telemetry = new Hono<{ Bindings: Env }>();

/**
 * Track user action
 * POST /api/telemetry/track
 */
telemetry.post('/track', async (c) => {
  try {
    const event = await c.req.json<{
      component: string;
      action: string;
      properties?: Record<string, unknown>;
      timestamp?: number;
      userId?: string;
      sessionId: string;
    }>();

    const now = event.timestamp || Date.now();
    const eventId = crypto.randomUUID();

    // Store user action in D1
    await c.env.DB.prepare(`
      INSERT INTO user_actions (id, user_id, session_id, action_type, component_id, payload, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      eventId,
      event.userId || null,
      event.sessionId,
      event.action,
      event.component,
      JSON.stringify(event.properties || {}),
      Math.floor(now / 1000)
    ).run();

    // Also cache in KV for real-time access (1 hour TTL)
    const cacheKey = `event:${event.sessionId}:${now}`;
    await c.env.CACHE.put(
      cacheKey,
      JSON.stringify(event),
      { expirationTtl: 3600 }
    );

    return c.json({ success: true, eventId });
  } catch (error) {
    console.error('Track error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to track event' },
      500
    );
  }
});

/**
 * Track component metric
 * POST /api/telemetry/metric
 */
telemetry.post('/metric', async (c) => {
  try {
    const metric = await c.req.json<{
      component: string;
      name: string;
      value: number;
      metadata?: Record<string, unknown>;
      userId?: string;
      sessionId?: string;
    }>();

    const metricId = crypto.randomUUID();
    const now = Date.now();

    await c.env.DB.prepare(`
      INSERT INTO component_metrics (id, component_id, metric_name, value, metadata, user_id, session_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      metricId,
      metric.component,
      metric.name,
      metric.value,
      JSON.stringify(metric.metadata || {}),
      metric.userId || null,
      metric.sessionId || null,
      Math.floor(now / 1000)
    ).run();

    return c.json({ success: true, metricId });
  } catch (error) {
    console.error('Metric error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to record metric' },
      500
    );
  }
});

/**
 * Get component metrics
 * GET /api/telemetry/metrics/:componentId
 */
telemetry.get('/metrics/:componentId', async (c) => {
  try {
    const componentId = c.req.param('componentId');
    const since = Number(c.req.query('since')) || Math.floor((Date.now() - 86400000) / 1000); // 24h default
    const limit = Number(c.req.query('limit')) || 1000;

    const results = await c.env.DB.prepare(`
      SELECT metric_name, value, metadata, timestamp
      FROM component_metrics
      WHERE component_id = ? AND timestamp > ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).bind(componentId, since, limit).all();

    return c.json({
      component: componentId,
      metrics: results.results,
      count: results.results.length
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch metrics' },
      500
    );
  }
});

/**
 * Get user actions
 * GET /api/telemetry/actions
 */
telemetry.get('/actions', async (c) => {
  try {
    const userId = c.req.query('userId');
    const componentId = c.req.query('componentId');
    const since = Number(c.req.query('since')) || Math.floor((Date.now() - 86400000) / 1000);
    const limit = Number(c.req.query('limit')) || 100;

    let query = `
      SELECT id, user_id, action_type, component_id, payload, timestamp
      FROM user_actions
      WHERE timestamp > ?
    `;
    const params: (string | number)[] = [since];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    if (componentId) {
      query += ' AND component_id = ?';
      params.push(componentId);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    const results = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      actions: results.results,
      count: results.results.length
    });
  } catch (error) {
    console.error('Get actions error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch actions' },
      500
    );
  }
});

/**
 * Get analytics summary (Phase 1 - updated for frontend)
 * GET /api/telemetry/summary?range=7d
 */
telemetry.get('/summary', async (c) => {
  try {
    const range = c.req.query('range') || '7d';
    const rangeMs = range === '7d' ? 604800000 : range === '30d' ? 2592000000 : 7776000000;
    const since = Math.floor((Date.now() - rangeMs) / 1000);

    // Get summary stats
    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(*) as total_actions,
        COUNT(CASE WHEN action_type = 'page_view' THEN 1 END) as page_views
      FROM user_actions
      WHERE timestamp > ?
    `).bind(since).first();

    // Get active components count
    const activeComponents = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT component_id) as count
      FROM user_actions
      WHERE timestamp > ?
    `).bind(since).first();

    // Get average response time from metrics
    const avgResponseTime = await c.env.DB.prepare(`
      SELECT AVG(value) as avg_time
      FROM component_metrics
      WHERE metric_type = 'response_time' AND timestamp > ?
    `).bind(since).first();

    return c.json({
      totalActions: (stats?.total_actions as number) || 0,
      uniqueUsers: (stats?.total_users as number) || 0,
      activeComponents: (activeComponents?.count as number) || 0,
      avgResponseTime: (avgResponseTime?.avg_time as number) || 0,
      period: range,
    });
  } catch (error) {
    console.error('Summary error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary' },
      500
    );
  }
});

/**
 * Get top components by usage (Phase 1 - new endpoint)
 * GET /api/telemetry/components/top?limit=10
 */
telemetry.get('/components/top', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 10;
    const since = Math.floor((Date.now() - 604800000) / 1000); // 7 days

    // Get top components with details
    const topComponents = await c.env.DB.prepare(`
      SELECT 
        bc.id,
        bc.code,
        bc.name,
        COUNT(CASE WHEN ua.action = 'page_view' THEN 1 END) as views,
        COUNT(*) as actions,
        AVG(CASE WHEN cm.metric_type = 'duration' THEN cm.value ELSE NULL END) as avg_duration
      FROM basen_components bc
      LEFT JOIN user_actions ua ON bc.id = ua.component_id AND ua.timestamp > ?
      LEFT JOIN component_metrics cm ON bc.id = cm.component_id AND cm.timestamp > ?
      WHERE bc.id IN (SELECT DISTINCT component_id FROM user_actions WHERE timestamp > ?)
      GROUP BY bc.id, bc.code, bc.name
      ORDER BY actions DESC
      LIMIT ?
    `).bind(since, since, since, limit).all();

    return c.json({
      components: topComponents.results.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        views: c.views || 0,
        actions: c.actions || 0,
        avgDuration: c.avg_duration || 0,
      })),
    });
  } catch (error) {
    console.error('Top components error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch top components' },
      500
    );
  }
});

/**
 * Register BaseN component
 * POST /api/telemetry/register-component
 */
telemetry.post('/register-component', async (c) => {
  try {
    const component = await c.req.json<{
      id: string;
      name: string;
      domain: string;
      route: string;
      transformations: string[];
      version?: string;
    }>();

    const now = Math.floor(Date.now() / 1000);

    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO basen_components (id, name, domain, route, transformations, version, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, true, ?, ?)
    `).bind(
      component.id,
      component.name,
      component.domain,
      component.route,
      JSON.stringify(component.transformations),
      component.version || '1.0.0',
      now,
      now
    ).run();

    return c.json({ success: true, componentId: component.id });
  } catch (error) {
    console.error('Register component error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to register component' },
      500
    );
  }
});

/**
 * Get all registered components
 * GET /api/telemetry/components
 */
telemetry.get('/components', async (c) => {
  try {
    const results = await c.env.DB.prepare(`
      SELECT id, name, domain, route, transformations, version, enabled
      FROM basen_components
      WHERE enabled = true
      ORDER BY domain, name
    `).all();

    return c.json({
      components: results.results.map(c => ({
        ...c,
        transformations: JSON.parse(c.transformations as string)
      })),
      count: results.results.length
    });
  } catch (error) {
    console.error('Get components error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch components' },
      500
    );
  }
});

export default telemetry;
