/**
 * Visual Testing Agent
 * 
 * @module scripts/visual-test-agent
 * @version 1.0.0
 * @description Agent that loads the preview server and tests visual/functional elements
 * @link https://hummbl.io/docs/testing
 * 
 * HUMMBL Systems - Using SY8 (Systems) + P4 (Perspective shifting)
 */

import { spawn, ChildProcess } from 'child_process';

interface VisualTest {
  name: string;
  url: string;
  checks: string[];
}

interface VisualTestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  url: string;
}

class VisualTestAgent {
  private previewServer?: ChildProcess;
  private results: VisualTestResult[] = [];
  private readonly baseUrl = 'http://localhost:4173';

  /**
   * Start preview server
   */
  async startPreviewServer(): Promise<boolean> {
    console.log('🚀 Starting preview server...\n');

    return new Promise((resolve) => {
      this.previewServer = spawn('npm', ['run', 'preview'], {
        cwd: process.cwd(),
        shell: true,
        detached: false,
      });

      let started = false;

      this.previewServer.stdout?.on('data', (data) => {
        const output = data.toString();
        
        if (output.includes('Local:') && !started) {
          started = true;
          console.log('✅ Preview server running at', this.baseUrl, '\n');
          // Give it a moment to fully initialize
          setTimeout(() => resolve(true), 1000);
        }
      });

      this.previewServer.stderr?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('EADDRINUSE')) {
          console.log('⚠️  Port 4173 already in use - assuming server is running\n');
          started = true;
          resolve(true);
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!started) {
          console.log('❌ Server failed to start\n');
          resolve(false);
        }
      }, 10000);
    });
  }

  /**
   * Stop preview server
   */
  stopPreviewServer(): void {
    if (this.previewServer) {
      console.log('\n🛑 Stopping preview server...');
      this.previewServer.kill();
    }
  }

  /**
   * Define visual tests to run
   */
  private getVisualTests(): VisualTest[] {
    return [
      {
        name: 'Dashboard Page',
        url: '/',
        checks: [
          'Page loads successfully',
          'Navigation visible',
          'Main content rendered',
        ],
      },
      {
        name: 'Templates Page',
        url: '/templates',
        checks: [
          'Templates list visible',
          'Navigation works',
        ],
      },
      {
        name: 'Workflows Page',
        url: '/workflows',
        checks: [
          'Workflows interface loads',
          'No console errors',
        ],
      },
      {
        name: 'Agent Management',
        url: '/agents',
        checks: [
          'Agent management UI loads',
        ],
      },
    ];
  }

  /**
   * Run visual tests (instructions for manual testing)
   */
  async runVisualTests(): Promise<void> {
    console.log('👁️  Visual Testing Instructions\n');
    console.log('═══════════════════════════════════════\n');

    const tests = this.getVisualTests();

    for (const test of tests) {
      console.log(`\n📋 Test: ${test.name}`);
      console.log(`   URL: ${this.baseUrl}${test.url}`);
      console.log(`   Checks:`);
      test.checks.forEach(check => console.log(`   - [ ] ${check}`));
      
      // For now, mark as manual check needed
      this.results.push({
        test: test.name,
        status: 'SKIP',
        message: 'Manual testing required - open browser to verify',
        url: `${this.baseUrl}${test.url}`,
      });
    }
  }

  /**
   * Generate test report
   */
  generateReport(): string {
    const now = new Date();
    
    return `
╔════════════════════════════════════════════════════════════════╗
║         VISUAL/FUNCTIONAL TEST REPORT - SITREP-002            ║
╚════════════════════════════════════════════════════════════════╝

DTG: ${now.toISOString()}

────────────────────────────────────────────────────────────────

MANUAL TESTING CHECKLIST

The following pages should be tested in the browser at:
${this.baseUrl}

${this.results.map(r => `
📄 ${r.test}
   URL: ${r.url}
   Status: Manual verification required
`).join('')}

────────────────────────────────────────────────────────────────

TESTING GUIDELINES:

1. Open browser to ${this.baseUrl}
2. Navigate through each page listed above
3. Check for:
   ✓ No console errors
   ✓ Smooth navigation/routing
   ✓ Responsive design works
   ✓ All UI elements render correctly
   ✓ No broken styles or layouts
   ✓ Analytics tracking configured

4. Test interactions:
   ✓ Button clicks work
   ✓ Forms function properly
   ✓ State management works
   ✓ Error boundaries catch errors

────────────────────────────────────────────────────────────────

NEXT STEPS:

After manual testing:
1. If all tests pass → Ready for deployment
2. If issues found → Fix and re-test
3. Run production build test: npm run test:production

────────────────────────────────────────────────────────────────

END SITREP-002
`;
  }

  /**
   * Run the agent
   */
  async run(): Promise<void> {
    console.log('🤖 Visual Testing Agent Starting...\n');

    const serverStarted = await this.startPreviewServer();

    if (!serverStarted) {
      console.log('❌ Could not start preview server. Exiting.\n');
      return;
    }

    await this.runVisualTests();
    
    console.log(this.generateReport());
    
    console.log('\n✅ Preview server is running. Press Ctrl+C to stop.\n');
    console.log('💡 Open your browser to start testing!\n');

    // Keep process alive
    process.on('SIGINT', () => {
      this.stopPreviewServer();
      process.exit(0);
    });
  }
}

// CLI execution
const isMainModule = import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  const agent = new VisualTestAgent();
  agent.run().catch((error) => {
    console.error('❌ Agent error:', error);
    process.exit(1);
  });
}

export default VisualTestAgent;
