# HUMMBL Governance Patterns Discovery Report

**Discovery Date:** 2026-02-21  
**Focus Area:** Governance Patterns  
**Status:** Complete  

---

## Executive Summary

This report catalogs the governance structures across the HUMMBL ecosystem, identifying patterns from CAES (Coordination and Execution Standard), IDP (Intelligent Delegation Profile), founder_mode governance services, and hummbl-gaas-platform compliance frameworks.

### Key Findings

1. **Multi-layered governance architecture** with specification, enforcement, and audit layers
2. **Contract-driven compliance** via JSON schemas and runtime validators
3. **Append-only audit patterns** with TSV/JSONL formats and retention policies
4. **Graduated kill switch mechanisms** with 4 modes (DISENGAGED → HALT_NONCRITICAL → HALT_ALL → EMERGENCY)
5. **Intelligent delegation invariants** (I1-I6) for verifiable multi-agent task delegation

---

## 1. CAES (Coordination and Execution Standard)

### Overview
CAES defines minimum interoperability rules for humans, cloud models, local models, and deterministic scripts.

**Location:** `governance/CAES_SPEC.md`  
**Version:** v1.0.0  
**Canonical Hash:** `governance/CAES_CANONICAL.sha256`

### Core Principles

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| UTC Timestamps | All durable logs use ISO-8601 UTC | Schema validation |
| Append-Only Coordination | Historical entries immutable | File permissions, bus_writer with flock |
| Receipts-First | Actions require command output, file path, or log line | Audit verification |
| Draft-Only Local Inference | Local model output is advisory | State isolation |

### Coordination Bus Format

**Path:** `founder_mode/_state/coordination/messages.tsv`

**Schema (TSV):**
```
timestamp_utc | from | to | type | message
```

**Standard Message Types:**
- `PROPOSAL` - Intent before execution
- `ACK` - Acknowledgment
- `STATUS` - Progress update
- `SITREP` - End-of-thread summary with receipts
- `BLOCKED` - Cannot proceed (with blocker evidence)
- `DECISION` - Operator decision recorded
- `QUESTION` - Request for clarification

### Governance Guardrails

1. **Network/destructive ops** require explicit operator authorization
2. **Non-author approvals** use admin bypass only when authorized (logged to bus)
3. **No secrets in bus** - store privately, post only path and redacted summary

### Fork Exclusion Policy

External project forks are excluded from CAES compliance to avoid upstream merge conflicts:
- `clawdbot`, `OpenAgent`, `claude-code-infrastructure-showcase`
- `clawdhub`, `everything-claude-code`, `workflow`

---

## 2. IDP (Intelligent Delegation Profile)

### Overview
Formal specification for verifiable, auditable task delegation in multi-agent systems.

**Location:** `governance/profiles/intelligent-delegation/`  
**Version:** 0.1.0  
**Status:** Draft  
**Governance Posture:** Downstream Profile (Non-Canonical, built on Base120 v1.0)

### Five Tuple Schemas

| Tuple | Purpose | Key Fields |
|-------|---------|------------|
| **DCTX** | Delegation Context | intent_id, task_id, parent_task_id, delegator_id, delegatee_id, chain_depth, budget |
| **CONTRACT** | Task Requirements | objective, inputs, outputs, acceptance_tests, allowed_tools, denied_tools |
| **EVIDENCE** | Task Artifacts | artifacts (with SHA256), tool_trace, logs |
| **ATTEST** | Verification | checks_performed, evidence_hashes, result (PASS/FAIL/INCONCLUSIVE) |
| **DCT** | Capability Token | resource_selectors, ops_allowed, caveats, expiry, binding |

### Seven-State State Machine

```
PROPOSED → ISSUED → RUNNING → EVIDENCE_READY → VERIFIED
                                    ↓
                                REPLANNED → FAILED
```

