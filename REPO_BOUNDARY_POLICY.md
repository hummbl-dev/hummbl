# Repo Boundary Policy

What may and may not live in each repository. Enforced by CI.

## Scope

This policy applies to the three canonical HUMMBL repositories:

- `hummbl-dev/base120` (L4 Governance Canon)
- `hummbl-dev/aaa` (L3 Deterministic Kernel)
- `hummbl-dev/hummbl` (L2+L1+L0 Product Platform)

## What Belongs Where

### base120 (L4)

**Allowed:**
- Base120 mental model registry (YAML)
- CAES specification
- MRCC schema and seed certificates
- Governance documentation
- Validation workflows (drift detection)

**Prohibited:**
- Runtime code that executes agent actions
- Network-calling code
- Product application logic
- Dependencies on `aaa` or `hummbl`

### aaa (L3)

**Allowed:**
- EAL-AAA kernel modules (`aaa_eal/`)
- Normative spec documents (`spec/`)
- Conformance fixtures (`conformance/`)
- Kernel import allowlist (`spec/kernel_import_allowlist_v1.json`)
- Release tooling (`Makefile`, scripts)

**Prohibited:**
- Imports outside the 5-module allowlist (`__future__`, `dataclasses`, `hashlib`, `json`, `typing`)
- Network calls (`urllib`, `http.client`, `socket`, `subprocess`, `requests`)
- Any import from `hummbl` or `base120` at runtime
- Product application logic
- Non-deterministic operations (random, time-dependent, OS-dependent)

### hummbl (L2+L1+L0)

**Allowed:**
- Python libraries in `libs/` (L2)
- TypeScript packages in `packages/` (L2)
- Applications in `apps/` (L1)
- Agent skills in `skills/` (L1)
- Infrastructure in `governance/`, `shared/`, `data/`, `tools/`, `scripts/`, `.github/` (L0)
- Pinned copies of governance artifacts (with SHA verification)

**Prohibited:**
- Redefining kernel validation functions (`sha256_hex`, `canonical_json_bytes`, `verify_receipt`, `classify_compat`)
- Modifying or overriding the CAES spec without updating the canonical copy in `base120`
- Importing from `aaa` internals -- only the published API surface
- Unpinned dependencies on `aaa` or `base120`

## CI Failure Codes

Every boundary violation is caught by a named CI check. When a check fails, the PR is blocked.

| Code | Violation | Repo | Enforcement |
|------|-----------|------|-------------|
| `B_IMPORT_VIOLATION` | Kernel imports outside allowlist | `aaa` | `verify_kernel_imports.py` |
| `B_NETWORK_IN_KERNEL` | Network call in kernel code | `aaa` | Grep for `urllib`, `http.client`, `socket`, `requests`, `subprocess` |
| `B_CANON_DRIFT` | Governance doc modified without epoch | `base120` | Daily drift detection workflow |
| `B_VALIDATOR_OVERRIDE` | Product redefines kernel validation | `hummbl` | Scan for kernel function signatures in `libs/` and `apps/` |
| `B_UPWARD_DEPENDENCY` | Higher-authority imports from lower | All | `aaa` must not import `hummbl`; `base120` must not import either |
| `B_PIN_MISMATCH` | `pyproject.toml` disagrees with `dependency_pins.json` | `hummbl` | Version and SHA comparison |
| `B_CAES_STALE_COPY` | `governance/CAES_SPEC.md` doesn't match canonical | `hummbl` | Hash comparison against `CAES_CANONICAL.sha256` |
| `B_KERNEL_TYPE_DRIFT` | TS kernel types diverge from AAA spec | `hummbl` | Phase 1: manual review. Phase 2: automated type export check |
| `B_SHA_UNPIN` | GitHub Action not pinned to commit SHA | All | Scan `.github/workflows/*.yml` for `uses:` without SHA |
| `B_NAMESPACE_LEAK` | Internal package name not reserved on public registry | `hummbl` | Check `dependency_pins.json` names against reservation list |

## Incident Response

When any `B_*` code fires in CI:

1. **PR is blocked.** CI fails, merge is prevented.
2. **Notification.** `@hummbl-dev/governance` is auto-tagged in a PR comment.
3. **Triage (within 24h).** Governance team classifies as:
   - **(a) Genuine violation** -- fix required before merge.
   - **(b) False positive** -- update detection pattern.
   - **(c) Justified exception** -- requires signed waiver in PR description with governance team approval.
4. **Bus post.** If genuine, post `BLOCKED` to coordination bus with failure code and file paths.
5. **Escalation.** If the same code fires 3+ times in 7 days, publish a root-cause analysis.

## Exception Process

To request an exception to any boundary rule:

1. Add `## Boundary Exception` section to the PR description.
2. Specify the `B_*` code being waived.
3. Explain why the violation is necessary.
4. Tag `@hummbl-dev/governance` for review.
5. Governance team member must approve the PR with explicit acknowledgment.

Exceptions are logged and time-bounded. No permanent exceptions.
