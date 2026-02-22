# HUMMBL Platform Architecture Discovery Report

**Discovery Date:** 2026-02-21  
**Team:** HUMMBL Discovery Team - Platform Architecture Focus  
**Scope:** Catalog all platform-related components in the HUMMBL ecosystem  

---

## Executive Summary

This report documents the discovery and cataloging of all platform-related components in the HUMMBL ecosystem. Four primary components were identified across the `/Users/others/` directory structure.

| Component | Status | Maturity | Migration Priority |
|-----------|--------|----------|-------------------|
| hummbl-gaas-platform | Active | Stable | P0 - Critical |
| hummbl-mcp-enhanced | Active | Stable | P1 - High |
| hummbl-infra | Partial | In Progress | P1 - High |
| hummbl-context-pack | Active | Stable | P2 - Medium |

---

## Component 1: hummbl-gaas-platform

### Overview

**Location:** `/Users/others/hummbl-gaas-platform/`  
**Purpose:** Governance-as-a-Service (GaaS) platform for AI agent operations  
**Status:** Production Ready (v0.2.0)  
**Classification:** Core Platform Infrastructure  

### Purpose and Scope

HUMMBL GaaS is a multi-tenant, microservices-based platform providing:

- **Multi-tenant infrastructure** - Deploy agents in isolated environments
- **Built-in governance** - OPA-based policy engine with audit trails
- **Cost control** - Real-time visibility and budget enforcement
- **Workflow orchestration** - Complex multi-agent processes with DAG execution

The platform addresses three critical enterprise challenges:
1. Infrastructure complexity for AI agent deployment
2. Governance gap in AI operations (compliance risks, shadow AI)
3. Cost unpredictability in AI spending

### Key Files and Entry Points

| Category | Path | Description |
|----------|------|-------------|
| **Main Config** | `docker-compose.yml` | Local development environment |
| **Go Module** | `go.mod`, `go.sum` | Go 1.21 dependency management |
| **Services** | `services/` | 8 microservices (Go binaries) |
| **Packages** | `packages/shared-types/` | Shared Go types package |
| **Infrastructure** | `infra/k8s/`, `infra/terraform/` | K8s manifests, Terraform configs |
| **Tests** | `tests/integration/`, `tests/security/`, `tests/e2e/` | Integration, security, E2E tests |
| **Documentation** | `docs/architecture/`, `docs/api/`, `docs/operations/` | Architecture docs, OpenAPI specs |
| **CI/CD** | `.github/workflows/ci.yml` | GitHub Actions CI pipeline |

### Microservices Architecture (8 Services)

| Service | Port | Language | Status | Binary Size |
|---------|------|----------|--------|-------------|
| API Gateway | 8000 | Go | Production | 10.8MB |
| Tenant Manager | 8080 | Go | Production | 11.2MB |
| Policy Engine | 8182 | Go | Production | 10.7MB |
| OPA | 8181 | Rego | Production | - |
| Event Bus | 8083 | Go | Production | 10MB |
| Skill Registry | 8084 | Go | Production | 9.7MB |
| Agent Runtime | 8085 | Go | Production | 9.7MB |
| Workflow Engine | 8086 | Go | Production | 9.7MB |

### Dependencies (What it Needs)

| Dependency | Version | Purpose |
|------------|---------|---------|
| Go | 1.21+ | Primary language |
| PostgreSQL | 16 | Multi-tenant database |
| OPA | 0.60.0 | Policy engine |
| Docker/Colima | Latest | Container runtime |
| Redis | 7-alpine | Caching (optional) |
| MinIO | Latest | Object storage (optional) |

### Dependents (What Needs It)

- `founder_mode/` - Uses GaaS governance patterns (conceptual)
- Future agent deployments requiring multi-tenancy
- Enterprise customers needing governed AI operations

### Maturity Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Code Completeness | 100% | All 8 services operational |
| Test Coverage | High | 13/13 integration tests passing |
| Documentation | Comprehensive | API docs, architecture, runbooks |
| Security Audit | Passed | Score 8.5/10 |
| Performance | Validated | 4,269 req/sec throughput |
| Production Readiness | ✅ Ready | Deployment configs complete |

### Migration Candidate Assessment

**Migration Target:** `~/workspace/hummbl/platform/gaas/`  
**Current Target State:** Empty (`.gitkeep` only)  

**Recommendation:** YES - High Priority Migration

**Rationale:**
- Core platform service that belongs in the unified workspace
- Well-structured, production-ready codebase
- Clean separation of concerns
- Active development and maintenance

**Migration Complexity:** Medium
- 66 Go files to migrate
- Docker Compose configurations
- Kubernetes manifests
- Test suites

---

