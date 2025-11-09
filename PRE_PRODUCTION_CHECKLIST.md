# HUMMBL Pre-Production Checklist ✈️

> **Mission**: Deploy HUMMBL to production with confidence
> **Status**: Ready for final checks before takeoff 🚀

---

## 🎯 Overview

This checklist ensures all systems are operational before production deployment. Complete each section in order, checking off items as you verify them.

**Estimated Time**: 45-60 minutes  
**Required Access**: Vercel, Cloudflare Workers, GitHub, API providers

---

## ✅ Phase 1: Code Quality & Testing (15 min)

### Frontend Tests
- [ ] **Run all tests**: `npm test -- --run`
  - [ ] 79/79 tests passing
  - [ ] No console errors
  - [ ] No unhandled promises

- [ ] **Type checking**: `npx tsc --noEmit`
  - [ ] Zero TypeScript errors
  - [ ] All strict mode rules passing

- [ ] **Linting**: `npm run lint`
  - [ ] No ESLint errors
  - [ ] No unused variables
  - [ ] No deprecated API usage

- [ ] **Build verification**: `npm run build`
  - [ ] Build completes successfully
  - [ ] Main bundle <50 kB gzipped
  - [ ] No chunk size warnings
  - [ ] CSS <10 kB gzipped

### Backend Tests
- [ ] **Worker tests**: `cd workers && npm test -- --run`
  - [ ] 40/40 backend tests passing
  - [ ] Auth tests passing (15 tests)
  - [ ] Validation tests passing (15 tests)

- [ ] **Type checking**: `cd workers && npx tsc --noEmit`
  - [ ] Zero TypeScript errors
  - [ ] All type imports resolved

---

## 🗄️ Phase 2: Database & Infrastructure (10 min)

### Database Migrations
- [ ] **Check migration status**: `cd workers && npm run migrate:status`
  - [ ] List all pending migrations
  - [ ] Verify migration files are valid SQL

- [ ] **Apply migrations**: `wrangler d1 execute DB --file=workers/migrations/001_initial_schema.sql`
  - [ ] Workflows table created
  - [ ] Executions table created
  - [ ] Task_results table created

- [ ] **Apply API keys migration**: `wrangler d1 execute DB --file=workers/migrations/002_add_api_keys_table.sql`
  - [ ] api_keys table created
  - [ ] Encryption fields present

- [ ] **Apply users migration**: `wrangler d1 execute DB --file=workers/migrations/003_add_users_table.sql`
  - [ ] users table created
  - [ ] sessions table created
  - [ ] Indexes created

- [ ] **Verify schema**: Check schema version in health endpoint
  - [ ] Schema version = 3
  - [ ] All tables accessible

### KV Namespaces
- [ ] **Rate limiting KV**: Verify `RATE_LIMIT_KV` binding exists
- [ ] **Cache KV**: Verify `CACHE` binding exists
- [ ] **Test KV access**: Run simple get/put operation

---

## 🔐 Phase 3: Environment Variables & Secrets (10 min)

### Frontend Environment (Vercel)
- [ ] **Check `.env` or Vercel dashboard**:
  - [ ] `VITE_API_URL` set to worker URL
  - [ ] `VITE_APP_ENV=production`
  - [ ] No sensitive keys in frontend env

### Backend Environment (Cloudflare Workers)
- [ ] **Required secrets via `wrangler secret`**:
  - [ ] `ANTHROPIC_API_KEY` - Claude API key
    ```bash
    wrangler secret put ANTHROPIC_API_KEY
    ```
  - [ ] `OPENAI_API_KEY` - GPT API key
    ```bash
    wrangler secret put OPENAI_API_KEY
    ```

