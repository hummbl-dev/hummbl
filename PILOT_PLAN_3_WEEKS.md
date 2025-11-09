# HUMMBL PILOT: 8 Pages in 3 Weeks
**BaseN Model Validation** | **Option C → A Strategy**  
**Start**: 2025-11-08 | **End**: 2025-11-29  
**Decision Point**: 2025-12-02 (Go/No-Go for Phase 1)

---

## 🎯 Pilot Objective

**Prove**: BaseN component model scales efficiently  
**Validate**: T4 (Observation) foundation works  
**Measure**: User adoption of analytics/monitoring features  
**Decide**: Proceed with 32-page Phase 1 or pivot

---

## 📊 Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Pages Built** | 8/8 | Count |
| **Build Time** | <120 hours | Time tracking |
| **Code Reuse** | >70% | Component analysis |
| **User Adoption** | >60% use analytics | Telemetry data |
| **Performance** | <1s page load | Metrics |
| **Error Rate** | <1% | Error logs |

**Go/No-Go Decision**: If ≥5/6 metrics hit target → Phase 1

---

## 🏗️ Architecture: BaseN Foundation

### Database Schema (D1)

```sql
-- BaseN Component Registry
CREATE TABLE basen_components (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  route TEXT NOT NULL,
  transformations TEXT,  -- JSON: ["T1", "T4"]
  version TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Component Metrics (T4 Observation)
CREATE TABLE component_metrics (
  id TEXT PRIMARY KEY,
  component_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value REAL NOT NULL,
  metadata TEXT,  -- JSON: additional context
  user_id TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (component_id) REFERENCES basen_components(id)
);

-- User Actions (Telemetry)
CREATE TABLE user_actions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action_type TEXT NOT NULL,
  component_id TEXT,
  payload TEXT,  -- JSON: action details
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (component_id) REFERENCES basen_components(id)
);

-- Indexes
CREATE INDEX idx_metrics_component ON component_metrics(component_id);
CREATE INDEX idx_metrics_timestamp ON component_metrics(timestamp);
CREATE INDEX idx_actions_user ON user_actions(user_id);
CREATE INDEX idx_actions_timestamp ON user_actions(timestamp);
```

### Telemetry SDK

```typescript
// src/services/telemetry.ts (Enhanced)
export interface BaseNEvent {
  component: string;
  action: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export class HUMMBLTelemetry {
  private static apiUrl = import.meta.env.DEV
    ? 'http://localhost:8787'
    : 'https://hummbl-backend.hummbl.workers.dev';

  static track(event: BaseNEvent): void {
    const fullEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
    };

    // Send to backend
    fetch(`${this.apiUrl}/api/telemetry/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullEvent),
    }).catch(err => console.warn('Telemetry failed:', err));

    // Also log to Vercel Analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('event', event.action, event.properties);
    }
  }

  static pageView(component: string, properties?: Record<string, unknown>): void {
    this.track({
      component,
      action: 'page_view',
      properties: {
        ...properties,
        path: window.location.pathname,
        referrer: document.referrer,
      },
    });
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('hummbl_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('hummbl_session_id', sessionId);
    }
    return sessionId;
  }

  private static getUserId(): string | null {
    return localStorage.getItem('user_id');
  }
}
```

---

## 📅 WEEK 1: Observability Foundation

### Day 1-2: Infrastructure Setup

**Backend (Cloudflare Workers)**:
```typescript
// workers/src/routes/telemetry.ts
import { Hono } from 'hono';
import type { Env } from '../types';

const telemetry = new Hono<{ Bindings: Env }>();