**Transitions:**
- `PROPOSED → ISSUED`: Requires CONTRACT and DCT creation
- `ISSUED → RUNNING`: Requires delegatee acceptance (I2 enforced)
- `RUNNING → EVIDENCE_READY`: Requires EVIDENCE tuple (I4)
- `EVIDENCE_READY → VERIFIED`: Requires ATTEST with PASS
- `EVIDENCE_READY → REPLANNED`: Requires ATTEST with FAIL (I5)
- `REPLANNED → PROPOSED`: Creates new DCTX with incremented chain_depth

### Six Core Invariants (I1-I6)

| Invariant | Definition | Failure Code | Severity |
|-----------|------------|--------------|----------|
| **I1** | No Unverifiable Delegation - Every CONTRACT has ≥1 acceptance test | `IDP_E_UNVERIFIABLE` | CRITICAL |
| **I2** | Least Privilege - DCT grants only required capabilities | `IDP_E_DCT_VIOLATION` | CRITICAL |
| **I3** | Bounded Chain Depth - Max depth = 3 (configurable) | `IDP_E_DEPTH_EXCEEDED` | HIGH |
| **I4** | Evidence Before Verify - ATTEST requires EVIDENCE | `IDP_E_MISSING_EVIDENCE` | CRITICAL |
| **I5** | Explicit Replan - No silent retries; explicit decision required | `IDP_E_REPLAN_REQUIRED` | HIGH |
| **I6** | Audit Completeness - Complete, immutable audit trail | `IDP_E_AUDIT_INCOMPLETE` | CRITICAL |

### MCP/A2A Envelope Format

```json
{
  "protocol": "IDP/1.0",
  "message_id": "uuid",
  "sender": "agent_id",
  "recipient": "agent_id",
  "timestamp": "ISO8601",
  "type": "DELEGATE|ACCEPT|REJECT|EVIDENCE_SUBMIT|ATTEST|REPLAN|ABORT",
  "payload": { "dctx": {}, "contract": {}, "evidence": {}, "attest": {}, "dct": {} },
  "signature": "optional_hmac"
}
```

### Error Taxonomy

**Format:** `IDP_E_<CATEGORY>_<DETAIL>`

| Error Code | Description | Context |
|------------|-------------|---------|
| `IDP_E_UNVERIFIABLE` | CONTRACT lacks acceptance tests | I1 violation |
| `IDP_E_DCT_VIOLATION` | DCT grants excessive privileges | I2 violation |
| `IDP_E_DEPTH_EXCEEDED` | Delegation chain too deep | I3 violation |
| `IDP_E_MISSING_EVIDENCE` | Verification without evidence | I4 violation |
| `IDP_E_ATTESTATION_INVALID` | Evidence hashes don't match | I4 violation |
| `IDP_E_REPLAN_REQUIRED` | Failed task needs explicit replan | I5 violation |
| `IDP_E_AUDIT_INCOMPLETE` | Missing tuples in audit log | I6 violation |
| `IDP_E_BUDGET_EXCEEDED` | Task exceeded resource budget | Budget violation |
| `IDP_E_TIMEOUT` | Task exceeded wall time | Timeout |
| `IDP_E_TOOL_DENIED` | Attempted use of denied tool | I2 violation |

---

## 3. Coordination Bus Patterns

### Implementation: TSV-Based Bus

**Location:** `founder_mode/_state/coordination/messages.tsv`  
**Tooling:** `tools/scripts/post_coordination_message.py`, `tools/scripts/monitor_coordination_bus.py`

**Features:**
- File-based with `flock` mutual exclusion
- UTC timestamps (ISO-8601)
- Append-only writes
- Tab-separated columns

### Implementation: Governance Bus (IDP-Compliant)

**Location:** `founder_mode/services/governance_bus.py`

**Format:** JSONL (JSON Lines) with daily rotation

