# HUMMBL Ecosystem Map

**Discovery Date:** 2026-02-21  
**Focus:** Ecosystem Relationships & Component Mapping  
**Discovery Team:** HUMMBL Discovery Team

---

## Executive Summary

This document maps the HUMMBL ecosystem as a network of related but independent initiatives. HUMMBL sits at the center as a foundational AI orchestration platform, with various projects orbiting it at different distances based on coupling strength.

**Key Finding:** The HUMMBL ↔ Founder Mode boundary is explicitly designed to be porous but intentional — code/pattern transfer is logged and deliberate, not automatic inheritance.

---

## 1. Ecosystem Architecture

### 1.1 HUMMBL at Center

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HUMMBL PLATFORM                               │
│                    (Foundational AI Orchestration)                      │
├─────────────────────────────────────────────────────────────────────────┤
│  hummbl/                    │  shared-hummbl-space/                      │
│  ├── core/                  │  ├── agents/      (70+ agent definitions)  │
│  ├── shared/                │  ├── avatars/     (160+ avatar configs)    │
│  ├── platform/              │  ├── memory/      (shared cognition)       │
│  │   ├── gaas/              │  ├── registries/  (machine-readable)       │
│  │   ├── mcp/               │  └── scripts/     (tooling/lint)           │
│  │   └── infra/             │                                            │
│  └── ecosystem/             │  agent-os/                                 │
│      └── README.md          │  ├── skills/      (12 reusable skills)     │
│                             │  └── contracts/   (4 contract domains)     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Ecosystem Orbit Map

```
                           ╔═══════════════════╗
                           ║    ECOSYSTEM      ║
                           ║     PEERS         ║
                           ╚═══════════════════╝
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ╔═══════▼═══════╗   ╔═══▼═══╗   ╔═══════▼═══════╗
            ║  Founder Mode ║   ║(empty)║   ║  (reserved    ║
            ║  (Dan-led)    ║   ║       ║   ║   for future) ║
            ╚═══════╤═══════╝   ╚═══════╝   ╚═══════════════╝
                    │
        ┌───────────┴───────────┐
        │    STRONG TIES        │
        ├───────────────────────┤
        │ • Governance patterns │
        │ • Cost governor       │
        │ • Agent coordination  │
        │ • Contract schemas    │
        └───────────────────────┘

═══════════════════════════════════════════════════════════════════════
                              LEGEND
═══════════════════════════════════════════════════════════════════════

  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
  │   STRONG    │◄───────►│   WEAK      │◄───────►│   SHARED    │
  │  BIDIRECT.  │         │  UNIDIRECT. │         │  COMPONENT  │
  └─────────────┘         └─────────────┘         └─────────────┘
      ███████                  ░░░░░░░              ▒▒▒▒▒▒▒▒▒
```

---

## 2. Component Inventory

### 2.1 Core HUMMBL Components

| Component | Path | Status | Purpose |
|-----------|------|--------|---------|
| **Core Platform** | `hummbl/core/` | 🟢 Ready | New platform primitives |
| **Shared Space** | `shared-hummbl-space/` | 🟢 Active | Agent identity, avatars, memory |
| **GaaS Platform** | `hummbl-gaas-platform/` | 🟢 Active | Governance/Graph as a Service |
| **MCP Enhanced** | `hummbl-mcp-enhanced/` | 🟢 Active | Model Context Protocol layer |
| **Infrastructure** | `hummbl-infra/` | 🟢 Active | Infrastructure definitions |
| **Agent OS** | `agent-os/` | 🟢 Active | Shared skills & contracts |

### 2.2 Migration Targets (hummbl/ directory structure)

| Component | Current Location | Target Location | Status |
|-----------|-----------------|-----------------|--------|
| Core Platform | (new) | `hummbl/core/` | 🟢 Ready |
| Shared Space | `shared-hummbl-space/` | `hummbl/shared/` | 📋 Planned |
| GaaS Platform | `hummbl-gaas-platform/` | `hummbl/platform/gaas/` | 📋 Planned |
| MCP Enhanced | `hummbl-mcp-enhanced/` | `hummbl/platform/mcp/` | 📋 Planned |
| Infrastructure | `hummbl-infra/` | `hummbl/platform/infra/` | 📋 Planned |

**Note:** Founder Mode is intentionally excluded from migration — it is a Dan-led collaboration, not a HUMMBL product.

### 2.3 Platform Directories (Secondary)

