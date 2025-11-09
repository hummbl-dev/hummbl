# T5 Execution Layer - Deployment Instructions

**Status**: ✅ **BUILD COMPLETE**  
**Date**: 2025-11-08  
**Ready**: Deploy to Cloudflare Workers edge

---

## What Was Built

### Backend (Cloudflare Workers)
```
workers/
├── schema.sql                 # D1 database schema
├── src/
│   ├── index.ts              # Hono app entry point + CORS
│   ├── types/index.ts        # TypeScript definitions  
│   ├── lib/db.ts             # D1 helpers (Result<T,E> pattern)
│   ├── services/ai.ts        # Server-side AI (no CORS!)
│   └── routes/
│       ├── workflows.ts      # POST /api/workflows/:id/execute
│       └── executions.ts     # GET /api/executions/:id
```

### Frontend Integration
```
src/
├── services/api.ts           # Backend API client (NEW)
└── pages/WorkflowDetail.tsx  # Updated to use backend
```

---

## Deployment Steps

### 1. Install Dependencies

```bash
cd workers
npm install
```

This installs:
- `hono` - Web framework
- `@cloudflare/workers-types` - TypeScript types

### 2. Apply Database Schema

```bash
wrangler d1 execute hummbl-workflows --file=./schema.sql
```

This creates tables:
- `workflows` - Workflow definitions
- `executions` - Execution tracking
- `task_results` - Task outputs and errors

**Verify**:
```bash
wrangler d1 execute hummbl-workflows --command="SELECT name FROM sqlite_master WHERE type='table';"
```

Should show: workflows, executions, task_results

### 3. Set API Keys (Secrets)

```bash
# Set Anthropic API key
wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted

# Set OpenAI API key  
wrangler secret put OPENAI_API_KEY
# Paste your key when prompted
```

**Verify**:
```bash
wrangler secret list
```

Should show: ANTHROPIC_API_KEY, OPENAI_API_KEY

### 4. Local Testing

```bash
# Terminal 1: Start dev server
wrangler dev

# Terminal 2: Test health endpoint
curl http://localhost:8787/

# Should return:
# {
#   "service": "hummbl-backend",
#   "version": "1.0.0",
#   "status": "operational",
#   "timestamp": 1699...
# }
```

### 5. Deploy to Production

```bash
wrangler deploy
```

**Expected Output**:
```
Uploaded hummbl-backend (X.XX sec)
Published hummbl-backend (X.XX sec)
  https://hummbl-backend.<your-subdomain>.workers.dev
Current Deployment ID: xxxxx
```

**Copy the URL!** You'll need it for the frontend.

---

## Update Frontend

### Option A: Update API URL in Code

Edit `src/services/api.ts`:
```typescript
const API_URL = import.meta.env.DEV
  ? 'http://localhost:8787'
  : 'https://hummbl-backend.<YOUR-SUBDOMAIN>.workers.dev'; // Update this!
```

### Option B: Use Environment Variable

Create `.env.production`:
```
VITE_API_URL=https://hummbl-backend.<YOUR-SUBDOMAIN>.workers.dev
```

Then update `src/services/api.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
```

### Deploy Frontend

```bash
# Build and deploy to Vercel
npm run build
vercel --prod
```

---

## Testing End-to-End

### 1. Test Backend Directly

```bash
# Health check
curl https://hummbl-backend.<subdomain>.workers.dev/

# Execute workflow (will fail without proper payload, but tests routing)
curl -X POST https://hummbl-backend.<subdomain>.workers.dev/api/workflows/test/execute \
  -H "Content-Type: application/json"
```

### 2. Test from Frontend

1. Open https://hummbl.io
2. Go to **Settings**
3. Add your Anthropic API key
4. Go to **Templates**
5. Click "Research & Analysis Pipeline"  
6. Click "Use Template"
7. Open the new workflow
8. Click **"Run Workflow"**

**Expected**:
- Button shows "Running..."
- Progress bar animates
- Tasks show blue spinners → green checks
- Task results display inline
- Status becomes "Completed"

### 3. Verify in Cloudflare Dashboard

1. Go to Cloudflare Dashboard
2. Workers & Pages → hummbl-backend
3. **Logs**: Click "Begin log stream"
4. Run workflow from frontend
5. See real-time logs

**Check D1 Data**:
```bash
# See executions
wrangler d1 execute hummbl-workflows --command="SELECT * FROM executions LIMIT 5;"

# See task results
wrangler d1 execute hummbl-workflows --command="SELECT task_name, status FROM task_results LIMIT 10;"
```

---

## Architecture Verification

### What Changed

**Before (CORS Blocked)**:
```
Browser → Anthropic API ❌
```

**After (Works!)**:
```
Browser → Cloudflare Workers → Anthropic API ✅
         ↓
         D1 Database (history)
```

