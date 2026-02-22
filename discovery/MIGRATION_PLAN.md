# HUMMBL Migration Plan

**Source:** `/Users/others/` (various hummbl-* directories)  
**Destination:** `~/workspace/hummbl/`  
**Philosophy:** Gradual, non-breaking, reversible

---

## Pre-Migration Checklist

- [ ] Review all 4 discovery reports
- [ ] Decision: Keep GaaS in Go or port to Python?
- [ ] Decision: Avatar binary storage strategy?
- [ ] Decision: Bus format (TSV vs JSONL vs both)?
- [ ] Notify Dan of any shared interface changes
- [ ] Backup all source directories
- [ ] Create rollback plan

---

## Phase 1: Shared Cognition (Days 1-2)

### 1.1 Registries
```bash
# Source: shared-hummbl-space/registries/
# Target: ~/workspace/hummbl/shared/registries/

cp -r /Users/others/shared-hummbl-space/registries ~/workspace/hummbl/shared/

# Files:
# - agents.json (60+ agents)
# - tools.json (script inventory)
# - governance.json (policy refs)
# - memory.json (cadence guidelines)
# - playbooks.json (team playbooks)
# - workstreams.json (initiatives)
```

### 1.2 Agent Tools
```bash
# Source: shared-hummbl-space/scripts/
# Target: ~/workspace/hummbl/shared/scripts/

cp /Users/others/shared-hummbl-space/scripts/agent_lookup.py \
   ~/workspace/hummbl/shared/scripts/

cp /Users/others/shared-hummbl-space/scripts/lint_agents.py \
   ~/workspace/hummbl/shared/scripts/

cp /Users/others/shared-hummbl-space/scripts/check_avatars.py \
   ~/workspace/hummbl/shared/scripts/
```

### 1.3 Documentation
```bash
# Source: shared-hummbl-space/*.md
# Target: ~/workspace/hummbl/shared/docs/

mkdir -p ~/workspace/hummbl/shared/docs
cp /Users/others/shared-hummbl-space/AGENT_BIRTH_PROCESS.md \
   ~/workspace/hummbl/shared/docs/

cp /Users/others/shared-hummbl-space/PLAN.md \
   ~/workspace/hummbl/shared/docs/
```

### 1.4 Governance Specs
```bash
# Source: shared-hummbl-space/governance/
# Target: ~/workspace/hummbl/governance/shared/

cp -r /Users/others/shared-hummbl-space/governance/* \
   ~/workspace/hummbl/governance/
```

**Phase 1 Verification:**
```bash
cd ~/workspace/hummbl
./scripts/verify-layout.sh
python -c "import json; json.load(open('shared/registries/agents.json'))"
echo "Phase 1 complete"
```

---

## Phase 2: Platform Services (Days 3-7)

### 2.1 GaaS Platform
```bash
# Source: hummbl-gaas-platform/
# Target: ~/workspace/hummbl/platform/gaas/

# Option A: Git subtree (preserves history)
git subtree add --prefix=platform/gaas \
   /Users/others/hummbl-gaas-platform main

# Option B: Simple copy (clean slate)
cp -r /Users/others/hummbl-gaas-platform/* \
   ~/workspace/hummbl/platform/gaas/
```

### 2.2 MCP Enhanced
```bash
# Source: hummbl-mcp-enhanced/
# Target: ~/workspace/hummbl/platform/mcp/

cp -r /Users/others/hummbl-mcp-enhanced/* \
   ~/workspace/hummbl/platform/mcp/
```

### 2.3 Infrastructure
```bash
# Source: hummbl-infra/
# Target: ~/workspace/hummbl/platform/infra/

cp -r /Users/others/hummbl-infra/* \
   ~/workspace/hummbl/platform/infra/
```

**Phase 2 Verification:**
```bash
cd ~/workspace/hummbl/platform/gaas
find . -name "*.go" | wc -l  # Should find ~66 files

cd ~/workspace/hummbl/platform/mcp
wc -l *.js  # Should find ~2,325 lines

cd ~/workspace/hummbl/platform/infra
ls -la domains/  # Should show ci-cd, dev-env, monitoring, security
```

---

## Phase 3: Core Primitives (Days 8-10)

### 3.1 Create Core Structure
```bash
cd ~/workspace/hummbl
mkdir -p hummbl/core/{safety,resilience,governance,coordination}
```

