# Repo Permissions Model

Access control, branch protection, and review requirements for each canonical HUMMBL repository.

## Teams

| Team | Scope | Members |
|------|-------|---------|
| `@hummbl-dev/governance` | L4 canon, L3.5 spec, CI pipelines, policy docs | Maintainer (Reuben) |
| `@hummbl-dev/kernel-team` | L3.5 kernel code and fixtures | Core team (2-3) |
| `@hummbl-dev/core` | L2 Python libs, L1 founder-mode, L1 GaaS | Core team |
| `@hummbl-dev/platform` | L2 TS packages, L1 apps, L0 infra | Team + approved contributors |

## Branch Protection

### base120 (L4 Governance Canon)

| Rule | Setting |
|------|---------|
| Required CI | All workflows must pass |
| Required reviews | 1 (maintainer only) |
| Signed commits | Required |
| Signed tags | Required |
| Force push | Disallowed |
| Branch deletion | Disallowed |
| Direct push to main | Disallowed |
| Merge method | Maintainer-only merge |

### aaa (L3.5 Deterministic Kernel)

| Rule | Setting |
|------|---------|
| Required CI | Import allowlist, no-network scan, determinism tests, `make release-check` |
| Required reviews | 1 (kernel-team member) |
| Spec changes | Require governance team review (via CODEOWNERS) |
| Force push | Disallowed on main |
| Direct push to main | Disallowed |
| Merge method | Squash-merge only |

### hummbl (L2+L1+L0 Product Platform)

| Rule | Setting |
|------|---------|
| Required CI | Boundary checks, lint, tests |
| Required reviews | 1 reviewer minimum |
| Governance paths | Require governance team review (via CODEOWNERS) |
| Force push | Allowed on feature branches only |
| Direct push to main | Disallowed |
| Merge method | Squash-merge to main |

## CODEOWNERS

### hummbl/.github/CODEOWNERS

```
# Default: platform team reviews all unmatched files
*                                    @hummbl-dev/platform

# Governance -- requires maintainer approval (INV-1)
/governance/                         @hummbl-dev/governance
/REPO_BOUNDARY_POLICY.md             @hummbl-dev/governance
/REPO_PERMISSIONS_MODEL.md           @hummbl-dev/governance
/dependency_pins.json                @hummbl-dev/governance

# Python libraries (extractable packages)
/libs/                               @hummbl-dev/core

# TypeScript packages (kernel types need security review)
/packages/                           @hummbl-dev/platform
/packages/kernel/                    @hummbl-dev/governance @hummbl-dev/core

# Applications
/apps/founder-mode/                  @hummbl-dev/core
/apps/mcp-server/                    @hummbl-dev/platform
/apps/gaas-api/                      @hummbl-dev/core

# Shared cognition layer
/shared/                             @hummbl-dev/platform

# CI/CD -- must be reviewed by governance (supply chain protection)
/.github/workflows/                  @hummbl-dev/governance @hummbl-dev/platform
/.github/CODEOWNERS                  @hummbl-dev/governance
```

### aaa/.github/CODEOWNERS

```
*                                    @hummbl-dev/kernel-team
/spec/                               @hummbl-dev/governance @hummbl-dev/kernel-team
/aaa_eal/                            @hummbl-dev/kernel-team
/.github/workflows/                  @hummbl-dev/governance
```

### base120/.github/CODEOWNERS

```
*                                    @hummbl-dev/governance
```

## Contributor Tiers

| Tier | Access | Requirements |
|------|--------|-------------|
| Maintainer | Full admin on all repos | Org owner. 2FA/passkey required. |
| Core team | Write on `aaa` + `hummbl` | Invited by maintainer. 2FA required. Signed commits. |
| Platform team | Write on `hummbl` only | Invited by core team. 2FA required. |
| External contributor | Fork + PR only | No direct write access. PRs reviewed by CODEOWNERS. |

## Security Requirements

- All org members: 2FA or passkey enforced at org level.
- All commits to protected branches: signed (GPG or SSH key).
- GitHub Actions: minimal `GITHUB_TOKEN` permissions (read-only by default).
- PATs: audited monthly via `/pat-audit` skill. Short-lived tokens preferred.
- Secrets: per-repo, never shared across repos.