### API Endpoints Live

- `GET /` - Health check
- `POST /api/workflows/:id/execute` - Start execution
- `GET /api/executions/:id` - Get status + results

### Data Flow

1. User clicks "Run Workflow"
2. Frontend calls `POST /api/workflows/:id/execute`
3. Workers creates execution in D1
4. Workers executes tasks with AI APIs
5. Workers stores results in D1
6. Frontend polls `GET /api/executions/:id`
7. UI updates with real-time progress

---

## Troubleshooting

### Issue: "Cannot find module 'hono'"

**Fix**:
```bash
cd workers
npm install
```

### Issue: "Database not found"

**Fix**:
```bash
# Check wrangler.toml has correct database_id
wrangler d1 list

# Re-apply schema
wrangler d1 execute hummbl-workflows --file=./schema.sql
```

### Issue: "API key not configured"

**Fix**:
```bash
# Check secrets exist
wrangler secret list

# Re-set if missing
wrangler secret put ANTHROPIC_API_KEY
```

### Issue: Frontend still shows CORS error

**Possible causes**:
1. Old build cached - Hard refresh (`Cmd+Shift+R`)
2. API_URL not updated - Check `src/services/api.ts`
3. CORS middleware not working - Check Workers logs

**Debug**:
```bash
# Check what URL frontend is calling
# Open DevTools → Network tab → Look for API calls
```

### Issue: Workflows run but no results

**Check**:
1. D1 data: `wrangler d1 execute hummbl-workflows --command="SELECT * FROM task_results;"`
2. Workers logs: `wrangler tail`
3. AI API quotas/limits

---

## Performance & Limits

### Cloudflare Free Tier

- **100,000 requests/day** - More than enough for testing
- **10 ms CPU time per request** - Workflow execution runs async
- **D1**: 5 GB storage, 5 million reads/day
- **KV**: 100,000 reads/day

### Expected Performance

- **Cold start**: <100ms (Workers)
- **Warm request**: <10ms
- **Task execution**: 2-5s (depends on AI model)
- **3-task workflow**: ~10-15s total

### Scaling

For production load:
- Upgrade to Workers Paid ($5/month)
- Unbounded requests
- Add Cloudflare Queue for long workflows
- Use KV for caching results

---

## Success Criteria

✅ **Backend deployed** - Workers URL active  
✅ **D1 schema applied** - Tables created  
✅ **Secrets configured** - API keys set  
✅ **Health check passes** - GET / returns 200  
✅ **Frontend updated** - API_URL points to Workers  
✅ **Workflow executes** - Tasks run and complete  
✅ **Results display** - UI shows task outputs  
✅ **No CORS errors** - Network tab clean  

---

## Next Steps (Phase 3)

After successful deployment:

1. **Monitoring**: Set up Cloudflare Analytics alerts
2. **Logging**: Integrate with external logging (Datadog/Logtail)
3. **Caching**: Use KV for frequently-run workflows
4. **Queues**: Add Cloudflare Queue for background processing
5. **WebSockets**: Real-time updates instead of polling
6. **Auth**: Add API key authentication for frontend
7. **Rate Limiting**: Protect against abuse

---

## Commands Quick Reference

```bash
# Development
wrangler dev                    # Local dev server
wrangler tail                   # Stream logs

# Database
wrangler d1 list                                                    # List databases
wrangler d1 execute <db> --command="<sql>"                          # Run SQL
wrangler d1 execute <db> --file=./schema.sql                        # Apply schema

# Secrets
wrangler secret list                                                # List secrets
wrangler secret put <NAME>                                          # Set secret
wrangler secret delete <NAME>                                       # Remove secret

# Deployment
wrangler deploy                                                     # Deploy to prod
wrangler deployments list                                           # List deploys
wrangler rollback [deployment-id]                                   # Rollback

# Monitoring
wrangler tail                                                       # Real-time logs
curl https://hummbl-backend.<subdomain>.workers.dev/                # Health check
```

---

## Summary

**T5 Execution Layer is COMPLETE and READY TO DEPLOY.**

### What We Achieved

- ✅ Solved CORS issue (server-side AI calls)
- ✅ Built complete REST API (Hono.js)
- ✅ Implemented D1 persistence
- ✅ Result<T,E> pattern throughout
- ✅ Dependency resolution (topological sort)
- ✅ Real-time progress tracking
- ✅ Error handling and retry logic
- ✅ TypeScript strict mode (no `any`)

### Deploy Now

```bash
cd workers
wrangler d1 execute hummbl-workflows --file=./schema.sql
wrangler secret put ANTHROPIC_API_KEY
wrangler deploy
```

**Then update frontend API_URL and workflows will HUM! 🚀**

