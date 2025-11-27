# HUMMBL Monorepo Migration Plan

**Created:** 2025-11-27
**Target:** `hummbl-dev/hummbl` as unified monorepo
**Status:** Planning (Chunk 1 complete)

---

## Current Repository Inventory

| Repo | Path | Remote | Purpose | Status |
|------|------|--------|---------|--------|
| **hummbl** | `/Users/others/hummbl` | `hummbl-dev/hummbl` | Target monorepo | ⚠️ Broken builds, 227 uncommitted files |
| **hummbl-1** | `/Users/others/hummbl-1` | `hummbl-dev/hummbl` | Duplicate clone | ✅ Clean, can delete |
| **hummbl-io** | `/Users/others/hummbl-io` | `hummbl-dev/hummbl-io` | Legacy frontend | ✅ Committed, on staging branch |
| **hummbl-research** | `/Users/others/hummbl-research` | `hummbl-dev/hummbl-research` | Working MCP server | ✅ Committed |
| **hummbl-bibliography** | `/Users/others/hummbl-bibliography` | `hummbl-dev/hummbl-bibliography` | Documentation/research | ⚠️ 12 uncommitted files |

---

## Current Monorepo Structure (apps/hummbl)

```
hummbl/
├── apps/
│   ├── api/              # Backend API (Hono?)
│   ├── mcp-server/       # ❌ BROKEN - missing imports, incomplete code
│   ├── web/              # New frontend (empty/scaffold?)
│   ├── web-legacy/       # Copy of hummbl-io frontend
│   └── workers/          # Cloudflare Workers
├── packages/
│   └── core/             # Shared types/utilities (empty)
├── docs/
│   ├── bibliography/
│   ├── internal/
│   └── research/
├── scripts/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Migration Strategy

### Phase 1: Stabilize (Pre-Migration)
- [ ] Commit/stash uncommitted changes in hummbl-bibliography
- [ ] Delete duplicate hummbl-1 clone
- [ ] Reset hummbl monorepo to clean state (git stash or reset)

### Phase 2: Core Package
- [ ] Create `packages/core` with shared types
- [ ] Define MentalModel, Transformation, Result types
- [ ] Export from @hummbl/core

### Phase 3: MCP Server Migration
- [ ] Copy working code from hummbl-research → apps/mcp-server
- [ ] Update imports to use @hummbl/core
- [ ] Verify build passes
- [ ] Update package.json to @hummbl/mcp-server

### Phase 4: Frontend Consolidation
- [ ] Decide: keep web-legacy OR migrate to web
- [ ] Update imports and paths
- [ ] Verify build passes

### Phase 5: CI/CD
- [ ] Create unified GitHub Actions workflow
- [ ] Configure Vercel/Cloudflare deployments
- [ ] Set up workspace-aware caching

### Phase 6: Cleanup
- [ ] Archive old repos (hummbl-io, hummbl-research, hummbl-bibliography)
- [ ] Update all documentation
- [ ] Publish @hummbl/mcp-server to npm

---

## Source of Truth Mapping

| Component | Source Repo | Target Location |
|-----------|-------------|-----------------|
| MCP Server (working) | hummbl-research | apps/mcp-server |
| Frontend (React) | hummbl-io | apps/web-legacy OR apps/web |
| API/Workers | hummbl (existing) | apps/api, apps/workers |
| Bibliography/Docs | hummbl-bibliography | docs/ |
| Shared Types | NEW | packages/core |

---

## Known Issues to Fix

1. **apps/mcp-server**: Missing imports (getModelByCode, isOk, TRANSFORMATIONS, etc.)
2. **apps/mcp-server**: Missing @types/node configuration
3. **apps/web**: Needs vite.config.ts validation
4. **Root**: NODE_ENV was production locally (FIXED in ~/.zshenv)

---

## Next Session Checklist (Chunk 2)

1. Reset monorepo to clean state
2. Create packages/core with shared types
3. Copy hummbl-research/src → apps/mcp-server/src
4. Fix TypeScript configuration
5. Verify `pnpm build` passes

---

## Commands Reference

```bash
# Clean install
cd /Users/others/hummbl
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install

# Build all
pnpm build

# Build specific package
pnpm --filter @hummbl/mcp-server build

# Run dev
pnpm --filter @hummbl/web dev
```
