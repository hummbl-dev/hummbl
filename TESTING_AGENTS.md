# HUMMBL Testing Agents

## Automated Production Testing & Quality Assurance

Version: 1.0.0  
Last Updated: 2025-11-08  
HUMMBL Systems Engineering

---

## Overview

HUMMBL includes automated testing agents that verify production builds and provide detailed status reports. These agents provide redundancy to manual testing and ensure deployment readiness.

**Mental Models Used:**

- **DE3 (Decomposition)**: Breaking complex testing into discrete steps
- **SY8 (Systems)**: Holistic view of application health
- **P4 (Perspective)**: Multiple testing viewpoints (build, visual, functional)

---

## Available Agents

### 1. Production Build Test Agent

**Purpose**: Automated verification of production builds

**What it tests:**

- ✅ TypeScript compilation succeeds
- ✅ Vite build completes without errors
- ✅ Bundle size within thresholds
- ✅ Critical files exist in `dist/`
- ✅ HTML artifacts correctly structured
- ✅ Assets properly generated

**Usage:**

```bash
npm run test:production
```

**Output:** SITREP-formatted report with:

- Build metrics (duration, bundle sizes)
- Pass/fail status for each check
- Recommendations for next steps
- Exit code 0 (success) or 1 (failure)

**Example Output:**

```text
╔════════════════════════════════════════════════════════════════╗
║          PRODUCTION BUILD TEST REPORT - SITREP-001            ║
╚════════════════════════════════════════════════════════════════╝

1. SITUATION
   Production build testing completed for HUMMBL application.
   Build Status: ✅ SUCCESS
   Tests Run: 8
   Passed: 8 | Failed: 0 | Warnings: 0

2. BUILD METRICS
   Duration: 4.37s
   JS Bundle: 223.58 kB
   CSS Bundle: 20.43 kB

3. TEST RESULTS
   ✅ [PASS] Production Build
      Build completed successfully
   
   ✅ [PASS] File Check: index.html
      index.html exists
   ...

5. RECOMMENDATIONS
   ✅ Production build ready for deployment
   🚀 Run `npm run preview` to test locally
   ☁️ Deploy to Vercel when ready
```

---

### 2. Visual Test Agent

**Purpose**: Launch preview server with testing checklist

**What it does:**

- Starts `npm run preview` server
- Provides structured testing checklist
- Lists all critical pages to verify
- Keeps server running for manual testing

**Usage:**

```bash
npm run test:visual
```

**What to manually verify:**

- Page loads and navigation
- No console errors
- UI renders correctly
- Responsive design works
- Interactions function properly
- Analytics configured

**Example Output:**

```text
╔════════════════════════════════════════════════════════════════╗
║         VISUAL/FUNCTIONAL TEST REPORT - SITREP-002            ║
╚════════════════════════════════════════════════════════════════╝

MANUAL TESTING CHECKLIST

📄 Dashboard Page
   URL: http://localhost:4173/
   Status: Manual verification required

📄 Templates Page
   URL: http://localhost:4173/templates
   Status: Manual verification required
   
...

TESTING GUIDELINES:
1. Open browser to http://localhost:4173
2. Navigate through each page
3. Check for console errors, smooth navigation, etc.
```

---

### 3. Full Test Suite

**Purpose**: Run all agents sequentially

**Usage:**

```bash
npm run test:all
```

This runs:

1. Production build tests (automated)
2. Visual test agent (manual checklist)

---

## Integration with Deployment Workflow

### Pre-Deployment Checklist

**Automated Steps:**

```bash
# 1. Run production tests
npm run test:production

# 2. If all pass, run visual tests
npm run test:visual

# 3. Manually verify in browser
# ... (follow checklist in terminal)

# 4. If everything passes, deploy
git push origin main  # Vercel auto-deploys
```

**CI Integration:**

The `.github/workflows/ci.yml` already runs:

- ESLint
- TypeScript checks
- Build verification

The production test agent adds:

- Bundle size monitoring
- Artifact validation
- Structured reporting

---

## Agent Architecture

### Production Test Agent

**File:** `scripts/test-production.ts`

**Architecture:**