- [ ] **D1 Database binding**: Check `wrangler.toml`
  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "hummbl-production"
  database_id = "your-database-id"
  ```

- [ ] **KV Namespace bindings**: Check `wrangler.toml`
  ```toml
  [[kv_namespaces]]
  binding = "CACHE"
  id = "your-cache-kv-id"
  
  [[kv_namespaces]]
  binding = "RATE_LIMIT_KV"
  id = "your-rate-limit-kv-id"
  ```

- [ ] **Test secrets**: Run health check to verify all bindings work

---

## 🔒 Phase 4: Security & Headers (10 min)

### Security Headers (Vercel)
- [ ] **Check `vercel.json`**:
  - [ ] CSP (Content-Security-Policy) configured
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] Referrer-Policy: strict-origin-when-cross-origin
  - [ ] Permissions-Policy configured

### CORS Configuration (Workers)
- [ ] **Check `workers/src/index.ts`**:
  - [ ] Production origin allowed
  - [ ] Credentials enabled for auth
  - [ ] Proper methods allowed (GET, POST, DELETE, etc.)

### Rate Limiting
- [ ] **Verify rate limits**: Check `workers/src/lib/rateLimit.ts`
  - [ ] Auth endpoints: 5 req/min ✓
  - [ ] Execution endpoints: 10 req/min ✓
  - [ ] General endpoints: 100 req/min ✓

### Authentication
- [ ] **Session security**:
  - [ ] Password hashing enabled (SHA-256)
  - [ ] Session TTL configured (7 days default)
  - [ ] Inactive user checks enabled
  - [ ] Session cleanup scheduled

---

## 🚀 Phase 5: Deployment Verification (10 min)

### Backend Deployment (Cloudflare Workers)
- [ ] **Deploy worker**: `cd workers && npm run deploy`
  - [ ] Deployment successful
  - [ ] No deployment errors
  - [ ] Worker URL received

- [ ] **Health check**: `curl https://your-worker.workers.dev/`
  ```json
  {
    "service": "hummbl-backend",
    "version": "1.0.0",
    "status": "operational",
    "database": {
      "status": "healthy",
      "schemaVersion": 3
    },
    "timestamp": 1234567890
  }
  ```
  - [ ] Status: operational
  - [ ] Database: healthy
  - [ ] Schema version: 3

- [ ] **Test authentication**: `POST /api/auth/register`
  - [ ] Can create test user
  - [ ] Receives JWT token
  - [ ] Can access `/api/auth/me`

- [ ] **Test rate limiting**: Make 6 auth requests quickly
  - [ ] 6th request returns 429
  - [ ] Retry-After header present

### Frontend Deployment (Vercel)
- [ ] **Deploy frontend**: `git push origin main`
  - [ ] Auto-deploy triggered
  - [ ] Build succeeds
  - [ ] Preview URL available

- [ ] **Verify build output**:
  - [ ] Main bundle <50 kB gzipped ✓
  - [ ] Lazy loading working ✓
  - [ ] All chunks generated ✓

- [ ] **Test production URL**:
  - [ ] Site loads successfully
  - [ ] No console errors
  - [ ] Loading indicators appear on navigation
  - [ ] Dashboard renders correctly

---

## 🧪 Phase 6: End-to-End Testing (15 min)

### Core User Flows
- [ ] **Authentication flow**:
  1. [ ] Visit production URL
  2. [ ] Register new account
  3. [ ] Login with credentials
  4. [ ] Access protected route
  5. [ ] Logout successfully

- [ ] **Workflow creation**:
  1. [ ] Navigate to Workflows page
  2. [ ] Create new workflow
  3. [ ] Add agent
  4. [ ] Add task
  5. [ ] Save workflow
  6. [ ] Workflow appears in list

- [ ] **Workflow execution**:
  1. [ ] Open saved workflow
  2. [ ] Click "Execute"
  3. [ ] Monitor execution status
  4. [ ] View task results
  5. [ ] Check error handling (if any)

- [ ] **Template usage**:
  1. [ ] Navigate to Templates
  2. [ ] Select template
  3. [ ] Create workflow from template
  4. [ ] Verify pre-filled data
  5. [ ] Execute template workflow

### Navigation & Performance
- [ ] **Page load times**:
  - [ ] Dashboard: <2s
  - [ ] Workflow List: <2s
  - [ ] Workflow Editor: <3s (larger bundle)
  - [ ] Settings: <1.5s

- [ ] **Route transitions**:
  - [ ] Loading indicators show
  - [ ] Smooth transitions
  - [ ] No flash of unstyled content
  - [ ] Browser back/forward works

- [ ] **Error boundaries**:
  - [ ] Trigger page error (if possible)
  - [ ] Page-level boundary catches it
  - [ ] User sees friendly error message
  - [ ] Can navigate away

### Mobile Responsiveness
- [ ] **Test on mobile viewport** (Chrome DevTools):
  - [ ] iPhone 12/13 Pro (390x844)
  - [ ] iPad (768x1024)
  - [ ] Android (360x640)

- [ ] **Responsive checks**:
  - [ ] Sidebar collapses to hamburger
  - [ ] Tables scroll horizontally
  - [ ] Forms are usable
  - [ ] Buttons are tappable
  - [ ] Text is readable

---

## 📊 Phase 7: Monitoring & Analytics (5 min)

### Analytics Setup
- [ ] **Vercel Analytics**:
  - [ ] Analytics enabled in Vercel dashboard
  - [ ] Receiving page view events
  - [ ] Core Web Vitals tracking

