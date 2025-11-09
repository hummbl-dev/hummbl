## HUMMBL — Quick instructions for AI coding agents

This file contains focused, actionable guidance for code-writing agents working in the HUMMBL repository. Keep edits short and concrete; reference the listed files when you need examples.

1. Big picture
   - **Frontend**: React + TypeScript SPA built with Vite. Routes in `src/App.tsx`, state in `src/store/workflowStore.ts` (Zustand with localStorage persistence), pages in `src/pages/`, components in `src/components/`.
   - **Backend**: Cloudflare Workers (Hono.js) in `workers/` — proxies AI calls to solve CORS, uses D1 database + KV cache. Deploy with `npm run deploy` from `workers/`.
   - **State management**: Zustand store (`src/store/workflowStore.ts`) persists to localStorage with `deserializeDates` helper for Date objects. Methods: `addWorkflow`, `addAgent`, `startWorkflow`, `updateTask`, etc.
   - **AI integration**: Frontend calls `src/services/api.ts` → backend (`workers/src/routes/*`) → AI providers. Direct browser calls in `src/services/ai.ts` are fallback only (Anthropic fails due to CORS). Provider selection is string-based: `model.includes('claude')` → Anthropic, `model.includes('gpt')` → OpenAI.
   - **Workflow execution**: `src/services/workflowRunner.ts` orchestrates task execution with dependency resolution; `taskExecutor.ts` handles individual task runs and retries.

2. Build, test, and dev workflows (exact commands)
   **Frontend**:
   - Install: `npm install`
   - Dev server: `npm run dev` (Vite, port 3000)
   - Production build: `npm run build` (runs `tsc && vite build`)
   - Preview: `npm run preview` (port 4173)
   - Lint: `npm run lint` (ESLint with TypeScript, React Hooks rules)
   - Unit tests: `npm test` (Vitest watch mode), `npm test -- --run` (single run), `npm run test:ui` (UI mode)
   - Test agents: `npm run test:production` (build validation), `npm run test:visual` (manual checklist), `npm run test:all` (both)
   
   **Backend** (in `workers/`):
   - Dev: `npm run dev` (runs `wrangler dev`, local D1 + KV)
   - Deploy: `npm run deploy` (deploys to Cloudflare Workers)
   - Tail logs: `npm run tail`
   
   **CI**: GitHub Actions test on Node 18/20/22 (see `.github/workflows/ci.yml`). Runs lint, type-check, build.

3. Project-specific conventions and gotchas
   - **TypeScript strict mode**: `tsconfig.json` enables strict, noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch. All files are `.ts`/`.tsx`.
   - **Date serialization**: Zustand persists to localStorage; `deserializeDates` helper in `workflowStore.ts` converts ISO strings → Date objects on load. Always use this pattern when adding Date fields.
   - **AI provider routing**: Production uses `src/services/api.ts` → Cloudflare Workers backend → AI providers. `src/services/ai.ts` has direct browser calls but Anthropic fails due to CORS (use backend in production).
   - **Model selection**: String-based checks (`model.includes('claude')` or `model.includes('gpt')`). Full model catalog in `src/config/aiModels.ts` (381 lines, includes Claude 4, GPT-4, pricing, context windows).
   - **Agent presets**: Smart defaults in `src/config/agentPresets.ts` — each role has optimized model, temperature, capabilities.
   - **Templates**: Seeded on app start from `src/data/templates.ts` (see `src/App.tsx` useEffect). Also includes `mentalModels.ts` for mental model framework.
   - **Layout**: `components/Layout/` contains Header/Sidebar wrapper; all pages are wrapped. Routes in `src/App.tsx`.
   - **Visual Workflow Builder**: Drag-and-drop component at `src/components/VisualWorkflowBuilder/` — uses @xyflow/react (v12).
   - **Performance**: All routes lazy-loaded with `React.lazy()`. Main bundle 31 kB (8.9 kB gzipped). Vendor chunks split for better caching. Terser removes console.log in production.

