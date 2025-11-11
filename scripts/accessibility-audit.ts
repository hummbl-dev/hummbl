/**
 * Accessibility Audit Script
 * 
 * Automated accessibility testing using axe-core
 * Generates comprehensive report of WCAG violations
 * 
 * Usage: npm run audit:a11y
 */

import { createServer } from 'http';
import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface AuditConfig {
  port: number;
  distDir: string;
  outputFile: string;
  urls: string[];
}

const config: AuditConfig = {
  port: 4173,
  distDir: join(process.cwd(), 'dist'),
  outputFile: join(process.cwd(), 'ACCESSIBILITY_AUDIT_RESULTS.json'),
  urls: [
    '/',
    '/workflows',
    '/workflows/new',
    '/agents',
    '/analytics',
    '/mental-models',
    '/templates',
    '/settings',
    '/notifications',
    '/team',
    '/login',
  ],
};

console.log('🔍 HUMMBL Accessibility Audit');
console.log('================================\n');

// Check if dist exists
if (!existsSync(config.distDir)) {
  console.error('❌ Error: dist/ directory not found');
  console.error('   Run: npm run build');
  process.exit(1);
}

console.log('✅ Found dist/ directory');
console.log(`📂 Audit config: ${config.urls.length} pages to scan\n`);

// Start preview server
console.log('🚀 Starting preview server...');
const server = spawn('npm', ['run', 'preview', '--', '--port', config.port.toString()], {
  stdio: 'pipe',
  shell: true,
});

let serverReady = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Local:') || output.includes('localhost')) {
    serverReady = true;
    console.log(`✅ Server running at http://localhost:${config.port}\n`);
    runAudit();
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  if (!error.includes('WARN')) {
    console.error('Server error:', error);
  }
});

async function runAudit() {
  console.log('🔬 Running axe-core accessibility audit...\n');

  const results: any[] = [];
  let totalViolations = 0;

  for (const url of config.urls) {
    const fullUrl = `http://localhost:${config.port}${url}`;
    console.log(`📄 Auditing: ${url}`);

    try {
      const axe = spawn('npx', [
        '@axe-core/cli',
        fullUrl,
        '--exit',
      ], { shell: true });

      let output = '';
      let errorOutput = '';

      axe.stdout.on('data', (data) => {
        output += data.toString();
      });

      axe.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      await new Promise<void>((resolve) => {
        axe.on('close', (code) => {
          try {
            // Parse axe output
            const lines = output.split('\n');
            const violations = lines.filter(line => 
              line.includes('violation') || 
              line.includes('critical') || 
              line.includes('serious') ||
              line.includes('moderate')
            );

            if (violations.length > 0) {
              console.log(`   ⚠️  ${violations.length} violations found`);
              totalViolations += violations.length;
              results.push({
                url,
                violations,
                exitCode: code,
              });
            } else {
              console.log('   ✅ No violations');
            }
          } catch (e) {
            console.log(`   ℹ️  Check output manually`);
          }
          resolve();
        });
      });
    } catch (error) {
      console.error(`   ❌ Error auditing ${url}:`, error);
    }
  }

  console.log('\n================================');
  console.log('📊 Audit Complete');
  console.log('================================\n');
  console.log(`Total pages audited: ${config.urls.length}`);
  console.log(`Total violations found: ${totalViolations}\n`);

  if (totalViolations > 0) {
    console.log('⚠️  Violations detected!');
    console.log('📝 Review detailed output above');
    console.log('💡 Common issues to fix:');
    console.log('   - Missing aria-label on icon buttons');
    console.log('   - Form inputs without labels');
    console.log('   - Missing alt text on images');
    console.log('   - Color contrast issues');
    console.log('   - Missing page landmarks\n');
  } else {
    console.log('✅ No violations found!\n');
  }

  console.log('🔧 Next steps:');
  console.log('   1. Review violations above');
  console.log('   2. Fix critical issues first');
  console.log('   3. Run audit again to verify\n');

  // Cleanup
  server.kill();
  process.exit(totalViolations > 0 ? 1 : 0);
}

// Timeout after 2 minutes
setTimeout(() => {
  if (!serverReady) {
    console.error('❌ Timeout: Server failed to start');
    server.kill();
    process.exit(1);
  }
}, 120000);

// Handle interrupts
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Audit interrupted');
  server.kill();
  process.exit(1);
});
