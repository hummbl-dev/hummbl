/**
 * Production Testing Agent
 * 
 * @module scripts/test-production
 * @version 1.0.0
 * @description Automated agent for testing production builds and generating status reports
 * @link https://hummbl.io/docs/testing
 * 
 * HUMMBL Systems - Using DE3 (Decomposition) + SY8 (Systems thinking)
 */

import { spawn } from 'child_process';
import { access, readFile } from 'fs/promises';
import { resolve } from 'path';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  timestamp: string;
}

interface ProductionReport {
  timestamp: string;
  buildStatus: 'SUCCESS' | 'FAILURE';
  tests: TestResult[];
  buildMetrics: {
    duration?: string;
    bundleSize?: string;
    cssSize?: string;
  };
  recommendations: string[];
}

class ProductionTestAgent {
  private results: TestResult[] = [];
  private buildMetrics: ProductionReport['buildMetrics'] = {};
  private buildOutput = '';

  /**
   * Run production build and capture output
   */
  async runBuild(): Promise<boolean> {
    console.log('🔨 Building production bundle...\n');
    
    return new Promise((resolve) => {
      const build = spawn('npm', ['run', 'build'], {
        cwd: process.cwd(),
        shell: true,
      });

      build.stdout.on('data', (data) => {
        const output = data.toString();
        this.buildOutput += output;
        process.stdout.write(output);
      });

      build.stderr.on('data', (data) => {
        const output = data.toString();
        this.buildOutput += output;
        process.stderr.write(output);
      });

      build.on('close', (code) => {
        const success = code === 0;
        
        // Parse build metrics from output
        this.parseBuildMetrics();
        
        this.addResult({
          test: 'Production Build',
          status: success ? 'PASS' : 'FAIL',
          message: success 
            ? 'Build completed successfully'
            : `Build failed with exit code ${code}`,
        });

        resolve(success);
      });
    });
  }

  /**
   * Parse build metrics from Vite output
   */
  private parseBuildMetrics(): void {
    const durationMatch = this.buildOutput.match(/built in (\d+\.\d+s)/);
    const jsMatch = this.buildOutput.match(/index-\w+\.js\s+([\d.]+\s+kB)/);
    const cssMatch = this.buildOutput.match(/index-\w+\.css\s+([\d.]+\s+kB)/);

    if (durationMatch) this.buildMetrics.duration = durationMatch[1];
    if (jsMatch) this.buildMetrics.bundleSize = jsMatch[1];
    if (cssMatch) this.buildMetrics.cssSize = cssMatch[1];
  }

  /**
   * Verify dist folder structure
   */
  async verifyDistStructure(): Promise<void> {
    console.log('\n📁 Verifying dist structure...\n');

    const checks = [
      { path: 'dist/index.html', name: 'index.html' },
      { path: 'dist/assets', name: 'assets directory' },
    ];

    for (const check of checks) {
      try {
        await access(resolve(process.cwd(), check.path));
        this.addResult({
          test: `File Check: ${check.name}`,
          status: 'PASS',
          message: `${check.name} exists`,
        });
      } catch {
        this.addResult({
          test: `File Check: ${check.name}`,
          status: 'FAIL',
          message: `${check.name} missing`,
        });
      }
    }
  }

  /**
   * Check bundle size thresholds
   */
  async checkBundleSize(): Promise<void> {
    console.log('\n📊 Checking bundle sizes...\n');

    const MAX_JS_SIZE_KB = 300; // 300KB threshold
    const MAX_CSS_SIZE_KB = 50;  // 50KB threshold

    if (this.buildMetrics.bundleSize) {
      const sizeKB = parseFloat(this.buildMetrics.bundleSize);
      this.addResult({
        test: 'Bundle Size Check',
        status: sizeKB <= MAX_JS_SIZE_KB ? 'PASS' : 'WARN',
        message: `JS bundle: ${this.buildMetrics.bundleSize} (threshold: ${MAX_JS_SIZE_KB}KB)`,
      });
    }

    if (this.buildMetrics.cssSize) {
      const sizeKB = parseFloat(this.buildMetrics.cssSize);
      this.addResult({
        test: 'CSS Size Check',
        status: sizeKB <= MAX_CSS_SIZE_KB ? 'PASS' : 'WARN',
        message: `CSS bundle: ${this.buildMetrics.cssSize} (threshold: ${MAX_CSS_SIZE_KB}KB)`,
      });
    }
  }

  /**
   * Verify critical files in dist
   */
  async verifyBuildArtifacts(): Promise<void> {
    console.log('\n🔍 Verifying build artifacts...\n');

    try {
      const indexHtml = await readFile(
        resolve(process.cwd(), 'dist/index.html'),
        'utf-8'
      );

      // Check for critical elements
      const checks = [
        { test: 'has script tag', pattern: /<script.*?type="module"/, name: 'Module script' },
        { test: 'has CSS link', pattern: /<link.*?rel="stylesheet"/, name: 'Stylesheet link' },
        { test: 'has root div', pattern: /<div id="root"/, name: 'Root element' },
      ];

      for (const check of checks) {
        const found = check.pattern.test(indexHtml);
        this.addResult({
          test: `HTML Check: ${check.name}`,
          status: found ? 'PASS' : 'FAIL',
          message: found ? `${check.name} present` : `${check.name} missing`,
        });
      }
    } catch (error) {
      this.addResult({
        test: 'HTML Verification',
        status: 'FAIL',
        message: `Could not read index.html: ${error}`,
      });
    }
  }

