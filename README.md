# HUMMBL

Foundational AI orchestration platform owned and operated as a solo project.

## Scope

- `hummbl` is the platform workspace for reusable AI system primitives.
- Founder Mode is a related but independent Dan-led collaboration.
- Founder Mode may consume selected HUMMBL patterns, but it is not a HUMMBL product line.

Cross-project dependencies and code transfers are tracked in `ecosystem/founder-mode.md`.

## Quick Start

```bash
git clone git@github.com:hummbl-dev/hummbl.git
cd hummbl
./scripts/bootstrap.sh
```

This creates `.venv`, installs test/dev tooling, verifies repository layout, and runs lint/type/test checks.

## Operator Commands

```bash
# Install/update local environment
make bootstrap

# Validate repository structure
make verify

# Lint and type-check
make lint
make typecheck

# Run tests
make test

# Run full local gate
make check
```

## Repository Layout

```text
hummbl/
├── core/              # Platform primitives
├── shared/            # Shared cognition assets (agents, avatars, memory)
├── platform/          # Platform infrastructure surfaces (gaas, mcp, infra)
├── ecosystem/         # Relationship and dependency boundaries
├── governance/        # Policies, interfaces, and decision records
├── docs/              # Setup and operating documentation
├── scripts/           # Bootstrap and verification scripts
├── tests/             # Test suite for repository tooling
└── hummbl/            # Python package (CLI and platform modules)
```

## Compatibility

- Python 3.11+
- macOS and Linux shell environments
- Zero third-party runtime dependencies in core package paths

## Security Baseline

- Never commit secrets, API keys, certificates, or private tokens.
- Keep local runtime state out of git (`_state/`, logs, pid files).
- Validate changes with `make check` before push.

## Agent Access

Any terminal agent (Claude, Codex, Kimi, Gemini) can operate on this repo when they:

1. Clone the same remote.
2. Run `./scripts/bootstrap.sh`.
3. Follow `AGENTS.md` conventions.

## Status

Current baseline release: `0.1.0`

## License

Private. See `LICENSE`.
