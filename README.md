# HUMMBL

AI agents make decisions autonomously. Who governs them? How do you prove compliance after the fact?

HUMMBL is the governance platform for autonomous AI systems. It provides the mental models, validation kernel, and runtime libraries that let agent builders ship with provable assurance.

## Architecture (Five Layers)

```
L4  base120     Governance Canon     (120 mental models, CAES spec)
L3  aaa         Deterministic Kernel (validation-only, no network)
L2  libs/       Platform Libraries   (governance-bus, delegation, resilience)
L1  apps/       Applications         (founder-mode, GaaS API, MCP server)
L0  .github/    Infrastructure       (CI, tooling, agent identities)
```

Dependencies point upward. Execution flows downward. See `ARCHITECTURE.md` for the full model.

## Quick Start

```bash
git clone git@github.com:hummbl-dev/hummbl.git
cd hummbl
./scripts/bootstrap.sh
```

## Repository Layout

```
hummbl/
├── libs/              # [L2] Python packages (PyPI: hummbl-*)
├── packages/          # [L2] TypeScript packages (npm: @hummbl/*)
├── apps/              # [L1] Deployable applications
│   ├── gaas/          #   GaaS customer API
│   ├── mcp-server/    #   @hummbl/mcp-server
│   └── ...
├── skills/            # [L1] Agent skills (Base120-mapped)
├── shared/            # [L0] Agent identities, avatars, memory
├── data/              # [L0] Canonical shared data (Base120 models)
├── governance/        # [L0] CAES copy + policies
├── ecosystem/         # [L0] External relationship boundaries
├── tools/             # [L0] Internal tooling
├── scripts/           # [L0] Bootstrap and verification
├── tests/             # [L0] Repo-level integration tests
├── docs/              # [L0] Documentation
└── hummbl/            # Python CLI package
```

## Commands

```bash
make setup             # One-command bootstrap
make test              # Run all tests (Python + TypeScript)
make lint              # Lint both languages
make check-boundaries  # Run boundary CI checks locally
make check             # Full local gate (lint + test + boundaries)
```

## Three Repos

| Repo | Layer | Role |
|------|-------|------|
| [`base120`](https://github.com/hummbl-dev/base120) | L4 | Governance canon. The constitution. |
| [`aaa`](https://github.com/hummbl-dev/aaa) | L3 | Deterministic kernel. The judge. |
| **`hummbl`** (this repo) | L2+L1+L0 | Product platform. The builder. |

## Key Documents

- `ARCHITECTURE.md` -- Five-layer model, dependency rules, directory mapping
- `REPO_BOUNDARY_POLICY.md` -- What may/may not live here, 10 CI failure codes
- `REPO_PERMISSIONS_MODEL.md` -- Branch protection, CODEOWNERS, contributor tiers
- `AGENTS.md` -- Agent conventions and safety rules

## Compatibility

- Python 3.11+
- Node.js 20+ (for TypeScript packages)
- macOS and Linux
- Zero third-party runtime dependencies in core paths

## Status

Current release: `0.1.0` (skeleton)

## License

Private. See `LICENSE`.
