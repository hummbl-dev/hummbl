# AGENTS.md

Cross-agent instructions for AI coding agents working in the HUMMBL repository.

## Project Ownership

**HUMMBL is a solo project.** You are the sole decision-maker. No external approvals required.

## Relationship to Founder Mode

**HUMMBL and Founder Mode are related but independent:**

- **HUMMBL** -- This repo. Your platform. Solo ownership.
- **Founder Mode** -- Dan Matha leads; you are Founding Architect. Separate repo.

**Key rule:** Founder Mode is **not a HUMMBL product**. Code transfers between projects are intentional and logged in `ecosystem/founder-mode.md`.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[test]"
```

## Testing

```bash
python -m pytest tests/ -v
python -m pytest tests/ -v --cov=hummbl
```

## Five-Layer Model

Read `ARCHITECTURE.md` for the full model. The key rule: **dependencies point upward, execution flows downward.**

- L4 `base120` -- Governance canon (separate repo)
- L3 `aaa` -- Deterministic kernel (separate repo)
- L2 `libs/`, `packages/` -- Platform libraries (this repo)
- L1 `apps/`, `skills/` -- Applications (this repo)
- L0 `.github/`, `tools/`, `shared/`, `data/` -- Infrastructure (this repo)

## Directory Ownership

| Directory | Layer | Purpose | Owner |
|-----------|-------|---------|-------|
| `libs/` | L2 | Publishable Python packages | @hummbl-dev/core |
| `packages/` | L2 | Publishable TypeScript packages | @hummbl-dev/platform |
| `apps/` | L1 | Deployable applications | @hummbl-dev/core + platform |
| `skills/` | L1 | Agent skill definitions | @hummbl-dev/platform |
| `governance/` | L0 | CAES copy, policies | @hummbl-dev/governance |
| `shared/` | L0 | Agent identities, cognition | @hummbl-dev/platform |
| `data/` | L0 | Canonical shared data | @hummbl-dev/platform |
| `tools/` | L0 | Internal tooling | @hummbl-dev/platform |
| `docs/` | L0 | Documentation | @hummbl-dev/platform |
| `ecosystem/` | L0 | External relationships | @hummbl-dev/platform |

## Conventions

- **Python 3.11+** required
- **Zero third-party runtime deps** for core -- use stdlib only
- **Contracts are canonical** -- SemVer for breaking changes
- **No secrets in code** -- env vars only
- **Commit format:** Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- **Branch naming:** `type/short-desc` (e.g., `feat/agent-lifecycle`)

## Boundary Rules

See `REPO_BOUNDARY_POLICY.md` for the 10 CI failure codes. The critical ones:

- **B_VALIDATOR_OVERRIDE** -- Never redefine kernel functions in this repo.
- **B_UPWARD_DEPENDENCY** -- Never import from a lower-authority layer.
- **B_PIN_MISMATCH** -- Keep `dependency_pins.json` in sync with `pyproject.toml`.

## Coordination

- Push directly to `main` or use PRs -- your choice.
- Tag your identity in commit messages: `(claude)`, `(codex)`, `(kimi)`, `(gemini)`.

## Safety Rules

1. **Never break Founder Mode** -- It's Dan's project; coordinate if changing shared interfaces.
2. **Preserve graceful failures** -- All adapters must fail safely.
3. **Log all cross-project transfers** -- Update `ecosystem/founder-mode.md`.
4. **Test before pushing** -- Keep CI green.
5. **Never point dependencies downward** -- L2 cannot import L1. L3 cannot import L2.