// Track event
telemetry.post('/track', async (c) => {
  const event = await c.req.json();
  
  // Store in D1
  await c.env.DB.prepare(`
    INSERT INTO user_actions (id, user_id, action_type, component_id, payload, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    event.userId,
    event.action,
    event.component,
    JSON.stringify(event.properties),
    event.timestamp
  ).run();
  
  // Also cache in KV for real-time access
  await c.env.CACHE.put(
    `event:${event.userId}:${Date.now()}`,
    JSON.stringify(event),
    { expirationTtl: 3600 }
  );
  
  return c.json({ success: true });
});

// Get metrics
telemetry.get('/metrics/:componentId', async (c) => {
  const componentId = c.req.param('componentId');
  const since = c.req.query('since') || Date.now() - 86400000; // 24h default
  
  const results = await c.env.DB.prepare(`
    SELECT metric_name, value, timestamp
    FROM component_metrics
    WHERE component_id = ? AND timestamp > ?
    ORDER BY timestamp DESC
    LIMIT 1000
  `).bind(componentId, since).all();
  
  return c.json(results);
});

export default telemetry;
```

**Deliverables**:
- ✅ D1 schema deployed
- ✅ Telemetry API endpoints
- ✅ Frontend SDK wrapper

---

### Day 3-4: Page 1 - Analytics Dashboard

**Route**: `/analytics`

**Purpose**: High-level metrics overview

**Features**:
- Total workflows executed (last 7/30 days)
- Success rate trend
- Token usage summary
- Cost projection
- Active users chart
- Most used agents
- Peak execution times

**Component**:
```typescript
// src/pages/Analytics.tsx
import { useState, useEffect } from 'react';
import { HUMMBLTelemetry } from '../services/telemetry';
import { LineChart, BarChart, PieChart } from '../components/Charts';

export const Analytics: React.FC = () => {
  useEffect(() => {
    HUMMBLTelemetry.pageView('analytics-dashboard');
  }, []);

  const [metrics, setMetrics] = useState({
    workflowsExecuted: 0,
    successRate: 0,
    tokensUsed: 0,
    costThisMonth: 0,
  });

  // Fetch metrics from backend
  useEffect(() => {
    fetch('/api/telemetry/metrics/analytics-dashboard?since=604800000')
      .then(res => res.json())
      .then(setMetrics);
  }, []);

  return (
    <div className="space-y-6">
      <h1>Analytics Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          title="Workflows Executed"
          value={metrics.workflowsExecuted}
          trend="+12%"
        />
        {/* ... more cards */}
      </div>

      {/* Charts */}
      <LineChart 
        title="Executions Over Time"
        data={executionTrend}
      />
    </div>
  );
};
```

**Deliverable**: Analytics Dashboard live at `/analytics`

---

### Day 5: Page 2 - Token Usage

**Route**: `/analytics/tokens`

**Purpose**: Track AI API token consumption

**Features**:
- Tokens by model (pie chart)
- Tokens by agent (bar chart)
- Cost breakdown
- Optimization suggestions
- Export CSV

**Backend**:
```typescript
// Aggregate token usage from execution logs
telemetry.get('/tokens/summary', async (c) => {
  const results = await c.env.DB.prepare(`
    SELECT 
      tr.agent_id,
      COUNT(*) as executions,
      SUM(CAST(json_extract(tr.output, '$.tokensUsed') AS INTEGER)) as total_tokens
    FROM task_results tr
    WHERE tr.completed_at > ?
    GROUP BY tr.agent_id
  `).bind(Date.now() - 2592000000).all(); // 30 days
  
  return c.json(results);
});
```

**Deliverable**: Token Usage page live

---

### Day 6-7: Page 3 - Execution Monitor

**Route**: `/monitor`

**Purpose**: Real-time workflow execution viewer

**Features**:
- Live execution list (auto-refresh every 5s)
- Execution details modal
- Filter by status/user/workflow
- Kill running execution
- Retry failed execution

**Implementation**:
```typescript
// src/pages/ExecutionMonitor.tsx
export const ExecutionMonitor: React.FC = () => {
  const [executions, setExecutions] = useState([]);
  
  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/executions?status=running,pending')
        .then(res => res.json())
        .then(setExecutions);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Execution Monitor</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Workflow</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Started</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {executions.map(exec => (
            <ExecutionRow key={exec.id} execution={exec} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

**Deliverable**: Execution Monitor live with real-time updates

---

### Day 7: Page 4 - Error Logs

**Route**: `/logs/errors`

**Purpose**: Centralized error tracking

**Features**:
- All errors from executions
- Filter by date/workflow/agent
- Error details modal
- Mark as resolved
- Export for debugging

**Backend**:
```typescript
// Query failed executions and task results
telemetry.get('/errors', async (c) => {
  const errors = await c.env.DB.prepare(`
    SELECT 
      tr.id,
      tr.task_name,
      tr.error,
      tr.completed_at,
      e.workflow_id
    FROM task_results tr
    JOIN executions e ON tr.execution_id = e.id
    WHERE tr.status = 'failed'
    ORDER BY tr.completed_at DESC
    LIMIT 100
  `).all();
  
  return c.json(errors);
});
```

**Deliverable**: Error Logs page live

---

## 📅 WEEK 2: Team & Configuration

### Day 8-10: Page 5 - Team Members

**Route**: `/team`

**Purpose**: Manage team members and permissions

**Database Schema**:
```sql
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by TEXT,
  joined_at INTEGER,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

**Features**:
- Invite members (email)
- Assign roles (owner/admin/member/viewer)
- Remove members
- View member activity
- Pending invitations

**Deliverable**: Team management working

---

### Day 11-12: Page 6 - API Keys Management

**Route**: `/settings/api-keys`

**Purpose**: Secure API key storage and management

**Database Schema**:
```sql
CREATE TABLE api_keys_secure (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,  -- 'anthropic', 'openai'
  key_encrypted TEXT NOT NULL,
  key_last_4 TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);
```

**Features**:
- Add/edit/delete API keys
- Show last 4 chars only
- Test key validity
- Key usage stats
- Encrypted storage

**Security**:
```typescript
// Encrypt keys before storing
import { webcrypto } from 'crypto';

async function encryptApiKey(key: string, masterKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const cryptoKey = await webcrypto.subtle.importKey(
    'raw',
    encoder.encode(masterKey),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const encrypted = await webcrypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  return Buffer.from(encrypted).toString('base64');
}
```

**Deliverable**: Secure API key management

---

## 📅 WEEK 3: Automation & Alerts

### Day 13-15: Page 7 - Workflow Scheduler

**Route**: `/workflows/scheduler`

**Purpose**: Schedule workflows with cron

**Database Schema**:
```sql
CREATE TABLE scheduled_workflows (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_run_at INTEGER,
  next_run_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);
```

**Features**:
- Create schedule (cron syntax)
- Visual cron builder
- Enable/disable schedules
- View execution history
- Next run time preview

**Cloudflare Cron Triggers**:
```toml
# workers/wrangler.toml
[triggers]
crons = ["*/5 * * * *"]  # Every 5 minutes
```

```typescript
// workers/src/index.ts
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    // Get all enabled schedules due to run
    const now = Date.now();
    const schedules = await env.DB.prepare(`
      SELECT id, workflow_id, user_id
      FROM scheduled_workflows
      WHERE enabled = true AND next_run_at <= ?
    `).bind(now).all();
    
    // Execute each workflow
    for (const schedule of schedules.results) {
      await executeWorkflow(env, schedule.workflow_id, schedule.user_id);
      
      // Update next_run_at based on cron expression
      const nextRun = calculateNextRun(schedule.cron_expression);
      await env.DB.prepare(`
        UPDATE scheduled_workflows
        SET last_run_at = ?, next_run_at = ?
        WHERE id = ?
      `).bind(now, nextRun, schedule.id).run();
    }
  }
};
```

**Deliverable**: Cron-based scheduling working

---

### Day 16-18: Page 8 - Notification Center

**Route**: `/notifications`

**Purpose**: Centralized notification hub

**Database Schema**:
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'execution_complete', 'error', 'team_invite'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at INTEGER NOT NULL
);
```

**Features**:
- All notifications in one place
- Mark as read/unread
- Filter by type
- Real-time updates (SSE or polling)
- Email digest settings

**Backend (Server-Sent Events)**:
```typescript
// Real-time notification stream
telemetry.get('/notifications/stream', async (c) => {
  const userId = c.req.header('X-User-ID');
  
  return c.stream(async (stream) => {
    while (true) {
      const notifications = await c.env.DB.prepare(`
        SELECT * FROM notifications
        WHERE user_id = ? AND read = false
        ORDER BY created_at DESC
        LIMIT 10
      `).bind(userId).all();
      
      await stream.write(`data: ${JSON.stringify(notifications)}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  });
});
```

**Deliverable**: Notification system working

---

## 🎯 Week 3 Day 19-21: Pilot Evaluation

### Metrics Collection

```sql
-- Query pilot success metrics
SELECT 
  COUNT(DISTINCT component_id) as pages_built,
  SUM(CASE WHEN component_id LIKE 'analytics%' THEN 1 ELSE 0 END) as analytics_usage,
  AVG(value) as avg_page_load_time
FROM component_metrics
WHERE timestamp > [pilot_start_timestamp];
```

### Decision Framework

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Pages Built | 8 | ? | ? |
| Build Hours | <120 | ? | ? |
| Code Reuse | >70% | ? | ? |
| User Adoption | >60% | ? | ? |
| Performance | <1s | ? | ? |
| Error Rate | <1% | ? | ? |

**If ≥5 metrics pass** → **GO TO PHASE 1** (32 pages, 12 weeks)  
**If 3-4 metrics pass** → **REFINE & RETRY** (adjust strategy)  
**If <3 metrics pass** → **PIVOT** (rethink approach)

---

## 📦 Deliverables Checklist

### Week 1
- [ ] D1 schema deployed
- [ ] Telemetry SDK working
- [ ] Analytics Dashboard live
- [ ] Token Usage live
- [ ] Execution Monitor live
- [ ] Error Logs live

### Week 2
- [ ] Team data model deployed
- [ ] Team Members page live
- [ ] API Keys Management live
- [ ] RBAC working
- [ ] Key encryption working

### Week 3
- [ ] Scheduler data model deployed
- [ ] Workflow Scheduler live
- [ ] Cron triggers working
- [ ] Notification Center live
- [ ] SSE stream working
- [ ] Pilot evaluation complete

---

## 🚀 Next Steps (Day 1)

1. **Deploy D1 schema**
2. **Build telemetry API endpoints**
3. **Create frontend SDK wrapper**
4. **Start Analytics Dashboard**
5. **Set up monitoring infrastructure**

---

## 📞 Decision Point: Week 3, Day 21

**Date**: 2025-12-02  
**Meeting**: Pilot Review with Chief Engineer  
**Outcome**: GO/NO-GO for Phase 1

**If GO** → Start Phase 1 (32 pages) on 2025-12-05  
**If REFINE** → Adjust and retry pilot  
**If PIVOT** → Strategic reassessment

---

**PILOT STATUS**: ✅ Approved, Ready to Start  
**FIRST TASK**: Deploy D1 schema and telemetry endpoints

Let's build. 🚀