### 3.2 Port Kill Switch
```bash
# Source: founder_mode/services/kill_switch_core.py
# Target: hummbl/core/safety/kill_switch.py

# Extract and adapt (remove Founder Mode specific deps)
cp /Users/others/founder_mode/services/kill_switch_core.py \
   hummbl/core/safety/kill_switch.py

# Edit to remove founder_mode imports, make standalone
```

### 3.3 Port Circuit Breaker
```bash
# Source: founder_mode/services/circuit_breaker.py
# Target: hummbl/core/resilience/circuit_breaker.py

cp /Users/others/founder_mode/services/circuit_breaker.py \
   hummbl/core/resilience/circuit_breaker.py
```

### 3.4 Port Cost Governor
```bash
# Source: founder_mode/services/cost_governor_bridge.py
# Target: hummbl/core/governance/cost_governor.py

cp /Users/others/founder_mode/services/cost_governor_bridge.py \
   hummbl/core/governance/cost_governor.py
```

### 3.5 Create Coordination Bus
```bash
# Target: hummbl/core/coordination/bus.py
# Create new implementation based on CAES spec
```

**Phase 3 Verification:**
```bash
cd ~/workspace/hummbl
python -c "from hummbl.core.safety.kill_switch import KillSwitch; print('OK')"
python -c "from hummbl.core.resilience.circuit_breaker import CircuitBreaker; print('OK')"
```

---

## Phase 4: Integration & Testing (Days 11-14)

### 4.1 Create Symlinks (Backward Compatibility)
```bash
# In shared-hummbl-space, link to new locations
ln -s ~/workspace/hummbl/shared/registries \
   /Users/others/shared-hummbl-space/registries-new

# Test both locations work
```

### 4.2 Update References
```bash
# Find and update any hardcoded paths
grep -r "shared-hummbl-space" ~/workspace/hummbl/ || echo "Clean"

# Update AGENTS.md with new structure
cat >> ~/workspace/hummbl/AGENTS.md << 'EOF'

## Migrated Components

| Old Location | New Location | Status |
|--------------|--------------|--------|
| shared-hummbl-space/registries/ | hummbl/shared/registries/ | ✅ Migrated |
| shared-hummbl-space/scripts/ | hummbl/shared/scripts/ | ✅ Migrated |
| hummbl-gaas-platform/ | hummbl/platform/gaas/ | ✅ Migrated |
| hummbl-mcp-enhanced/ | hummbl/platform/mcp/ | ✅ Migrated |
| hummbl-infra/ | hummbl/platform/infra/ | ✅ Migrated |
EOF
```

### 4.3 Test Founder Mode Compatibility
```bash
# Ensure Founder Mode still works
cd /Users/others/founder_mode
python -m pytest tests/unit/test_health.py -v
```

### 4.4 Final Verification
```bash
cd ~/workspace/hummbl
./scripts/verify-layout.sh
python -m pytest tests/ -v --cov=hummbl
```

---

## Post-Migration

### Cleanup (After 30 days stability)
```bash
# Remove old directories (only after confirmed stable)
# mv /Users/others/hummbl-gaas-platform /Users/others/.archive/
# mv /Users/others/hummbl-mcp-enhanced /Users/others/.archive/
# etc.
```

### Documentation Updates
- [ ] Update `~/workspace/hummbl/README.md` with new architecture
- [ ] Update `~/workspace/hummbl/AGENTS.md` with migration notes
- [ ] Update `/Users/others/AGENTS.md` to point to new locations
- [ ] Update Dan's documentation if needed

---

## Rollback Plan

If anything breaks:

1. **Immediate:** Restore symlinks to point to old locations
2. **Short-term:** Revert git commits in ~/workspace/hummbl
3. **Nuclear:** Delete ~/workspace/hummbl and re-clone fresh

---

## Success Criteria

- [ ] All Phase 1 components migrated and tested
- [ ] All Phase 2 platform services functional
- [ ] All Phase 3 core primitives importable
- [ ] Founder Mode unaffected (all tests pass)
- [ ] New code follows HUMMBL conventions (zero runtime deps for core)
- [ ] Documentation updated and accurate

---

*Migration Plan Version 1.0*  
*Ready for execution upon approval*