4. Integration & CI
   - **GitHub Actions**: `.github/workflows/ci.yml` — tests on Node 18/20/22, runs lint + type-check + build. Uploads dist artifacts.
   - **Deployment**: Frontend auto-deploys to Vercel on main branch push. Backend deploys to Cloudflare Workers (`npm run deploy` in `workers/`).
   - **Vercel config**: `vercel.json` — SPA rewrites, security headers (CSP, X-Frame-Options). CSP allows backend + AI provider origins.
   - **Testing agents**: `scripts/test-production.ts` and `scripts/visual-test-agent.ts` produce SITREP reports. Bundle size thresholds: JS warn >250KB, fail >300KB; CSS warn >40KB, fail >50KB (see `TESTING_AGENTS.md`).

5. Small examples you can use in PRs or edits
   - **Adding backend routes**: Create new file in `workers/src/routes/`, export Hono app, mount in `workers/src/index.ts`. Example: `app.route('/api/myroute', myroute)`. Add rate limiting with `app.use(rateLimit(RATE_LIMITS.general))`.
   - **Protecting routes**: Add `requireAuth` middleware: `app.get('/protected', requireAuth, async (c) => { const user = c.get('user'); ... })`. For role-based: `app.delete('/admin', requireAuth, requireRole('admin'), handler)`.
   - **New production test**: In `scripts/test-production.ts`, add method that calls `this.addResult({ test, status, message })`, then call it in `runAllTests()`.
   - **Zustand store actions**: Add method to interface in `workflowStore.ts`, implement in `create()` block. Access with `useWorkflowStore((state) => state.methodName)`.
   - **New page**: Create in `src/pages/`, lazy load it: `const MyPage = lazy(() => import('./pages/MyPage'))`, add route in `src/App.tsx`, wrap with `<PageErrorBoundary pageName="YourPage"><MyPage /></PageErrorBoundary>`.
   - **Adding logging**: Import `createLogger` at top: `const logger = createLogger('ComponentName');`. Use `logger.info('message', { context })` instead of console.log.
   - **AI API calls**: Always wrap with `fetchWithTimeout` and use `retryWithBackoff` for resilience: `await retryWithBackoff(() => fetchWithTimeout(url, options, 60000))`.
   - **Backend validation**: Import schema from `validation.ts`, call `validate(MySchema, requestData)`. Check `result.success` and return 400 with `result.errors` if false.
   - **Writing tests**: Create `*.test.ts` file, import `describe, it, expect, vi` from vitest. Mock external deps with `vi.fn()`, spy on methods with `vi.spyOn()`. Run with `npm test`.
   - **Frontend caching**: Use singleton caches: `aiResponseCache.getOrSet(key, () => fetchData())` for AI responses, `workflowCache` for workflows, `apiCache` for API calls.
   - **Backend caching**: Create `KVCache` instance with KV binding, use `cache.getOrSet(key, () => fetchData(), { ttl: CacheTTL.MEDIUM })` pattern. Use `CacheKeys` helpers for consistent key generation.
   - **Database migrations**: Create new migration with `npm run migrate:create add_feature`. Write up/down SQL. Apply with `npm run migrate:up`. Check status with `npm run migrate:status`.
   - **Error tracking**: Import `trackError` from `src/services/telemetry.ts`. Call with error object and severity: `trackError({ message, stack, severity: 'high', context })`. Integrates with Vercel Analytics.
   - **Performance metrics**: Backend uses `MetricsCollector` class in `workers/src/lib/metrics.ts`. Use `metrics.timing(METRICS.REQUEST_DURATION, duration, tags)` for timing, `metrics.increment(METRICS.REQUEST_COUNT, tags)` for counters.

