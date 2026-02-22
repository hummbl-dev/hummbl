# HUMMBL Shared Cognition Layer Discovery Report

**Discovery Date:** 2026-02-21  
**Focus Area:** Shared Cognition  
**Location:** `/Users/others/shared-hummbl-space/`  
**Team:** HUMMBL Discovery Team  

---

## Executive Summary

The HUMMBL Shared Cognition Layer is a sophisticated multi-agent identity and coordination system residing in `shared-hummbl-space/`. It provides canonical identity, memory, avatar, and governance infrastructure for 70+ agents across the HUMMBL ecosystem. The system follows a strict ritual-based agent birth process, maintains machine-readable registries, and coordinates via a TSV-based message bus.

---

## 1. Directory Structure

```
shared-hummbl-space/
├── AGENT.md                      # Shared operating guide for terminal agents
├── AGENT_BIRTH_LOG_TEMPLATE.md   # Template for agent birth records
├── AGENT_BIRTH_PROCESS.md        # Ritual process for spawning new agents
├── AUDIT_REPORT.md               # Audit findings (2026-02-05)
├── CLASSIFICATION.md             # Experimental classification metadata
├── IDENTITY.md                   # Workspace identity definition
├── PLAN.md                       # Remediation workstreams
├── README.md                     # Main workspace documentation
├── SOUL.md                       # Shared behavioral principles
├── USER.md                       # Human user (Reuben) profile
├── _state/                       # Runtime artifacts (gitignored)
├── agents/                       # 70 individual agent directories
├── avatars/                      # 158 avatar files (PNG, briefs, gallery)
├── configs/                      # Configuration schemas
├── governance/                   # CAES spec, versioning
├── hummbl-integration/           # Integration guides & case studies
├── memory/                       # Daily logs & long-term memory
├── projects/                     # Active projects (rollback-coordinator)
├── registries/                   # Machine-readable JSON inventories
└── scripts/                      # Utility tooling (lint, check, generate)
```

---

## 2. Identity System Architecture

### 2.1 The Three-Layer Identity Stack

The HUMMBL identity system is built on three interconnected concepts:

#### **SOUL.md** — Behavioral Constitution
- Defines mission, core truths, boundaries, operating rhythm
- Contains communication style, initiative guidelines
- Evolves with lessons learned (versioned history)
- Example: Governance-first, evidence-based, calm voice/sharp thinking

#### **USER.md** — Human Context
- Reuben Bowlby profile (he/him, America/New_York)
- Communication preferences (concise, citation-backed)
- Authority boundaries (escalation requirements)
- Safety-first approach for destructive operations