- [ ] **Error Tracking**:
  - [ ] Error boundaries report to telemetry ✓
  - [ ] Vercel error tracking enabled
  - [ ] Test error report appears in dashboard

### Metrics Collection
- [ ] **Backend metrics**:
  - [ ] Metrics flush to KV
  - [ ] Request duration tracked
  - [ ] Error count tracked
  - [ ] AI call metrics tracked

- [ ] **Performance metrics**:
  - [ ] LCP (Largest Contentful Paint) <2.5s
  - [ ] FID (First Input Delay) <100ms
  - [ ] CLS (Cumulative Layout Shift) <0.1

---

## 🔍 Phase 8: Final Smoke Tests (10 min)

### Critical Path Testing
- [ ] **Happy path**: Register → Create workflow → Execute → View results
  - [ ] All steps complete without errors
  - [ ] Data persists correctly
  - [ ] UI updates reflect backend state

### Edge Cases
- [ ] **Network errors**:
  - [ ] Test offline behavior
  - [ ] Check retry logic
  - [ ] Verify error messages

- [ ] **Invalid inputs**:
  - [ ] Submit empty forms
  - [ ] Use invalid API keys
  - [ ] Exceed rate limits
  - [ ] Check validation messages

- [ ] **Concurrent users**:
  - [ ] Open 3 tabs with different users
  - [ ] Create workflows simultaneously
  - [ ] Verify no conflicts

### Browser Compatibility
- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest)
- [ ] **Edge** (latest)

---

## 📋 Phase 9: Documentation Review (5 min)

### User-Facing Docs
- [ ] **README.md**:
  - [ ] Up to date
  - [ ] Installation instructions correct
  - [ ] Links work
  - [ ] Screenshots current

- [ ] **QUICKSTART_GUIDE.md**:
  - [ ] Steps are accurate
  - [ ] All commands work
  - [ ] Environment variables documented

### Internal Docs
- [ ] **`.github/copilot-instructions.md`**:
  - [ ] Reflects current architecture
  - [ ] All examples work
  - [ ] File paths correct

- [ ] **Migration docs**:
  - [ ] `workers/migrations/README.md` accurate
  - [ ] Migration commands documented
  - [ ] Rollback procedures clear

---

## 🎬 Phase 10: Go/No-Go Decision

### Pre-Launch Checklist Summary
- [ ] All tests passing (Frontend: 79, Backend: 40)
- [ ] Database migrated successfully
- [ ] Environment variables configured
- [ ] Security headers active
- [ ] Rate limiting operational
- [ ] Both deploys successful
- [ ] Health checks green
- [ ] E2E flows working
- [ ] Monitoring active
- [ ] Documentation current

### Go Decision Criteria
✅ **GO** if:
- All critical items checked
- No P0/P1 bugs found
- Performance targets met
- Security verified

⚠️ **NO-GO** if:
- Critical tests failing
- Security issues found
- Performance below targets
- Database migration failed

---

## 🚨 Rollback Plan (If Needed)

### Frontend Rollback
1. **Vercel**: Go to Deployments → Find previous deployment → Promote to Production
2. **Or**: `git revert HEAD && git push origin main`

### Backend Rollback
1. **Workers**: `cd workers && wrangler rollback`
2. **Or**: Deploy previous version: `git checkout <previous-commit> && npm run deploy`

### Database Rollback
1. **Migrations**: `npm run migrate:down` (if needed)
2. **Manual**: Restore from D1 backup (if available)

---

## 📞 Emergency Contacts

**On-Call Engineer**: [Your contact]  
**Database Admin**: [Contact]  
**Cloudflare Support**: [Ticket URL]  
**Vercel Support**: [Ticket URL]

---

## 📝 Post-Deployment Tasks

After successful launch:
- [ ] Monitor error rates (first 30 min)
- [ ] Check response times (first hour)
- [ ] Review user feedback (first day)
- [ ] Update deployment log
- [ ] Notify team of successful launch
- [ ] Schedule post-mortem (if issues)

---

## 🎉 Launch Status

**Date**: _______________  
**Time**: _______________  
**Deployed by**: _______________  
**Status**: ⬜ GO  ⬜ NO-GO  
**Issues found**: _______________  
**Resolution**: _______________  

---

## 📚 Reference Links

- **Frontend**: https://hummbl.vercel.app
- **Backend**: https://hummbl-backend.workers.dev
- **Vercel Dashboard**: https://vercel.com/hummbl-dev/hummbl
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **GitHub Repo**: https://github.com/hummbl-dev/hummbl
- **Documentation**: [Internal wiki]

---

**Remember**: Better to delay for quality than rush to production! 🎯

**Last Updated**: November 9, 2025  
**Checklist Version**: 1.0.0