6. Where to look for authoritative examples
   - `workers/src/index.ts` — backend entry point with Hono routing and CORS config
   - `workers/src/routes/` — backend API endpoints (auth, workflows, executions, telemetry, tokens)
   - `workers/src/lib/auth.ts` — authentication utilities (session management, password hashing, middleware)
   - `workers/src/routes/auth.ts` — login/logout/register endpoints
   - `workers/src/routes/workflows-protected.ts` — example protected workflow routes with auth
   - `src/services/api.ts` — frontend-to-backend API calls (executeWorkflow, etc.)
   - `src/services/workflowRunner.ts` — task orchestration with dependency resolution
   - `src/store/workflowStore.ts` — Zustand state + persistence + deserializeDates pattern
   - `src/config/aiModels.ts` — 381-line model catalog (Claude 4, GPT-4, pricing)
   - `src/config/agentPresets.ts` — smart role defaults (model, temp, capabilities)
   - `scripts/test-production.ts` — production test agent with SITREP reporting
   - `src/data/templates.ts` — workflow template examples
   - `src/components/VisualWorkflowBuilder/` — drag-and-drop workflow builder (@xyflow/react)
   - `src/utils/http.ts` — timeout and retry utilities (fetchWithTimeout, retryWithBackoff)
   - `src/utils/logger.ts` — environment-aware logging (Logger class, createLogger factory)
   - `src/utils/cache.ts` — in-memory caching with TTL and LRU eviction (Cache class, aiResponseCache, workflowCache singletons)
   - `workers/src/lib/validation.ts` — Zod schemas for request validation
   - `workers/src/lib/rateLimit.ts` — KV-based distributed rate limiting
   - `workers/src/lib/cache.ts` — KV-based distributed caching (KVCache class, CacheKeys, CacheTTL)
   - `workers/src/lib/migrations.ts` — database migration runner with version tracking
   - `workers/src/lib/metrics.ts` — metrics collection and aggregation (MetricsCollector class, metricsMiddleware, METRICS constants)
   - `workers/migrations/` — SQL migration files (001_initial_schema, 002_add_api_keys, 003_add_users)
   - `src/components/ErrorBoundary.tsx` — app-level error boundary with production error tracking hooks
   - `src/components/PageErrorBoundary.tsx` — page-level error boundary for graceful component failures
   - `src/services/telemetry.ts` — telemetry service with trackError function for error reporting
   - `src/hooks/useTelemetry.ts` — React hook for tracking events (usePageView, useTelemetry)
   - `*.test.ts` — Vitest unit tests (79 tests, all passing)

7. Error handling & production patterns
   - **Request timeouts**: All AI calls use `fetchWithTimeout` (60s default) from `src/utils/http.ts` and `workers/src/lib/http.ts`. Uses AbortController to cancel hung requests.
   - **Retry logic**: `taskExecutor.ts` implements exponential backoff via `retryWithBackoff` utility. Base delay grows with retry count (1s, 2s, 3s...) with random jitter.
   - **Retryable errors**: Use `isRetryableError(error)` to check if error should be retried. Returns true for TypeError (network), 5xx, and 429 status codes.
   - **Rate limiting**: Backend routes use KV-based rate limiter (`workers/src/lib/rateLimit.ts`). Auth endpoints: 5 req/min, execution: 10 req/min, general: 100 req/min. Returns 429 with Retry-After header.
   - **Input validation**: Backend uses Zod schemas (`workers/src/lib/validation.ts`) to validate all request bodies. Use `validate(schema, data)` helper that returns `{success, data}` or `{success: false, errors}`.
   - **Logging**: ALWAYS use `createLogger('ComponentName')` from `src/utils/logger.ts` or `workers/src/lib/logger.ts` instead of console.*. Logger is environment-aware (verbose dev, minimal prod). Use `logger.debug()`, `logger.info()`, `logger.warn()`, `logger.error(msg, error, context)`.
   - **localStorage quota**: Store handles quota exceeded gracefully, auto-clears old logs, shows user-friendly errors.
   - **Testing**: Write unit tests with Vitest. Run `npm test` or `npm test -- --run`. See `*.test.ts` files for patterns. Mock console methods, use vi.spyOn, check mock.calls for assertions.
   - **Authentication**: Session-based auth with JWT tokens. Use `requireAuth` middleware to protect routes, `requireRole('admin')` for role-based access. Sessions stored in D1 database with TTL. Password hashing uses Web Crypto API SHA-256.

8. When in doubt
   - Prefer minimal, reversible changes. Run `npm run dev` locally (frontend) or `npm run dev` in `workers/` (backend) to verify.
   - Backend changes: test with `wrangler dev`, check CORS headers, verify D1/KV bindings in `wrangler.toml`.
   - Frontend changes touching AI: use `src/services/api.ts` pattern (backend proxy), not direct `src/services/ai.ts` calls.
   - Before deploying: run `npm run test:all` (frontend) to catch bundle size issues and build errors.
   - Check `.env.example` for required environment variables.

If any section is unclear or you need a doc expanded with specific code examples, tell me which area and I will update this file accordingly.