**Schema:**
```json
{
  "timestamp": "2026-02-21T21:00:00Z",
  "entry_id": "uuid",
  "intent_id": "uuid",
  "task_id": "uuid",
  "tuple_type": "DCTX|CONTRACT|EVIDENCE|ATTEST|DCT|SYSTEM",
  "tuple_data": {},
  "signature": "optional_hmac"
}
```

**Features:**
- Append-only atomic writes with `fsync`
- Daily file rotation
- 180-day retention (EU AI Act Art 26(5) compliance)
- 10MB size-based rotation with gzip compression
- Query by intent_id or task_id
- Optional async buffering
- Thread-safe with RLock

**Feature Flag:** `ENABLE_IDP=true` (default: enabled)

### Bus Message Types (Factorio Pattern)

- `PROPOSAL` - Suggested action
- `ACK` - Acknowledgment
- `STATUS` - Status update
- `SITREP` - Situation report
- `BLOCKED` - Blocked task
- `DECISION` - Authoritative decision
- `QUESTION` - Request for info
- `HEARTBEAT` - Agent health check
- `TASK_STARTED`, `TASK_COMPLETED`, `TASK_BLOCKED`
- `AGENT_SPAWNED`, `KILL_SWITCH`, `SNAPSHOT`

---

## 4. Cost Governance Mechanisms

### Cost Tracker

**Location:** `founder_mode/integrations/cost_tracker.py`

**Storage:** SQLite (`founder_mode/state/costs.db`)

**Schema:**
```sql
CREATE TABLE usage (
    record_id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    date TEXT NOT NULL,
    provider TEXT NOT NULL,  -- "anthropic", "openai"
    model TEXT NOT NULL,
    tokens_in INTEGER,
    tokens_out INTEGER,
    cost REAL NOT NULL,
    meta TEXT DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**BudgetStatus Decision Logic:**
```
current_spend >= hard_cap → DENY
current_spend >= soft_cap → WARN
threshold_percent >= 80%  → WARN
otherwise                 → ALLOW
```

**Default Caps:**
- Soft Cap: $50 USD/day
- Hard Cap: $100 USD/day

### Cost Governor Bridge

**Location:** `founder_mode/services/cost_governor_bridge.py`

**Purpose:** Bridge between CostTracker and cost-governor contract schema

**Validation Strategy (in order):**
1. Contract's runtime_validator (jsonschema + invariants)
2. jsonschema directly against schema file
3. Structural validation (stdlib fallback)

**Contract Schema Fields:**
- `currency`: USD, EUR, GBP
- `daily_soft_cap`: non-negative number
- `daily_hard_cap`: null or non-negative number
- `on_soft_cap`: log-only, degrade-model, notify-ops, queue-requests
- `on_hard_cap`: halt-all, halt-noncritical, queue-requests, queue-requests-defer, none
- `model_degrade_ladder`: array of model identifiers
- `allowlist_tasks_under_hard_cap`: array of task types

**Cross-Field Invariants:**
- `soft_cap <= hard_cap` (if hard_cap not null)
- `hard_cap is null → on_hard_cap == "none"`
- `on_soft_cap == "degrade-model" → model_degrade_ladder non-empty`
- `on_hard_cap == "halt-noncritical" → allowlist_tasks_under_hard_cap non-empty`

### Policy-Based Budget Caps (Casbin)

**Location:** `founder_mode/agents/factorio_system/workers/governance_agent.py`

**Tier-Based Caps:**
| Tier | Daily Soft | Daily Hard | Per-Request |
|------|------------|------------|-------------|
| developer | $50 | $100 | $1 |
| staging | $200 | $500 | $5 |
| production | $1,000 | $5,000 | $10 |

---

## 5. Kill Switch Implementations

### Core Kill Switch

**Location:** `founder_mode/services/kill_switch_core.py`  
**Source Pattern:** Factorio phase_a safety output

**Four Modes:**

| Mode | Behavior | Critical Tasks |
|------|----------|----------------|
| `DISENGAGED` | Normal operation | All allowed |
| `HALT_NONCRITICAL` | Queue non-critical, continue critical | Exempted |
| `HALT_ALL` | Stop all new work, complete in-flight | Critical only |
| `EMERGENCY` | Immediate halt, preserve all state | None (all blocked) |

**Critical Tasks (always allowed in HALT_NONCRITICAL):**
- `safety_monitoring`
- `data_persistence`
- `audit_logging`
- `kill_switch_itself`
- `cost_tracking`
- `feedback_store`

**API:**
```python
class KillSwitchCore:
    def engage(mode, reason, triggered_by, affected_tasks=0) → KillSwitchEvent
    def disengage(triggered_by, reason=None) → KillSwitchEvent
    def check_task_allowed(task_type) → {allowed, action, reason, note}
    def check_or_raise(task_type) → None | raises KillSwitchEngagedError