```typescript
class ProductionTestAgent {
  // Core testing methods
  runBuild()              // Execute npm run build
  verifyDistStructure()   // Check files exist
  checkBundleSize()       // Validate sizes
  verifyBuildArtifacts()  // Parse HTML/assets
  
  // Reporting
  generateSITREP()        // Human-readable report
  generateJSONReport()    // Machine-readable data
}
```

**Mental Model:** DE3 (Decomposition)

- Complex build validation → discrete test steps
- Each step independent and verifiable
- Results aggregated into comprehensive report

---

### Visual Test Agent

**File:** `scripts/visual-test-agent.ts`

**Architecture:**

```typescript
class VisualTestAgent {
  // Server management
  startPreviewServer()    // Launch vite preview
  stopPreviewServer()     // Clean shutdown
  
  // Test definition
  getVisualTests()        // Define test cases
  runVisualTests()        // Execute/instruct
  
  // Reporting
  generateReport()        // Testing checklist
}
```

**Mental Model:** P4 (Perspective)
- Shifts from code → user perspective
- Visual and functional validation
- Human-in-the-loop for subjective quality

---

## Thresholds & Standards

### Bundle Size Limits

**JavaScript:**

- ⚠️ Warning: > 250 KB
- ❌ Fail: > 300 KB

**CSS:**

- ⚠️ Warning: > 40 KB
- ❌ Fail: > 50 KB

*Rationale*: Balance features vs. performance. Warn before hard limits.

### Required Files

**Must exist in `dist/`:**

- ✅ `index.html`
- ✅ `assets/` directory
- ✅ Module script tag in HTML
- ✅ Stylesheet link in HTML
- ✅ Root div element

---

## Extending the Agents

### Adding New Tests

**To Production Test Agent:**

```typescript
// In scripts/test-production.ts
async myNewTest(): Promise<void> {
  console.log('\n🔍 Running my test...\n');
  
  // Perform check
  const result = await checkSomething();
  
  // Record result
  this.addResult({
    test: 'My New Test',
    status: result ? 'PASS' : 'FAIL',
    message: result ? 'Success!' : 'Failed because...',
  });
}

// Add to runAllTests()
await this.myNewTest();
```

**To Visual Test Agent:**

```typescript
// Add to getVisualTests()
{
  name: 'New Page',
  url: '/new-page',
  checks: [
    'Page loads',
    'Feature X works',
  ],
}
```

---

## Troubleshooting

### "Cannot find module 'tsx'"

**Solution:**

```bash
npm install
```

The `tsx` package should be installed as a devDependency.

---

### "Port 4173 already in use"

**Solution:**

The visual agent will detect this and assume server is running. Either:

1. Stop existing preview server
2. Let agent use running server

---

### "Build failed" in agent

**Solution:**

1. Check agent output for specific error
2. Run `npm run build` manually to see full logs
3. Fix TypeScript/build errors
4. Re-run agent

---

## Future Enhancements

### Phase 1 (Planned)

- [ ] Playwright integration for automated browser testing
- [ ] Screenshot comparison (visual regression)
- [ ] Performance metrics (Lighthouse scores)
- [ ] Accessibility testing (axe-core)

### Phase 2 (Roadmap)

- [ ] API endpoint testing (when backend added)
- [ ] Database migration validation
- [ ] Load testing agents
- [ ] Security scanning

---

## Best Practices

### When to Run Agents

**Every deployment:**

```bash
npm run test:all
```

**During development:**

```bash
npm run test:production  # Quick validation
```

**Before major releases:**

- Run full test suite
- Manual testing on all pages
- Cross-browser verification
- Performance profiling

---

### Reading SITREP Reports

**Status Indicators:**

- ✅ PASS: Test succeeded
- ⚠️ WARN: Passed but with concerns (e.g., bundle size growing)
- ❌ FAIL: Test failed, must fix

**Recommendations Section:**

- Follow in order
- Address failures first
- Review warnings for optimization opportunities

---

## Related Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Full deployment guide
- **[README.md](./README.md)**: Project overview
- **[.github/workflows/ci.yml](.github/workflows/ci.yml)**: CI configuration

---

**Maintained By**: HUMMBL Systems Engineering  
**Questions?** Review agent source code in `scripts/` directory  
**Updates**: Agents versioned with application
