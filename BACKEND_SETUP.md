# HUMMBL Backend Setup - Cloudflare Workers

**Status**: 🚧 **IN PROGRESS**  
**Date**: 2025-11-08  
**Goal**: Move workflow execution to Cloudflare Workers backend

---

## Overview

We're building the **Phase 2 Backend** to enable workflow execution without CORS issues.

### Architecture

```
Frontend (Vercel)          Backend (Cloudflare)          AI APIs
     │                            │                         │
     │   POST /api/execute        │                         │
     ├───────────────────────────>│                         │
     │                            │   Call Anthropic API    │
     │                            ├────────────────────────>│
     │                            │                         │
     │                            │<────────────────────────┤
     │   Return results           │                         │
     │<───────────────────────────┤                         │
     │                            │                         │
                                  ▼
                          D1 Database
                         (Store workflows)
```

---

## Project Structure Created

```
hummbl/
├── src/              # Frontend (React + Vite)
└── workers/          # Backend (Cloudflare Workers)
    ├── package.json
    ├── wrangler.toml
    ├── tsconfig.json
    └── src/
        ├── index.ts        # Main entry point
        ├── routes/         # API endpoints
        ├── services/       # AI integration
        ├── lib/            # Utilities
        └── types/          # TypeScript types
```

---

## Step-by-Step Setup

### 1. Install Cloudflare CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This opens a browser to authenticate.

### 3. Create D1 Database

```bash
cd workers
wrangler d1 create hummbl-workflows
```

Copy the database ID and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "hummbl-workflows"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 4. Create KV Namespace (for caching)

```bash
wrangler kv:namespace create "CACHE"
```

Copy the ID and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_ID_HERE"
```

### 5. Install Dependencies

```bash
cd workers
npm install
```

### 6. Set API Keys as Secrets

```bash
wrangler secret put ANTHROPIC_API_KEY
# Paste your Anthropic API key when prompted

wrangler secret put OPENAI_API_KEY
# Paste your OpenAI API key when prompted
```

---

## D1 Database Schema

Create `workers/schema.sql`:

```sql
-- Workflows table
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Workflow executions table
CREATE TABLE executions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

-- Task results table
CREATE TABLE task_results (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  status TEXT NOT NULL,
  output TEXT,
  error TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  FOREIGN KEY (execution_id) REFERENCES executions(id)
);

-- Indexes for performance
CREATE INDEX idx_executions_workflow ON executions(workflow_id);
CREATE INDEX idx_task_results_execution ON task_results(execution_id);
```

Apply the schema:
```bash
wrangler d1 execute hummbl-workflows --file=./schema.sql
```

---

## API Endpoints to Build

### 1. Execute Workflow
```
POST /api/workflows/:id/execute
Body: { input?: Record<string, unknown> }
Response: { executionId: string }
```

### 2. Get Execution Status
```
GET /api/executions/:id
Response: { 
  id, 
  status,
  progress,
  taskResults: TaskResult[]
}
```

### 3. Health Check
```
GET /api/health
Response: { status: "ok", timestamp: number }
```

---

## Development Workflow

### 1. Start Local Development

```bash
cd workers
npm run dev
```

Worker runs at `http://localhost:8787`

### 2. Test Endpoints

```bash
curl http://localhost:8787/api/health
```

### 3. Deploy to Cloudflare

```bash
npm run deploy
```

---

## Frontend Integration

Update frontend API calls to use Workers URL:

```typescript
// src/services/api.ts (NEW FILE)
const API_URL = import.meta.env.PROD 
  ? 'https://api.hummbl.io'
  : 'http://localhost:8787';

export async function executeWorkflow(
  workflowId: string,
  input?: Record<string, unknown>
) {
  const response = await fetch(`${API_URL}/api/workflows/${workflowId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });
  
  return response.json();
}

export async function getExecutionStatus(executionId: string) {
  const response = await fetch(`${API_URL}/api/executions/${executionId}`);
  return response.json();
}
```

---

## Environment Variables

### Development (.dev.vars)
```
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

### Production (Wrangler Secrets)
Use `wrangler secret put` (already done in step 6)

---

## Next Steps

1. ✅ Created project structure
2. ⏳ **You need to**: Install wrangler and setup Cloudflare account
3. ⏳ Create D1 database and KV namespace
4. ⏳ Build the API endpoints
5. ⏳ Implement AI service (server-side, no CORS)
6. ⏳ Update frontend to call backend
7. ⏳ Test end-to-end
8. ⏳ Deploy!

---

## Cost Estimate (Cloudflare Free Tier)

- **Workers**: 100,000 requests/day FREE
- **D1**: 5 GB storage FREE
- **KV**: 100,000 reads/day FREE
- **Egress**: 10 GB/day FREE

**Perfect for development and early stage!**

---

## Need Help?

### Cloudflare Docs
- Workers: https://developers.cloudflare.com/workers/
- D1: https://developers.cloudflare.com/d1/
- Hono.js: https://hono.dev/

### Commands Quick Reference
```bash
wrangler login                    # Authenticate
wrangler d1 create <name>         # Create database
wrangler d1 execute <name> --file # Run SQL
wrangler secret put <name>        # Set secret
wrangler dev                      # Local development
wrangler deploy                   # Deploy to production
wrangler tail                     # View logs
```

---

## Ready?

Run these commands to get started:

```bash
# 1. Install wrangler globally
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Go to workers directory
cd workers

# 4. Install dependencies
npm install

# 5. Create database
wrangler d1 create hummbl-workflows

# 6. Create KV namespace
wrangler kv:namespace create "CACHE"
```

**Then let me know and I'll continue building the backend code!** 🚀