| Directory | Contents | Relationship |
|-----------|----------|--------------|
| `contracts/` | Schema definitions, validators (78 files) | Consumed via symlink |
| `packages/runtime/` | Runtime package (59 files) | Founder Mode uses this |
| `platforms/` | Cost governor configs per environment | Cloud, laptop, mobile, VPS |
| `runtimes/openclaw/` | OpenClaw runtime adapter | Local gateway |
| `tools/` | Utility scripts (45 files) | Shared tooling |

---

## 3. HUMMBL ↔ Founder Mode Boundary

### 3.1 Boundary Definition

```
┌────────────────────────────────────────────────────────────────────┐
│                         BOUNDARY LAYER                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   HUMMBL (Solo)                      Founder Mode (Collaboration) │
│   ─────────────                      ──────────────────────────── │
│                                                                    │
│   • Reuben owns                      • Dan Matha leads            │
│   • Platform primitives              • Product collaboration      │
│   • Shared across projects           • Morning Briefing product   │
│   • Solo research program            • Founding Architect role    │
│                                                                    │
│   ┌───────────────┐                  ┌───────────────┐             │
│   │  Agent OS     │◄────────────────►│  Consumes     │             │
│   │  (contracts)  │   intentional    │  contracts    │             │
│   └───────────────┘   transfer       └───────────────┘             │
│                                                                    │
│   ┌───────────────┐                  ┌───────────────┐             │
│   │  Skills       │◄────────────────►│  May import   │             │
│   │  (patterns)   │   logged reuse   │  selectively  │             │
│   └───────────────┘                  └───────────────┘             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 Connection Types

| Connection | Type | Description |
|------------|------|-------------|
| Contracts | **Strong, Bidirectional** | Founder Mode symlinks `contracts/` → `agent-os/contracts/` |
| Skills | **Weak, Unidirectional** | HUMMBL skills may be imported with provenance logging |
| Runtime | **Weak, Unidirectional** | `packages/runtime/` used by Founder Mode |
| Agent Coordination | **Shared Infrastructure** | TSV bus pattern shared across both |

### 3.3 Intentional Transfer Protocol

Per `hummbl/README.md` and `AGENTS.md`:

1. **No automatic inheritance** — Cross-use is intentional transfer with provenance
2. **Explicit logging** — All transfers documented
3. **Coordinate on shared interfaces** — Not internal HUMMBL moves
4. **No breaking changes** — Migrate only when components are stable

---

## 4. Agent Ecosystem

### 4.1 Primary Agents (Quadrant)

| Agent | Role | Bus Identity | Access |
|-------|------|--------------|--------|
| **Claude Code** (Opus 4.6) | Lead: integration, hardening, TDD, shipping | `claude-code`, `claude-opus-god-mode` | `gh` CLI, full repo |
| **Kimi** (kimi-1, kimi-2) | Builder: greenfield generation | `kimi-1`, `kimi-2` | Terminal, MCP, skills |
| **Codex** (codex, codex-cheap) | Verifier: test suites, CI checks | `codex`, `codex-cheap` | Terminal, full repo |
| **Gemini** (gemini) | Analyst: research, docs | `gemini` | Terminal |

### 4.2 Extended Agent Registry (Sample)

The `shared-hummbl-space/registries/agents.json` contains 70+ agents including:

- **anchor** — Maintains fallback/rollback docs
- **antithesis** — Interrogates weaknesses
- **atlas** — Stitches workstreams into strategies
- **axis** — Priority matrix keeper
- **beacon** — Escalation handler
- **and 60+ more...**

### 4.3 Agent Coordination Patterns

**TSV Append-Only Bus:**
```
founder_mode/_state/coordination/messages.tsv
```

Agents tag their identity in the `from` column. The multi-agent workflow is:
```
PLAN (Claude) → BUILD (Kimi) → HARDEN (Claude) → VERIFY (Codex) → SHIP (Claude)
```

---

## 5. Skills Registry

### 5.1 Agent OS Skills (12 Total)

| Skill | Category | Description |
|-------|----------|-------------|
| `agent-presence` | Core | Agent online/offline detection |
| `diagnostics` | Core | Health monitoring and recovery |
| `gog` | Core | Google Workspace CLI |
| `mcp-server-config` | Core | MCP server management |
| `clippy` | Productivity | Microsoft 365/Outlook CLI |
| `himalaya` | Productivity | CLI email client |
| `founder-mode` | Product-Specific | Morning briefing documentation |
| `recon-bridge` | Coordination | Terminal reconnaissance bridge |
| `workflow-runner` | Coordination | DAG-based workflow execution |
| `neuro-symbolic-*` | Specialized | 7 neuro-symbolic AI skills |

### 5.2 Skill Resolution Paths

| Agent | Discovery Path | Resolution |
|-------|---------------|------------|
| Claude Code CLI | `~/.agents/skills/` | → `~/agent-unified/skills/` |
| Kimi | `~/.config/agents/skills/` | → `~/agent-unified/skills/` |
| Codex | `~/.config/agents/skills/` | → `~/agent-unified/skills/` |

---

## 6. Contract Domains

### 6.1 Available Contracts (agent-os/contracts/)

| Domain | Path | Purpose |
|--------|------|---------|
| **cost-governor** | `contracts/cost-governor/` | Budget tracking and policy enforcement |
| **health** | `contracts/health/` | Health check schemas |
| **logging** | `contracts/logging/` | Logging standards |
| **routing** | `contracts/routing/` | Message routing contracts |

### 6.2 Founder Mode Contract Usage

Founder Mode consumes contracts via symlink:
```bash
contracts -> ../agent-os/contracts
```

This provides:
- Runtime validators
- Policy enforcement
- Schema validation

---

## 7. Cross-Component Dependencies

### 7.1 Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEPENDENCY GRAPH                                 │
└─────────────────────────────────────────────────────────────────────┘

  hummbl/ (core)
       │
       ├──► shared-hummbl-space/ ───────► agents/ (70+)
       │                                    ├── avatars/ (160+)
       │                                    ├── memory/
       │                                    └── registries/
       │
       ├──► agent-os/ ───────────────────► skills/ (12)
       │                  ▲                └── contracts/ (4 domains)
       │                  │
       │                  └──────────────────┐
       │                                     │
       │         founder_mode/ (product)     │
       │              ├── services/ (42)     │
       │              ├── integrations/ (7)  │
       │              ├── bus/ (coordination)│
       │              └── tests/ (3300+)     │
       │                                     │
       │              ▲                      │
       │              │                      │
       └──────────────┴──────────────────────┘
              uses contracts via symlink

  Other Components:
  ─────────────────
  • packages/runtime/ ──────► Used by founder_mode/
  • platforms/ ─────────────► Cost governor configs
  • runtimes/openclaw/ ─────► Local gateway
  • hybrid-inference/ ──────► Inference router (separate repo)
```