```

**Persistence:**
- State stored in `kill_switch_state.json`
- Auto-restores on initialization
- Event history maintained

### Legacy Kill Switch

**Location:** `founder_mode/services/kill_switch.py`

Similar to core but with additional critical task: `briefing_generation`

**CLI Interface:**
```bash
python -m founder_mode.services.kill_switch status
python -m founder_mode.services.kill_switch engage halt_all --reason "Budget exceeded"
python -m founder_mode.services.kill_switch disengage
```

---

## 6. Circuit Breaker Patterns

### Core Circuit Breaker

**Location:** `founder_mode/services/circuit_breaker.py`  
**Package:** `founder_mode/packages/runtime/circuit_breaker.py`

**Three States:**
1. `CLOSED` - Normal operation, failures tracked
2. `OPEN` - Failure threshold exceeded, calls rejected
3. `HALF_OPEN` - Recovery timeout elapsed, one probe allowed

**Configuration:**
```python
CircuitBreaker(
    failure_threshold=5,      # Consecutive failures before OPEN
    recovery_timeout=30.0,    # Seconds before HALF_OPEN
    on_state_change=callback  # Optional state change handler
)
```

**Integration Points:**
- Coordination bus publishing on state change
- Per-service circuit configuration
- Graceful degradation with fallback data

### Circuit Breaker Registry

**Location:** `founder_mode/services/circuit_breaker_integration.py`

**Service-Specific Configurations:**

| Service | Failure Threshold | Recovery Timeout | Rationale |
|---------|-------------------|------------------|-----------|
| GitHub | 3 | 60s | Rate limits |
| Calendar | 2 | 30s | User-facing |
| Signal | 5 | 120s | Async messaging |
| Cost Tracker | 2 | 30s | Critical for budget |
| Security | 3 | 60s | Important but deferrable |
| Linear | 3 | 45s | Issue tracking |
| Ollama | 2 | 90s | Local LLM, fragile |

**CircuitProtectedResult:**
```python
{
    success: bool,
    data: Any | None,
    circuit_open: bool,
    fallback_used: bool,
    error_message: str | None,
    latency_ms: float
}
```

---

## 7. Security Policies

### No Secrets in Code

**Policy File:** `SECURITY.md`

**Rules:**
- No API keys, tokens, or credentials in source
- All sensitive values use `${ENV_VAR_NAME}` syntax
- CI tests scan for secret-like patterns (`sk-` prefixes, bare `apiKey`)

### Dependency Policy

- Pin all production dependencies to exact versions
- Review dependency updates for security advisories
- Use `pip audit` in CI when available

### Vulnerability Reporting

1. Do NOT open public issue
2. Contact maintainers directly
3. Allow 48 hours for initial response

---

## 8. Audit Patterns

### Governance Bus Audit Log

**Location:** `founder_mode/_state/governance/governance-YYYY-MM-DD.jsonl`

**Retention:** 180 days (EU AI Act Art 26(5))

**Features:**
- Append-only JSONL format
- Daily rotation
- Gzip compression for old files
- Query by intent_id, task_id, tuple_type
- Integrity validation

### CAES Compliance History

**Location:** `governance/CAES_COMPLIANCE_HISTORY.tsv`

**Schema:**
```
timestamp_utc | version | repos_checked | compliant | non_compliant | compliance_rate | operator | notes
```

### Coordination Bus Audit

**Location:** `founder_mode/_state/coordination/messages.tsv`

**Integrity Checks:**
- Timestamp ordering validation
- Gap detection (possible outages)
- Chain hash computation (SHA256)

---

## 9. HUMMBL GaaS Platform Governance

### Compliance Framework

**Location:** `hummbl-gaas-platform/phase2/legal/COMPLIANCE_FRAMEWORK.md`

**Certifications Roadmap:**
| Certification | Status | Target Date |
|---------------|--------|-------------|
| SOC 2 Type I | In Progress | Q2 2026 |
| SOC 2 Type II | Planned | Q4 2026 |
| GDPR Compliance | Implemented | Complete |
| ISO 27001 | Planned | Q1 2027 |
| HIPAA | Planned | Q2 2027 |
| FedRAMP | Planned | 2028 |

### Trust Services Criteria

| Criteria | Status | Key Controls |
|----------|--------|--------------|
| Security | 85% | RBAC, SSO, AES-256, TLS 1.3, audit logging |
| Availability | 90% | 99.9% SLA, backups, DR plan, monitoring |
| Processing Integrity | 80% | Input validation, error handling, workflow validation |
| Confidentiality | 85% | Data classification, encryption, access logging |
| Privacy (GDPR) | 75% | Consent management, right to deletion |

### Data Retention

| Data Type | Retention | Method |
|-----------|-----------|--------|
| Account data | 7 years post-closure | Automated |
| Audit logs | 1 year | Automated |
| Agent configurations | Life of account | On deletion |
| Execution logs | 90 days | Automated |
| Support tickets | 3 years | Manual |
| Billing records | 7 years | Archived |

### Autonomous CEO System

**Location:** `hummbl-gaas-platform/docs/runbooks/AUTONOMOUS_CEO_SYSTEM.md`

**Founder Approval Gates:**
- Fundraising, equity, debt, M&A
- Human hiring/firing or compensation
- Legal signature obligations
- High-impact production cutovers

**KPI Guardrails:**
- No production-ready claim with open P0 blockers
- No investor-ready claim with unresolved finance contradictions
- No compliance-ready claim without evidence artifacts

---

## 10. Recommendations for HUMMBL Core Governance Primitives

Based on the discovery analysis, the following governance primitives should be core to HUMMBL:

### 10.1 Specification Layer

| Primitive | Source | Priority |
|-----------|--------|----------|
| **CAES_SPEC** | `governance/CAES_SPEC.md` | P0 - Canonical interoperability standard |
| **IDP_SPEC** | `governance/profiles/intelligent-delegation/` | P0 - Delegation contract standard |
| **Contract Schemas** | `contracts/*/schemas/` | P0 - Interface boundaries |
| **Base120 Models** | Mental model registry | P1 - Shared conceptual framework |

### 10.2 Enforcement Layer

| Primitive | Implementation | Priority |
|-----------|----------------|----------|
| **Kill Switch** | `kill_switch_core.py` | P0 - Emergency halt system |
| **Circuit Breaker** | `circuit_breaker.py` | P0 - Failure isolation |
| **Policy Enforcer** | Casbin-style | P1 - RBAC/ABAC |
| **Cost Governor** | `cost_governor_bridge.py` | P0 - Budget enforcement |
| **IDP Invariants** | Runtime validation | P1 - Delegation integrity |

### 10.3 Audit Layer

| Primitive | Format | Priority |
|-----------|--------|----------|
| **Coordination Bus** | TSV/JSONL append-only | P0 - Multi-agent communication |
| **Governance Bus** | JSONL with rotation | P0 - IDP tuple audit |
| **Compliance History** | TSV | P1 - CAES tracking |
| **Cost Tracking** | SQLite | P0 - Budget audit |

### 10.4 Recommended Governance Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    SPECIFICATION LAYER                       │
│  CAES_SPEC  +  IDP_SPEC  +  Contract Schemas                 │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    ENFORCEMENT LAYER                         │
│  Kill Switch  +  Circuit Breaker  +  Policy Enforcer        │
│  Cost Governor  +  IDP Invariant Validator                   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    COORDINATION LAYER                        │
│  Coordination Bus (TSV)  +  Governance Bus (JSONL)          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                         │
│  SQLite (costs)  +  File-based (bus logs)  +  JSON (state)  │
└─────────────────────────────────────────────────────────────┘
```

### 10.5 Critical Governance Workflows

1. **Emergency Response:** Kill Switch → Circuit Breaker → Coordination Bus Alert
2. **Budget Enforcement:** Cost Tracker → Cost Governor Bridge → Kill Switch (on hard cap)
3. **Delegation Verification:** IDP Tuple → Invariant Validation → Governance Bus Append
4. **Compliance Audit:** CAES Compliance Check → TSV History → Report Generation

### 10.6 Key Configuration Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `MAX_DELEGATION_DEPTH` | 3 | 1-10 | IDP subdelegation limit |
| `MAX_REPLANS` | 2 | 1-5 | IDP retry limit |
| `CIRCUIT_FAILURE_THRESHOLD` | 3-5 | 1-10 | Service-specific |
| `CIRCUIT_RECOVERY_TIMEOUT` | 30-120s | 0-300s | Service-specific |
| `DEFAULT_SOFT_CAP` | $50 | 0+ | Daily budget warning |
| `DEFAULT_HARD_CAP` | $100 | 0+ | Daily budget halt |
| `GOVERNANCE_RETENTION_DAYS` | 180 | 90-2555 | EU AI Act compliance |

---

## Appendices

### A. File Locations Summary

| Component | Path |
|-----------|------|
| CAES Spec | `governance/CAES_SPEC.md` |
| CAES Version | `governance/CAES_VERSION` |
| CAES Compliance History | `governance/CAES_COMPLIANCE_HISTORY.tsv` |
| Fork Exclusions | `governance/CAES_FORK_EXCLUSIONS` |
| IDP Spec | `governance/profiles/intelligent-delegation/IDP_SPEC.md` |
| IDP Invariants | `governance/profiles/intelligent-delegation/IDP_INVARIANTS.md` |
| IDP Failure Codes | `governance/profiles/intelligent-delegation/IDP_FAILURE_CODES.md` |
| IDP Schema | `governance/profiles/intelligent-delegation/schemas/idp.schema.json` |
| Kill Switch Core | `founder_mode/services/kill_switch_core.py` |
| Circuit Breaker | `founder_mode/services/circuit_breaker.py` |
| Cost Tracker | `founder_mode/integrations/cost_tracker.py` |
| Cost Governor Bridge | `founder_mode/services/cost_governor_bridge.py` |
| Governance Bus | `founder_mode/services/governance_bus.py` |
| Coordination Bus | `founder_mode/_state/coordination/messages.tsv` |
| GaaS Compliance | `hummbl-gaas-platform/phase2/legal/COMPLIANCE_FRAMEWORK.md` |

### B. Cross-References

- **CLAUDE.md:** Full architecture details
- **AGENTS.md:** Cross-agent instructions
- **CONTRIBUTING.md:** Commit conventions
- **GOVERNANCE.md:** Contract authority and runtime replaceability
- **SECURITY.md:** No secrets policy and vulnerability reporting

---

*Report generated by HUMMBL Discovery Team - Governance Patterns Focus*  
*Timestamp: 2026-02-21T21:51:04Z*