## Component 2: hummbl-mcp-enhanced

### Overview

**Location:** `/Users/others/hummbl-mcp-enhanced/`  
**Purpose:** Enhanced MCP (Model Context Protocol) server for HUMMBL Base120 mental models  
**Status:** Stable (v1.1.0)  
**Classification:** Protocol Adapter / Tool Integration  

### Purpose and Scope

An enhanced MCP server providing local fallbacks for HUMMBL Base120 mental model operations:

- **Problem Pattern Detection** - 12 patterns with synonym/keyword matching (vs 6 in original)
- **Local Recommendations** - No API key required for model recommendations
- **Model Relationships** - 15 built-in relationships + user-addable
- **Prompt Templates** - 5 pre-built prompts for common use cases

### Key Files and Entry Points

| File | Lines | Description |
|------|-------|-------------|
| `enhanced-server.js` | 747 | Main MCP server implementation |
| `enhanced-data.js` | 615 | Enhanced data: patterns, relationships, prompts |
| `package.json` | 27 | NPM package configuration |
| `test-enhanced.js` | 86 | Test suite |
| `stress-test.js` | 385 | Performance stress tests |
| `chaos-test.js` | 131 | Chaos engineering tests |

### Available Tools (10)

1. `get_model` - Get specific model by code (P1, IN1, etc.)
2. `list_all_models` - List all 120 models with optional filter
3. `search_models` - Search by keyword
4. `get_transformation` - Get transformation details
5. `search_problem_patterns` - Find patterns by keyword/synonym
6. `recommend_models` - Local recommendations without API key
7. `get_related_models` - Local relationship graph
8. `add_relationship` - Add user-defined relationships
9. `get_methodology` - Get Self-Dialectical methodology
10. `audit_model_references` - Validate model codes

### Dependencies (What it Needs)

| Dependency | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | Runtime |
| @modelcontextprotocol/sdk | ^1.26.0 | MCP protocol SDK |
| zod | ^3.x | Schema validation (via node_modules) |
| pkce-challenge | Latest | PKCE authentication |

### Dependents (What Needs It)

- Claude Desktop users (via `claude_desktop_config.json`)
- Any MCP-compatible client
- AI agents requiring Base120 mental model access

### Maturity Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Code Completeness | 100% | Fully functional MCP server |
| Test Coverage | Good | Unit, stress, chaos tests included |
| Documentation | Good | README with usage examples |
| Stability | Stable | v1.1.0 release |
| Integration | Ready | Claude Desktop config provided |

### Migration Candidate Assessment

**Migration Target:** `~/workspace/hummbl/platform/mcp/`  
**Current Target State:** Empty (`.gitkeep` only)  

**Recommendation:** YES - High Priority Migration

**Rationale:**
- Clean, self-contained MCP server implementation
- Part of the platform services layer
- No external runtime dependencies beyond Node.js
- Well-tested and stable

**Migration Complexity:** Low
- Single primary JS file (enhanced-server.js)
- Single data file (enhanced-data.js)
- Minimal NPM dependencies
- No persistent state

---

## Component 3: hummbl-infra

### Overview

**Location:** `/Users/others/hummbl-infra/`  
**Purpose:** Unified infrastructure for CI/CD, development environment, monitoring, and security  
**Status:** In Progress (~40% complete)  
**Classification:** Infrastructure Platform  

### Purpose and Scope

Provides infrastructure primitives across four domains:

1. **CI/CD Pipeline** - Container builds, multi-environment deployment, release automation
2. **Development Environment** - Setup automation, secrets management, local development stack
3. **Monitoring/Observability** - Metrics collection, aggregation, alerting, dashboards
4. **Security/Governance** - RBAC documentation, secrets rotation, incident response

### Key Files and Entry Points

| Domain | Path | Description |
|--------|------|-------------|
| **CI/CD** | `ci-cd/workflows/` | GitHub Actions templates |
| **CI/CD** | `ci-cd/Dockerfile` | Multi-stage container build |
| **CI/CD** | `ci-cd/configs/environments/` | Environment configs (dev/staging/prod) |
| **Dev Env** | `dev-environment/docker/docker-compose.yml` | Local stack |
| **Dev Env** | `dev-environment/secrets-vault/` | Secrets management structure |
| **Monitoring** | `monitoring/packages/observability/` | TypeScript observability package |
| **Monitoring** | `monitoring/configs/` | Alert rules, thresholds |
| **Security** | `security/docs/runbooks/` | Incident response runbooks |
| **Security** | `security/configs/rotation-policy.json` | Secret rotation policy |

### Domain Maturity