### 7.2 Founder Mode Internal Architecture

```
founder_mode/
├── services/ (45 modules)
│   ├── Core: scheduler.py, briefing.py, models.py
│   ├── Safety: kill_switch_core.py, circuit_breaker.py
│   ├── IDP: delegation_token.py, governance_bus.py
│   └── Integration: factorio_bridge.py, lead_doctor.py
├── integrations/ (18 adapters)
│   ├── Live: github, calendar, linear, cost, security
│   └── Future: aider, airflow, continue, jan, langgraph, etc.
├── bus/ (coordination)
│   ├── bus_manager.py (identity + signing)
│   ├── bus_security.py (security classes)
│   └── secure_tsv.py (injection prevention)
├── agents/ (multi-agent systems)
│   ├── factorio_system/ (Kimi-built)
│   └── cost-optimizer, incident-commander, etc.
└── tests/ (3300+ tests)
    ├── unit/, integration/, e2e/
    ├── chaos/, security/
    └── 124 test files
```

---

## 8. Interface Recommendations

### 8.1 Contract Interface (Strong Coupling)

**For:** Founder Mode, future HUMMBL products

```python
# Import pattern
import sys
sys.path.insert(0, 'agent-os/contracts/cost-governor')
from runtime_validator import validator
```

**Requirements:**
- SemVer versioning
- Breaking changes → major bump
- Frozen baselines tagged (e.g., `fm-contracts-v0.1`)

### 8.2 Skill Interface (Weak Coupling)

**For:** Any project wanting reusable capabilities

```
skill-name/
├── SKILL.md              # Required: metadata + instructions
├── scripts/              # Optional: executable helpers
├── references/           # Optional: documentation
└── assets/               # Optional: templates, images
```

**Requirements:**
- YAML frontmatter in SKILL.md
- Namespace by tool when useful
- Validate before use

### 8.3 Bus Interface (Coordination)