#### **AGENT.md** — Operational Orders
- Specific to each agent instance
- Authority boundaries matrix (what's allowed/prohibited)
- Communication protocol and tooling
- Entry points and specialized skills

### 2.2 Per-Agent Identity Files

Each agent directory contains a complete identity stack:

```
agents/<name>/
├── AGENT.md       # Operational brief, authority levels
├── IDENTITY.md    # Name, creature, vibe, emoji, avatar
├── MEMORY.md      # Long-term durable facts
├── SOUL.md        # Behavioral guidelines
├── USER.md        # Human context (often symlinked)
└── memory/        # Daily memory files (YYYY-MM-DD.md)
```

### 2.3 Terminal Agent Definitions

| Agent | CLI | Bus Identity | Config Home | Role |
|-------|-----|-------------|-------------|------|
| **Claude Code** | `claude` | `claude-code`, `claude-opus-god-mode` | `~/.claude/ + CLAUDE.md` | Lead: integration, hardening, TDD, shipping |
| **Codex** | `codex` | `codex`, `codex-cheap` | `~/.codex/ + AGENTS.md` | Verifier: test suites, CI checks, code review |
| **Kimi** | `kimi` | `kimi-1`, `kimi-2` | `~/.kimi/KIMI.md` | Builder: greenfield generation, large-scale output |
| **Gemini** | `gemini` | `gemini` | `~/.gemini/GEMINI.md` | Analyst: research, docs, release notes |

---

## 3. Agent Birth Process

The `AGENT_BIRTH_PROCESS.md` defines a ritualized 6-step procedure:

### 3.1 Birth Ritual Steps

1. **Copy Bootstrap Template** — From `workspace/active/openclaw/docs/reference/templates/BOOTSTRAP.md`
2. **Run the Conversation** — Human + agent establish name, creature, vibe, emoji, avatar
3. **Create Identity Stack** — `IDENTITY.md`, `USER.md`, `SOUL.md` (human-approved)
4. **Retire BOOTSTRAP** — Delete after human confirms identity stack
5. **Log the Birth** — Create `memory/YYYY-MM-DD.md` + update `avatars/GALLERY.md`
6. **Ongoing Refinement** — Evolve identity with human approval

### 3.2 Avatar Review Checklist

Before approval, avatars must pass 5 checks:
1. Emoji alignment — art encodes the agent's emoji
2. Contrast/readability — legible at 128×128 and 32×32
3. Palette compliance — matches HUMMBL palette
4. Variants exported — color + mono PNGs + source
5. Approval metadata — date + human recorded

### 3.3 Current Agent Census

**Total Agents: 70+** including:

**Primary Terminal Agents (4):** Claude, Codex, Kimi, Gemini

**Individual Agents (50+):** Scout, Pulse, Echo, Thesis, Antithesis, Synthesis, Redline, Bluewall, Purplebridge, Atlas, Forge, Vigil, Quorum, Flux, Prism, Vector, Circuit, Sentinel, Chronos, Nexus, Halo, Quill, Matrix, Guardian, Tempo, Relay, Loom, Beacon, Glyph, Kernel, Orbit, Ember, Harbor, Whisper, Vault, RPBx, Anchor, Axis, Forgefire, Pulsewave, Relayor, Scribe, Shield, Spark, Tempofox, Warden, Ledger, Triage, A11y

**Team Collectives (6):**
- Dialectic Team (Thesis/Antithesis/Synthesis)
- Red-Blue-Purple Team (Redline/Bluewall/Purplebridge)
- Pentad Team (Atlas/Forge/Vigil/Quorum/Flux)
- HexaOps Team (Prism/Vector/Circuit/Sentinel/Chronos/Nexus)
- Septet Team (Halo/Quill/Matrix/Guardian/Tempo/Relay/Loom)
- Octave Team (Beacon/Glyph/Kernel/Orbit/Ember/Harbor/Whisper/Vault)

**New P1 Agents (4):** test-harness, cost-optimizer, incident-commander, knowledge-curator

---

## 4. Avatar System

### 4.1 Avatar Assets

**Location:** `avatars/`
**Total Files:** 158
- 51 avatar briefs (`*-avatar-brief.md`)
- 102 avatar images (PNG: color + mono variants)
- 5 additional files (SVG, scripts, docs)

### 4.2 Avatar Gallery

`avatars/GALLERY.md` contains the canonical catalog with:
- Agent name and emoji
- Primary and mono asset paths
- Approval status (✅ Approved / ⏳ Pending / ♻ Shared)
- Design notes and palette references

### 4.3 Generation Process

```bash
# Generate avatar assets
scripts/generate-avatar.sh --output avatars/<name>-avatar.png --mode color
scripts/generate-avatar.sh --output avatars/<name>-avatar-mono.png --mode mono
```

Uses `generate_compass_avatar.py` with customizable palette and geometry flags.

### 4.4 Sample Approved Avatars

| Agent | Emoji | Description | Status |
|-------|-------|-------------|--------|
| Codex | 🧭 | Compass + grid badge | ✅ Approved (2026-02-05) |
| Scout | 🛰 | Orbiting satellite | ✅ Approved (2026-02-05) |
| Kimi | 🔧 | Steel/orange wrench | ✅ Approved (2026-02-05) |
| Atlas | 🧠 | Constellation strategy | ✅ Approved (2026-02-05) |
| Warden | 🔐 | Shield-lock badge | ✅ Approved (2026-02-06) |

---

## 5. Memory Organization

### 5.1 Memory Structure

```
memory/
├── .gitkeep
├── 2026-02-05.md              # Daily memory log
└── 2026-02-05-kimi-birth.md   # Agent-specific birth record
```

### 5.2 Memory Guidelines (from `memory.json`)

- **Daily logs:** Create `memory/YYYY-MM-DD.md` at session start
- **Long-term:** Promote durable facts into `MEMORY.md`
- **Run log:** Flow-mode work → `workspace/multi-agent-coding-session/RUN_LOG.md`
- **Lint:** `scripts/lint_agents.py` auto-detects latest log

### 5.3 Per-Agent Memory

Each agent has its own `memory/` subdirectory:
```
agents/<name>/memory/
├── .gitkeep
├── 2026-02-05.md              # Daily log
└── patient-chart-*.md         # Specialized logs (e.g., lead-doctor)
```

### 5.4 Birth Log Template

Standard format in `AGENT_BIRTH_LOG_TEMPLATE.md`:
- Birth Record header (date, session, human, agent)
- Creature/Vibe and Emoji
- Avatar assets checklist
- Approval checklist (5 items)
- Identity artifacts created
- Notes from birth conversation
- Next actions

---

## 6. Registry System

Machine-readable JSON inventories in `registries/`:

### 6.1 `agents.json` (605 lines)
- 4 primary agents (Claude, Codex, Kimi, Gemini)
- 60+ individual agents and teams
- Fields: callsign, name, emoji, summary, status, home, artifacts, type

### 6.2 `tools.json`
Script inventory with risk levels:
- `lint_agents.py` — Validates agent directories (low risk)
- `check_avatars.py` — Validates avatar PNGs (low risk)
- `link-shared-workspace.sh` — Symlinks identity stack (medium risk)
- `generate-avatar.sh` — Avatar generator wrapper (low risk)
- `agent_lookup.py` — Query agent registry (low risk)

### 6.3 `governance.json`
Policy references:
- HUMMBL-GOVERNOR (root authority)
- EXECUTION_AUTHORITY_PROTOCOL
- Flow/Balanced/Strict profiles

### 6.4 `memory.json`
Memory cadence guidelines:
- Daily log creation
- Long-term memory promotion
- Run log for Flow-mode

### 6.5 `playbooks.json`
Team playbook registry

### 6.6 `workstreams.json`
Active initiative tracking

---

## 7. Utility Scripts

### 7.1 Core Scripts (`scripts/`)

| Script | Purpose | Risk |
|--------|---------|------|
| `lint_agents.py` | Validates agent directories, birth logs, artifact folders | Low |
| `check_avatars.py` | Ensures avatar PNGs exist with valid headers | Low |
| `generate_agent_registry.py` | Parses IDENTITY.md → `registries/agents.json` | Low |
| `agent_lookup.py` | Query agent/team details by callsign | Low |
| `generate-avatar.sh` | CLI wrapper for avatar generator | Low |
| `link-shared-workspace.sh` | Symlinks shared stack into target workspace | Medium |
| `hummbl-inventory.sh` | Inventory script (requires HUMMBL_REMOTE) | Medium |
| `hummbl-sync.sh` | Sync script (requires HUMMBL_SYNC_TARGET) | Medium |
| `cost-control.py` | Cost tracking and budget enforcement | - |

### 7.2 Lint Checks

`lint_agents.py` validates:
- Required files: `IDENTITY.md`, `USER.md`, `SOUL.md`, `AGENT.md`, `MEMORY.md`
- Birth log exists and is non-empty
- `AGENT.md` home path matches expected
- Referenced artifact folders exist

---

## 8. Team Structure & Playbooks

### 8.1 Team Collective Pattern

Teams are defined as collectives with shared playbooks:

**Example: Dialectic Team**
```
agents/dialectic/
├── AGENT.md       # Minimal reference
├── IDENTITY.md    # Team identity (uses member avatars)
├── MEMORY.md      # Team memory
├── PLAYBOOK.md    # Coordination rules
├── SOUL.md        # Team principles
├── USER.md        # Human context
└── memory/        # Daily logs
```

### 8.2 Dialectic Playbook

3-agent debate cycle:
1. **Thesis** drafts propositions → `agents/thesis/debates/<topic>.md`
2. **Antithesis** counters → `agents/antithesis/debates/<topic>.md`
3. **Synthesis** reconciles → `agents/synthesis/debates/<topic>.md`

Rules:
- Every step cites files/lines
- Each agent updates their `memory/YYYY-MM-DD.md`
- Synthesis cannot close until both inputs logged

---

## 9. Governance & CAES

### 9.1 CAES (Coordination and Execution Standard)

Location: `governance/CAES_SPEC.md`

**Non-Negotiables:**
- UTC timestamps only in durable logs
- Append-only coordination (no editing historical bus entries)
- Receipts-first (command output, file path, or log line)
- Draft-only local inference (terminal + CI authoritative)

**Coordination Bus:**
- TSV format at `founder_mode/_state/coordination/messages.tsv`
- Columns: `timestamp_utc`, `from`, `to`, `type`, `message`
- Message types: PROPOSAL, ACK, STATUS, SITREP, BLOCKED, DECISION, QUESTION

### 9.2 Governance Registry

Policies tracked:
- HUMMBL-GOVERNOR: Root authority (AUTHORIZE/DENY)
- EXECUTION_AUTHORITY_PROTOCOL: Authority matrix
- Flow/Balanced/Strict profiles: Audit modes

---

## 10. Integration with Workspace

### 10.1 Symlink Pattern

The `workspace/` directory symlinks to shared-hummbl-space:

```
workspace/
├── AGENT.md -> shared-hummbl-space/AGENT.md
├── IDENTITY.md -> shared-hummbl-space/IDENTITY.md
├── SOUL.md -> shared-hummbl-space/SOUL.md
├── USER.md -> shared-hummbl-space/USER.md
├── agents -> shared-hummbl-space/agents
├── avatars -> shared-hummbl-space/avatars
└── memory -> shared-hummbl-space/memory
```

### 10.2 Linking Script

```bash
# Link shared workspace into target
shared-hummbl-space/scripts/link-shared-workspace.sh ~/workspace/my-project
```

---

## 11. Migration Recommendations

### 11.1 What Should Migrate to `~/workspace/hummbl/shared/`

Based on the discovery, the following components are candidates for migration to the operational workspace:

#### **Tier 1: Critical (Migrate Immediately)**

| Component | Destination | Rationale |
|-----------|-------------|-----------|
| `registries/` | `workspace/hummbl/shared/registries/` | Machine-readable agent/tool/governance data |
| `scripts/agent_lookup.py` | `workspace/hummbl/shared/scripts/` | Essential agent query tool |
| `scripts/lint_agents.py` | `workspace/hummbl/shared/scripts/` | Agent validation |
| `scripts/check_avatars.py` | `workspace/hummbl/shared/scripts/` | Avatar validation |
| `AGENT_BIRTH_PROCESS.md` | `workspace/hummbl/shared/docs/` | Canonical birth ritual |
| `AGENT_BIRTH_LOG_TEMPLATE.md` | `workspace/hummbl/shared/templates/` | Birth log template |

#### **Tier 2: Important (Migrate Next)**

| Component | Destination | Rationale |
|-----------|-------------|-----------|
| `avatars/GALLERY.md` | `workspace/hummbl/shared/avatars/` | Avatar catalog |
| `governance/CAES_SPEC.md` | `workspace/hummbl/shared/governance/` | Coordination standard |
| `governance/CAES_VERSION` | `workspace/hummbl/shared/governance/` | Version tracking |
| `PLAN.md` | `workspace/hummbl/shared/docs/` | Workstream tracking |

#### **Tier 3: Reference (Migrate as Needed)**

| Component | Destination | Rationale |
|-----------|-------------|-----------|
| `agents/*/PLAYBOOK.md` | `workspace/hummbl/shared/playbooks/` | Team coordination patterns |
| `hummbl-integration/` | `workspace/hummbl/shared/docs/integration/` | Integration guides |
| `projects/rollback-coordinator/` | `workspace/hummbl/projects/` | Active project |

#### **Tier 4: Stay in Shared Space**

| Component | Keep Location | Rationale |
|-----------|---------------|-----------|
| `avatars/*.png` | `shared-hummbl-space/avatars/` | Large binary assets |
| `avatars/*-brief.md` | `shared-hummbl-space/avatars/` | Design documentation |
| `agents/*/memory/` | `shared-hummbl-space/agents/` | Per-agent private memory |
| `_state/` | `shared-hummbl-space/_state/` | Runtime artifacts (gitignored) |

### 11.2 Migration Script Suggestion

```bash
#!/bin/bash
# migrate-shared-cognition.sh

SOURCE="/Users/others/shared-hummbl-space"
DEST="/Users/others/workspace/hummbl/shared"

# Create directory structure
mkdir -p $DEST/{registries,scripts,docs,templates,avatars,playbooks,governance}

# Tier 1: Critical
cp $SOURCE/registries/* $DEST/registries/
cp $SOURCE/scripts/agent_lookup.py $DEST/scripts/
cp $SOURCE/scripts/lint_agents.py $DEST/scripts/
cp $SOURCE/scripts/check_avatars.py $DEST/scripts/
cp $SOURCE/AGENT_BIRTH_PROCESS.md $DEST/docs/
cp $SOURCE/AGENT_BIRTH_LOG_TEMPLATE.md $DEST/templates/

# Tier 2: Important
cp $SOURCE/avatars/GALLERY.md $DEST/avatars/
cp $SOURCE/governance/CAES* $DEST/governance/
cp $SOURCE/PLAN.md $DEST/docs/

# Tier 3: Reference
find $SOURCE/agents -name "PLAYBOOK.md" -exec cp {} $DEST/playbooks/ \;
cp -r $SOURCE/hummbl-integration/* $DEST/docs/integration/ 2>/dev/null || true

echo "Migration complete. Review $DEST for accuracy."
```

### 11.3 Post-Migration Steps

1. **Update symlinks** in `workspace/` to point to new locations where appropriate
2. **Version control** the migrated content in `workspace/hummbl/`
3. **Update scripts** to reference new paths
4. **Test validation scripts** (`lint_agents.py`, `check_avatars.py`)
5. **Document the migration** in memory logs

---

## 12. Key Insights

### 12.1 Strengths of the System

1. **Ritual-Based Agent Creation** — The birth process ensures consistency
2. **Machine-Readable Registries** — JSON files enable automation
3. **Visual Identity System** — 50+ approved avatars with consistent design
4. **Multi-Agent Coordination** — TSV bus enables cross-agent communication
5. **Governance-First Design** — CAES spec, authority matrices, approval workflows

### 12.2 Potential Gaps

1. **Agent Status Tracking** — Many agents marked "unknown" status (awaiting approval)
2. **Memory Fragmentation** — Daily logs scattered across agent directories
3. **Script Dependencies** — Some scripts reference external paths that may not exist
4. **Documentation Drift** — Multiple README files with overlapping content

### 12.3 Recommendations

1. **Consolidate registries** into a single operational location
2. **Automate status updates** via CI/CD integration
3. **Create unified memory index** for cross-agent search
4. **Standardize script paths** for portability

---

## 13. Files Referenced

### Core Identity Files
- `/Users/others/shared-hummbl-space/SOUL.md`
- `/Users/others/shared-hummbl-space/USER.md`
- `/Users/others/shared-hummbl-space/AGENT.md`
- `/Users/others/shared-hummbl-space/IDENTITY.md`

### Process Documentation
- `/Users/others/shared-hummbl-space/AGENT_BIRTH_PROCESS.md`
- `/Users/others/shared-hummbl-space/AGENT_BIRTH_LOG_TEMPLATE.md`

### Registries
- `/Users/others/shared-hummbl-space/registries/agents.json`
- `/Users/others/shared-hummbl-space/registries/tools.json`
- `/Users/others/shared-hummbl-space/registries/governance.json`
- `/Users/others/shared-hummbl-space/registries/memory.json`

### Agent Samples
- `/Users/others/shared-hummbl-space/agents/claude/IDENTITY.md`
- `/Users/others/shared-hummbl-space/agents/kimi/IDENTITY.md`
- `/Users/others/shared-hummbl-space/agents/codex/IDENTITY.md`
- `/Users/others/shared-hummbl-space/agents/dialectic/PLAYBOOK.md`

### Scripts
- `/Users/others/shared-hummbl-space/scripts/lint_agents.py`
- `/Users/others/shared-hummbl-space/scripts/check_avatars.py`
- `/Users/others/shared-hummbl-space/scripts/agent_lookup.py`
- `/Users/others/shared-hummbl-space/scripts/generate_agent_registry.py`

### Governance
- `/Users/others/shared-hummbl-space/governance/CAES_SPEC.md`

---

## 14. Appendix: Agent Census

### Full Agent List (from registries/agents.json)

**Primary Agents:**
- `claude` — Claude Code 🎯 (Lead: integration, hardening, TDD)
- `codex` — Codex 🧭 (Verifier: test suites, CI checks)
- `kimi` — Kimi 🔧 (Builder: greenfield generation)
- `gemini` — Gemini 💎 (Analyst: research, docs)

**Individual Agents (Sample):**
- `anchor`, `antithesis`, `atlas`, `axis`, `beacon`, `bluewall`, `chronos`, `circuit`
- `echo`, `ember`, `flux`, `forge`, `forgefire`, `glyph`, `guardian`, `halo`
- `harbor`, `kernel`, `loom`, `matrix`, `nexus`, `orbit`, `prism`, `pulse`
- `purplebridge`, `quill`, `quorum`, `redline`, `relay`, `relayor`, `rpbx`
- `scout`, `scribe`, `sentinel`, `shield`, `spark`, `synthesis`, `tempo`
- `tempofox`, `thesis`, `vault`, `vector`, `vigil`, `whisper`

**Teams:**
- `dialectic` — Thesis/Antithesis/Synthesis debates
- `hexaops` — Research→plan→build→QA→schedule→brief
- `octave` — Risk/experience/core/integration/performance/release/liaison/archive
- `pentad` — Strategic/build/monitor/analytics/automation
- `red-blue-purple` — Offense/defense/coordination
- `septet` — Vision/docs/data/security/cadence/comms/memory

**New P1 Agents:**
- `test-harness` — Automated testing
- `cost-optimizer` — Cost management
- `incident-commander` — Crisis response
- `knowledge-curator` — Knowledge management

---

*Report generated by HUMMBL Discovery Team — Shared Cognition Focus*  
*Timestamp: 2026-02-21T22:12:45Z*