  /**
   * Add a test result
   */
  private addResult(result: Omit<TestResult, 'timestamp'>): void {
    this.results.push({
      ...result,
      timestamp: new Date().toISOString(),
    });

    const emoji = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${emoji} ${result.test}: ${result.message}`);
  }

  /**
   * Generate recommendations based on results
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for failures
    const failures = this.results.filter(r => r.status === 'FAIL');
    if (failures.length > 0) {
      recommendations.push('⚠️ Address failed tests before deploying to production');
    }

    // Check for warnings
    const warnings = this.results.filter(r => r.status === 'WARN');
    if (warnings.length > 0) {
      recommendations.push('💡 Review warnings for potential optimization opportunities');
    }

    // Bundle size recommendations
    if (this.buildMetrics.bundleSize) {
      const sizeKB = parseFloat(this.buildMetrics.bundleSize);
      if (sizeKB > 250) {
        recommendations.push('📦 Consider code splitting or lazy loading to reduce bundle size');
      }
    }

    // All passed
    if (failures.length === 0 && warnings.length === 0) {
      recommendations.push('✅ Production build ready for deployment');
      recommendations.push('🚀 Run `npm run preview` to test locally');
      recommendations.push('☁️ Deploy to Vercel when ready');
    }

    return recommendations;
  }

  /**
   * Generate SITREP-formatted status report
   */
  generateSITREP(): string {
    const now = new Date();
    const dtg = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warned = this.results.filter(r => r.status === 'WARN').length;
    const total = this.results.length;

    return `
╔════════════════════════════════════════════════════════════════╗
║          PRODUCTION BUILD TEST REPORT - SITREP-001            ║
╚════════════════════════════════════════════════════════════════╝

CLASSIFICATION: UNCLASSIFIED
DTG: ${dtg}
AUTHORIZATION: Production Testing Agent v1.0.0

────────────────────────────────────────────────────────────────

1. SITUATION
   Production build testing completed for HUMMBL application.
   
   Build Status: ${failed === 0 ? '✅ SUCCESS' : '❌ FAILURE'}
   Tests Run: ${total}
   Passed: ${passed} | Failed: ${failed} | Warnings: ${warned}

────────────────────────────────────────────────────────────────

2. BUILD METRICS
   Duration: ${this.buildMetrics.duration || 'N/A'}
   JS Bundle: ${this.buildMetrics.bundleSize || 'N/A'}
   CSS Bundle: ${this.buildMetrics.cssSize || 'N/A'}

────────────────────────────────────────────────────────────────

3. TEST RESULTS

${this.results.map(r => {
  const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌';
  return `   ${icon} [${r.status}] ${r.test}\n      ${r.message}`;
}).join('\n\n')}

────────────────────────────────────────────────────────────────

4. ASSESSMENT
   Overall Status: ${failed === 0 ? 'READY FOR DEPLOYMENT' : 'NOT READY - FIXES REQUIRED'}
   Confidence Level: ${failed === 0 && warned === 0 ? 'HIGH' : failed === 0 ? 'MEDIUM' : 'LOW'}

────────────────────────────────────────────────────────────────

5. RECOMMENDATIONS

${this.generateRecommendations().map(r => `   ${r}`).join('\n')}

────────────────────────────────────────────────────────────────

END SITREP-001
Generated: ${now.toISOString()}
HUMMBL Systems - Production Testing Agent
`;
  }

  /**
   * Generate JSON report for programmatic use
   */
  generateJSONReport(): ProductionReport {
    return {
      timestamp: new Date().toISOString(),
      buildStatus: this.results.some(r => r.status === 'FAIL') ? 'FAILURE' : 'SUCCESS',
      tests: this.results,
      buildMetrics: this.buildMetrics,
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<ProductionReport> {
    console.log('🤖 Production Testing Agent Starting...\n');
    console.log('═══════════════════════════════════════\n');

    // Using DE3 (Decomposition) - breaking down complex task into steps
    const buildSuccess = await this.runBuild();
    
    if (!buildSuccess) {
      console.log('\n❌ Build failed. Skipping further tests.\n');
      return this.generateJSONReport();
    }

    await this.verifyDistStructure();
    await this.checkBundleSize();
    await this.verifyBuildArtifacts();

    // Generate reports
    console.log('\n\n' + this.generateSITREP());

    return this.generateJSONReport();
  }
}

// CLI execution
const isMainModule = import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const agent = new ProductionTestAgent();
  
  agent.runAllTests()
    .then((report) => {
      const exitCode = report.buildStatus === 'SUCCESS' ? 0 : 1;
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('❌ Agent error:', error);
      process.exit(1);
    });
}

export default ProductionTestAgent;
