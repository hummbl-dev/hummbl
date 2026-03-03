# Architecture

HUMMBL is built on a five-layer model spread across three repositories. Each layer has a defined purpose, trust boundary, and change cadence. Understanding the layers is the prerequisite to working in any part of the codebase.

## The Problem

Autonomous AI agents make decisions, take actions, and produce artifacts. Without governance, there is no way to verify whether those actions were authorized, correctly bounded, or compliant with the rules that were in effect when they executed.

HUMMBL solves this by separating governance definition (what agents may do) from governance enforcement (did they actually do it correctly) from product execution (the agents doing the work).

## Five-Layer Model

```
  AUTHORITY (increases upward)
  ^
  |  L4  base120           Governance Canon
  |      CAES spec, 120 mental models, MRCC schema.
  |      The constitution. Change rate: epoch-level.
  |
  |  L3.5 aaa              Deterministic Kernel
  |      EAL-AAA validator. 13 failure codes, 32 fixtures.
  |      The judge. Change rate: compiler-like (monthly).
  |
  |  L2  hummbl/libs/      Platform Libraries (Python)
  |      hummbl/packages/  Platform Libraries (TypeScript)
  |      Governance-bus, delegation, resilience, security.
  |      Reusable packages. Change rate: weekly.
  |
  |  L1  hummbl/apps/      Applications
  |      founder-mode, GaaS API, MCP server, hummbl.io.
  |      The revenue surface. Change rate: daily-weekly.
  |
  |  L0  hummbl/.github/   Infrastructure
  |      hummbl/tools/     CI, tooling, scripts, shared data.
  |      hummbl/shared/    Zero governance authority.
  |      hummbl/data/      Change rate: as-needed.
  v
  EXECUTION (flows downward)
```

## Dependency Rule

Code dependencies MUST point upward toward higher-authority layers:

- L1 apps import L2 libs.
- L2 libs import L3.5 kernel (via `dependency_pins.json`).
- L3.5 kernel references L4 canon (documentary only, never at runtime).
- L0 infrastructure serves all layers but cannot override governance decisions.

**No import may point downward.** If `aaa` imports from `hummbl`, CI rejects the build. If `base120` imports from `aaa`, CI rejects the build.

Execution calls flow in the opposite direction: L1 apps call L2 libs, which call L3.5 kernel functions (validate, classify compatibility).

## Three Repositories

| Repo | Layer | Purpose | Forcing Function |
|------|-------|---------|-----------------|
| `hummbl-dev/base120` | L4 | Governance canon | Different trust boundary, epoch-level change rate, single maintainer |
| `hummbl-dev/aaa` | L3.5 | Deterministic kernel | Constructive/adjudicative separation (EAL-AAA SPEC.md SS3), no-network constraint |
| `hummbl-dev/hummbl` | L2+L1+L0 | Product platform | Ships the product. Three layers coexist, separated by directory structure and CODEOWNERS |

## Directory-to-Layer Mapping

| Directory | Layer | Published As | Owner |
|-----------|-------|-------------|-------|
| `libs/` | L2 | `hummbl-*` on PyPI | @hummbl-dev/core |
| `packages/` | L2 | `@hummbl/*` on npm | @hummbl-dev/platform |
| `apps/` | L1 | Deployable services | @hummbl-dev/core (founder-mode, gaas) / @hummbl-dev/platform (mcp, web) |
| `skills/` | L1 | Agent skill definitions | @hummbl-dev/platform |
| `governance/` | L0 | N/A (policy docs + CAES copy) | @hummbl-dev/governance |
| `shared/` | L0 | N/A (agent identities, memory) | @hummbl-dev/platform |
| `data/` | L0 | N/A (Base120 models JSON) | @hummbl-dev/platform |
| `tools/` | L0 | N/A (internal scripts) | @hummbl-dev/platform |
| `scripts/` | L0 | N/A (setup, verify) | @hummbl-dev/platform |
| `.github/` | L0 | N/A (CI pipelines) | @hummbl-dev/governance + @hummbl-dev/platform |
| `docs/` | L0 | N/A | @hummbl-dev/platform |
| `tests/` | L0 | N/A | @hummbl-dev/platform |

## Invariants

Six rules that cannot be violated. Every CI check, CODEOWNERS rule, and design decision in this repo derives from these invariants.

1. **Constructive/Adjudicative Separation** -- AAA kernel and product platform MUST live in separate repos.
2. **Authority Direction** -- Dependencies point upward. Execution flows downward. Never reversed.
3. **Forcing-Function Discipline** -- A repo is justified only when at least one forcing function applies.
4. **Single Source of Truth** -- Every normative artifact has exactly one canonical location.
5. **Mechanical Enforcement** -- Every boundary rule has a corresponding CI check. Documentation-only boundaries are not boundaries.
6. **Namespace Sovereignty** -- All package names on public registries are pre-claimed before publication.

See `REPO_BOUNDARY_POLICY.md` for the 10 CI failure codes that enforce these invariants.

## Cross-Repo Dependencies

```
hummbl/dependency_pins.json:
  hummbl-eal:    aaa@v1.0.2   (git+SHA pin, Phase 1)
  hummbl-base120: base120@v1.0.0 (git+SHA pin, Phase 1)

governance/CAES_SPEC.md:
  Pinned copy of base120's CAES spec.
  SHA verified by CI against CAES_CANONICAL.sha256.
```

Release cascade: base120 tag -> Renovate PR to aaa -> aaa tag -> Renovate PR to hummbl -> merge.