**For:** Multi-agent coordination

```
# TSV format: timestamp\tfrom\tto\tmessage\tsignature
2026-02-21T22:00:00Z\tclaude-code\tkimi-1\tBUILD_COMPLETE\t<sig>
```

**Requirements:**
- Tag identity in `from` column
- HMAC-SHA256 signing
- Append-only, never modify

### 8.4 Runtime Interface (Package Usage)

**For:** Projects needing orchestration runtime

```python
# packages/runtime/
from runtime.orchestrator import Orchestrator
from runtime.circuit_breaker import CircuitBreaker
```

---

## 9. Governance Patterns

### 9.1 HUMMBL Governance

- **Solo ownership** by Reuben
- Platform primitives for reuse
- Research program orientation
- Explicit provenance logging

### 9.2 Founder Mode Governance

- **Dan Matha leads**
- Founding Architect role
- Incorporates selected HUMMBL components
- Independent product decisions

### 9.3 Cross-Project Governance

| Decision Type | Authority |
|---------------|-----------|
| HUMMBL internal moves | Reuben only |
| Shared interface changes | Coordinate with Dan |
| Founder Mode product | Dan decides |
| Contract breaking changes | Both agree |

---

## 10. Summary & Key Takeaways

### 10.1 Ecosystem Structure

1. **HUMMBL is a solo platform** — not a parent org for all work
2. **Founder Mode is independent** — Dan-led collaboration, not a HUMMBL product
3. **Intentional transfer** — code/pattern sharing is logged, not automatic
4. **Porous boundary** — contracts flow via symlink, skills by import

### 10.2 Connection Strength Matrix

| From | To | Strength | Direction |
|------|-----|----------|-----------|
| agent-os/contracts | founder_mode | ████████ STRONG | → |
| packages/runtime | founder_mode | ████ WEAK | → |
| shared-hummbl-space | founder_mode | ████ WEAK | → |
| agent-os/skills | Any project | ████ WEAK | → |
| founder_mode/bus | HUMMBL pattern | ▒▒▒▒ SHARED | ↔ |

### 10.3 Canonical Wording

> HUMMBL and Founder Mode are related but independent initiatives. Founder Mode is a Dan-led collaboration that incorporates selected HUMMBL methods and components; it is not a HUMMBL product line.

---

## Appendices

### A. Directory Structure Reference

```
/Users/others/
├── hummbl/                         # HUMMBL platform root
│   ├── core/                       # New platform primitives
│   ├── shared/                     # (migration target)
│   ├── platform/                   # (migration target)
│   │   ├── gaas/
│   │   ├── mcp/
│   │   └── infra/
│   └── ecosystem/                  # Peer relationships
│
├── shared-hummbl-space/            # Shared cognition (active)
│   ├── agents/                     # 70+ agent definitions
│   ├── avatars/                    # 160+ avatar configs
│   ├── memory/                     # Daily + long-term memory
│   ├── registries/                 # Machine-readable inventories
│   └── scripts/                    # Tooling
│
├── agent-os/                       # Shared infrastructure
│   ├── skills/                     # 12 reusable skills
│   └── contracts/                  # 4 contract domains
│
├── founder_mode/                   # Founder Mode (independent)
│   ├── services/                   # 45 core modules
│   ├── integrations/               # 18 adapters
│   ├── bus/                        # Secure coordination bus
│   ├── agents/                     # Multi-agent systems
│   └── tests/                      # 3300+ tests
│
├── hummbl-gaas-platform/           # GaaS (migration planned)
├── hummbl-mcp-enhanced/            # MCP layer (migration planned)
├── hummbl-infra/                   # Infrastructure (migration planned)
├── hybrid-inference/               # Inference router (separate)
├── packages/runtime/               # Runtime package
├── platforms/                      # Cost governor configs
├── runtimes/openclaw/              # OpenClaw gateway
└── tools/                          # Utility scripts
```

### B. File References

| File | Purpose |
|------|---------|
| `/hummbl/README.md` | Platform migration plan |
| `/hummbl/ecosystem/README.md` | Peer project relationships |
| `/AGENTS.md` | Cross-agent conventions |
| `/CLAUDE.md` | Architecture details |
| `/agent-os/README.md` | Shared infrastructure guide |
| `/agent-os/SKILL_REGISTRY.md` | Skills index |
| `/shared-hummbl-space/README.md` | Shared workspace guide |

---

*End of Ecosystem Map*
