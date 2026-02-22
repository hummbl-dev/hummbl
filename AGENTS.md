# AGENTS.md

Cross-agent instructions for AI coding agents working in the HUMMBL repository.

## Project Ownership

**HUMMBL is a solo project.** You are the sole decision-maker. No external approvals required.

## Relationship to Founder Mode

**HUMMBL and Founder Mode are related but independent:**

- **HUMMBL** — This repo. Your platform. Solo ownership.
- **Founder Mode** — Dan Matha leads; you are Founding Architect. Separate repo.

**Key rule:** Founder Mode is **not a HUMMBL product**. Code transfers between projects are intentional and logged in `ecosystem/founder-mode.md`.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[test]"
```

## Testing

```bash
# Run all tests
python -m pytest tests/ -v

# With coverage
python -m pytest tests/ -v --cov=hummbl
```

## Conventions

- **Python 3.11+** required
- **Zero third-party runtime deps** for core — use stdlib only
- **Fully qualified imports:** `from hummbl.core.agent import Agent`
- **Contracts are canonical** — SemVer for breaking changes
- **No secrets in code** — env vars only

## Directory Ownership

| Directory | Purpose | Owner |
|-----------|---------|-------|
| `core/` | Platform primitives | You |
| `shared/` | Cognition layer | You |
| `platform/` | Services | You |
| `ecosystem/` | External relationships | You |
| `governance/` | Policies, specs | You |
| `docs/` | Documentation | You |

## Coordination

- Branch naming: `type/short-desc` (e.g., `feat/agent-lifecycle`)
- Commit format: Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- Push directly to `main` or use PRs — your choice
- Tag your identity in commit messages: `(claude)`, `(codex)`, `(kimi)`, `(gemini)`

## Safety Rules

1. **Never break Founder Mode** — It's Dan's project; coordinate if changing shared interfaces
2. **Preserve graceful failures** — All adapters must fail safely
3. **Log all cross-project transfers** — Update `ecosystem/founder-mode.md`
4. **Test before pushing** — Keep CI green

## Questions?

You are the product owner. When in doubt, trust your judgment.
