# HUMMBL

> Foundational AI orchestration platform. Solo project.

## What This Is

HUMMBL is the core platform for building agent-based systems. It provides:

- **Core primitives** for agent lifecycle, memory, and coordination
- **Shared cognition** layer (agents, avatars, memory stores)
- **Platform services** (governance, MCP, infrastructure)
- **Governance patterns** for safe, observable, cost-controlled AI systems

## Relationship to Other Projects

**HUMMBL and Founder Mode are related but independent.**

- **HUMMBL** (`hummbl/`) — This repo. Solo platform project.
- **Founder Mode** (`founder_mode/`) — Dan Matha leads; you are Founding Architect. Incorporates selected HUMMBL patterns but is **not a HUMMBL product**.

Code/pattern transfers between projects are intentional and logged.

## Directory Structure

```
hummbl/
├── core/                    # Platform primitives
│   ├── agent-lifecycle/
│   ├── memory-management/
│   └── coordination/
│
├── shared/                  # Shared cognition layer
│   ├── agents/              # Agent definitions
│   ├── avatars/             # Avatar configurations
│   └── memory/              # Shared memory stores
│
├── platform/                # Platform services
│   ├── gaas/                # Governance/Graph as a Service
│   ├── mcp/                 # Model Context Protocol
│   └── infra/               # Infrastructure primitives
│
├── ecosystem/               # Related independent initiatives
│   └── founder-mode.md      # Relationship documentation
│
├── governance/              # Platform governance
├── docs/                    # Documentation
└── tests/                   # Test suite
```

## Principles

1. **Zero third-party runtime dependencies** — Core uses Python stdlib only
2. **Contract-driven** — All interfaces are versioned and validated
3. **Cost governance** — Budget tracking and kill switches built-in
4. **Observable** — Everything emits structured telemetry
5. **Safe by default** — Graceful degradation, typed errors, circuit breakers

## Getting Started

```bash
# Setup
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[test]"

# Run tests
python -m pytest tests/ -v

# Validate structure
./scripts/verify-layout.sh
```

## Agent Access

This repo is accessible to all terminal agents:
- **Claude Code** — Primary architect
- **Codex** — Audit and verification
- **Kimi** — Implementation
- **Gemini** — Analysis and research

See `AGENTS.md` for coordination conventions.

## License

Private — See `LICENSE`