| Domain | Current | Target | Status |
|--------|---------|--------|--------|
| Security/Governance | 75% | 95% | In Progress |
| Development Environment | 60% | 90% | In Progress |
| Monitoring/Observability | 25% | 75% | Early |
| CI/CD | 30% | 80% | Early |

### Dependencies (What it Needs)

| Dependency | Version | Purpose |
|------------|---------|---------|
| Node.js | 22+ | TypeScript packages |
| pnpm | 9+ | Package management |
| Docker/Colima | Latest | Local development |
| gitleaks | Latest | Secret scanning |
| 1Password CLI | Optional | Secrets management |

### Dependents (What Needs It)

- `hummbl-gaas-platform` - Uses infrastructure patterns
- All HUMMBL ecosystem projects - CI/CD, security, monitoring
- Development team - Setup automation

### Maturity Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Code Completeness | ~40% | Implementation in progress |
| Documentation | Good | Comprehensive plan documents |
| Test Coverage | Low | Not yet implemented |
| Stability | Development | Not production ready |
| Risk | Medium | Exposed secrets documented |

### Migration Candidate Assessment

**Migration Target:** `~/workspace/hummbl/platform/infra/`  
**Current Target State:** Empty (`.gitkeep` only)  

**Recommendation:** YES - Medium Priority Migration

**Rationale:**
- Infrastructure patterns should be centralized
- Active development ongoing
- Clear roadmap and planning documents
- Critical for platform operations

**Migration Complexity:** Medium
- Multiple domains (CI/CD, monitoring, security, dev-env)
- TypeScript packages to migrate
- Documentation-heavy component
- In-progress work needs coordination

**Note:** Consider completing implementation before migration or migrating with "in-progress" status clearly documented.

---

## Component 4: hummbl-context-pack

### Overview

**Location:** `/Users/others/hummbl-context-pack/`  
**Purpose:** Context packaging system for agent coordination and governance  
**Status:** Stable  
**Classification:** Governance / Coordination Tool  

### Purpose and Scope

Provides bounded context packs for AI agent coordination:

- **System Card** - Defines HUMMBL's identity and layer model
- **Policy Card** - Runtime execution boundary rules
- **Contracts Card** - Tool contract discipline and evidence requirements
- **Run Context** - JSON-based runtime context for agent sessions

### Key Files and Entry Points

| File | Description |
|------|-------------|
| `bin/pack.sh` | Context pack assembly script |
| `cards/SYSTEM_CARD.md` | HUMMBL system identity and invariants |
| `cards/POLICY_CARD.md` | Execution boundary rules |
| `cards/CONTRACTS_CARD.md` | Tool contract discipline |
| `runs/RUN_*.json` | Run context examples |

### Architecture

```
pack.sh (orchestrator)
    ├── SYSTEM_CARD.md (L0-L4 architecture)
    ├── POLICY_CARD.md (authority, side-effects, rules)
    ├── CONTRACTS_CARD.md (schemas, hashes, evidence)
    └── RUN_CONTEXT.json (session-specific context)
```

### Layer Model (from System Card)

| Layer | Component |
|-------|-----------|
| L4 | Governance (Base120 / MRCC / CAES / lifecycle) |
| L3 | Intent + Delegation (Poly-AI roles, task graphs) |
| L3.5 | Execution Boundary (deterministic gate + EDR + constraints) |
| L2 | Invocation (tool contracts, schemas, function calling) |
| L1 | Tool Surface (APIs/CLI/MCP/DB/filesystem) |
| L0 | Infrastructure (compute/storage/network/CI) |

### Dependencies (What it Needs)

| Dependency | Purpose |
|------------|---------|
| bash | Script execution |
| wc | Character counting |
| mktemp | Temporary file creation |

### Dependents (What Needs It)

- Codex agent - Primary consumer of context packs
- All HUMMBL agents - Governance and policy reference
- CI/CD pipelines - Contract validation

### Maturity Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Code Completeness | 100% | Simple, focused tool |
| Documentation | Excellent | Clear cards with invariants |
| Test Coverage | N/A | Script-based, manually verified |
| Stability | Stable | Core governance definitions |
| Integration | Active | Used by agent coordination |

### Migration Candidate Assessment

**Migration Target:** `~/workspace/hummbl/governance/` (conceptual) or keep separate  
**Current Target State:** N/A - No direct equivalent in workspace  

**Recommendation:** CONSIDER - Lower Priority

**Rationale:**
- Governance definitions may belong in centralized governance module
- Could be merged with `~/workspace/hummbl/governance/`
- Lightweight component, low maintenance burden where it is
- May have different lifecycle than platform code

**Migration Complexity:** Low
- Small footprint (7 files)
- Simple bash script
- Cards are documentation

---

## Inter-Component Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    HUMMBL ECOSYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │ hummbl-context-pack  │    │ hummbl-mcp-enhanced          │  │
│  │ (Governance/Policy)  │◄──►│ (Protocol Adapter)           │  │
│  │                      │    │                              │  │
│  │ • System Card        │    │ • Base120 Models             │  │
│  │ • Policy Card        │    │ • MCP Tools                  │  │
│  │ • Contracts Card     │    │ • Local Recommendations      │  │
│  └──────────┬───────────┘    └──────────────┬───────────────┘  │
│             │                               │                   │
│             │         ┌─────────────────────┘                   │
│             │         │                                         │
│             ▼         ▼                                         │
│  ┌──────────────────────────────────────┐                      │
│  │     hummbl-gaas-platform             │                      │
│  │     (Core Platform Services)         │                      │
│  │                                      │                      │
│  │  ┌────────────┐  ┌────────────┐     │                      │
│  │  │ 8 Services │  │ OPA Policy │◄────┼──────────────────────┤
│  │  │ (Go)       │  │ (Rego)     │     │                      │
│  │  └────────────┘  └────────────┘     │                      │
│  │                                      │                      │
│  └──────────────┬───────────────────────┘                      │
│                 │                                               │
│                 ▼                                               │
│  ┌──────────────────────────────────────┐                      │
│  │     hummbl-infra                     │                      │
│  │     (Infrastructure Platform)        │                      │
│  │                                      │                      │
│  │  • CI/CD          • Monitoring       │                      │
│  │  • Dev Environment• Security         │                      │
│  │                                      │                      │
│  └──────────────────────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Flow

1. **hummbl-context-pack** provides governance rules that all components follow
2. **hummbl-mcp-enhanced** exposes Base120 models via MCP protocol
3. **hummbl-gaas-platform** depends on infrastructure patterns from hummbl-infra
4. **hummbl-infra** provides CI/CD, monitoring, and security for all components

---

## Migration Priority Summary

| Priority | Component | Target Location | Complexity | Rationale |
|----------|-----------|-----------------|------------|-----------|
| **P0** | hummbl-gaas-platform | `~/workspace/hummbl/platform/gaas/` | Medium | Core production service, production ready, clear ownership |
| **P1** | hummbl-mcp-enhanced | `~/workspace/hummbl/platform/mcp/` | Low | Stable protocol adapter, part of platform services |
| **P1** | hummbl-infra | `~/workspace/hummbl/platform/infra/` | Medium | Infrastructure foundation, ongoing development |
| **P2** | hummbl-context-pack | `~/workspace/hummbl/governance/` or keep | Low | Governance definitions, may have different lifecycle |

### Migration Sequence Recommendation

```
Phase 1 (Immediate):
├── hummbl-mcp-enhanced (low complexity, stable)
└── hummbl-context-pack evaluation (governance merge?)

Phase 2 (Short-term):
└── hummbl-gaas-platform (core platform service)

Phase 3 (Medium-term):
└── hummbl-infra (complete implementation first, then migrate)
```

---

## Risk Assessment

| Risk | Component | Impact | Mitigation |
|------|-----------|--------|------------|
| Active development collision | hummbl-gaas-platform | High | Coordinate migration with dev team |
| Incomplete infra migration | hummbl-infra | Medium | Complete implementation before migration |
| Governance drift | hummbl-context-pack | Low | Ensure cards stay synchronized |
| MCP version mismatch | hummbl-mcp-enhanced | Low | Test with Claude Desktop after migration |

---

## Appendix A: File Counts and Sizes

| Component | Total Files | Code Files | Key Languages |
|-----------|-------------|------------|---------------|
| hummbl-gaas-platform | ~111 | 66 Go files | Go, YAML, Markdown |
| hummbl-mcp-enhanced | 16 | 8 JS files | JavaScript, JSON |
| hummbl-infra | 35 | ~15 | TypeScript, YAML, Markdown |
| hummbl-context-pack | 7 | 1 bash | Bash, Markdown, JSON |

## Appendix B: Technology Stack Summary

| Component | Primary Language | Runtime | Key Dependencies |
|-----------|------------------|---------|------------------|
| hummbl-gaas-platform | Go 1.21 | Docker/Colima | PostgreSQL, OPA, Redis |
| hummbl-mcp-enhanced | JavaScript | Node.js | MCP SDK, Zod |
| hummbl-infra | TypeScript/Bash | Node 22+/Bash | Docker, pnpm, gitleaks |
| hummbl-context-pack | Bash | Bash | Coreutils |

---

*Report generated by HUMMBL Discovery Team - Platform Architecture Focus*  
*Discovery Date: 2026-02-21*  
*Components Discovered: 4*  
*Total Files Analyzed: ~170*
