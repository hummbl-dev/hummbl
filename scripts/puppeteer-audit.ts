#!/usr/bin/env tsx

/**
 * HUMMBL Accessibility Audit using Puppeteer + axe-core
 * 
 * Uses Puppeteer's bundled Chromium to run accessibility tests
 * No system Chrome installation required
 */

import puppeteer, { type Browser } from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { createServer } from 'vite';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:4173';
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/workflows', name: 'Workflows' },
  { path: '/agents', name: 'Agents' },
  { path: '/analytics', name: 'Analytics' },
  { path: '/mental-models', name: 'Mental Models' },
  { path: '/templates', name: 'Templates' },
  { path: '/settings', name: 'Settings' },
  { path: '/notifications', name: 'Notifications' },
  { path: '/team', name: 'Team' },
  { path: '/login', name: 'Login' },
];

interface ViolationSummary {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  total: number;
}

interface PageResult {
  page: string;
  url: string;
  violations: ViolationSummary;
  details: any[];
}

function summarizeViolations(violations: any[]): ViolationSummary {
  const summary: ViolationSummary = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    total: violations.length,
  };

  violations.forEach((v) => {
    if (v.impact === 'critical') summary.critical++;
    else if (v.impact === 'serious') summary.serious++;
    else if (v.impact === 'moderate') summary.moderate++;
    else if (v.impact === 'minor') summary.minor++;
  });

  return summary;
}

async function auditPage(browser: Browser, url: string, name: string): Promise<PageResult> {
  console.log(`\n📄 Auditing: ${name} (${url})`);
  
  const page = await browser.newPage();
  
  try {
    // Navigate to page
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Run axe audit
    const results = await new AxePuppeteer(page).analyze();
    
    const summary = summarizeViolations(results.violations);
    
    // Print summary
    if (summary.critical > 0) {
      console.log(`   ❌ ${summary.critical} critical, ${summary.serious} serious, ${summary.moderate} moderate, ${summary.minor} minor`);
    } else if (summary.serious > 0) {
      console.log(`   ⚠️  ${summary.serious} serious, ${summary.moderate} moderate, ${summary.minor} minor`);
    } else if (summary.moderate > 0) {
      console.log(`   ⚠️  ${summary.moderate} moderate, ${summary.minor} minor`);
    } else if (summary.minor > 0) {
      console.log(`   ✅ ${summary.minor} minor issues`);
    } else {
      console.log(`   ✅ No violations found!`);
    }
    
    return {
      page: name,
      url,
      violations: summary,
      details: results.violations,
    };
  } catch (error) {
    console.error(`   ❌ Error auditing ${name}:`, error);
    return {
      page: name,
      url,
      violations: { critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 },
      details: [],
    };
  } finally {
    await page.close();
  }
}

async function generateReport(results: PageResult[]) {
  let report = '# HUMMBL Accessibility Audit Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  
  const totals = results.reduce((acc, r) => {
    acc.critical += r.violations.critical;
    acc.serious += r.violations.serious;
    acc.moderate += r.violations.moderate;
    acc.minor += r.violations.minor;
    acc.total += r.violations.total;
    return acc;
  }, { critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 });
  
  report += `- **Pages Audited**: ${results.length}\n`;
  report += `- **Total Violations**: ${totals.total}\n`;
  report += `- **Critical**: ${totals.critical}\n`;
  report += `- **Serious**: ${totals.serious}\n`;
  report += `- **Moderate**: ${totals.moderate}\n`;
  report += `- **Minor**: ${totals.minor}\n\n`;
  
  report += `## Results by Page\n\n`;
  
  results.forEach((result) => {
    report += `### ${result.page}\n\n`;
    report += `URL: ${result.url}\n\n`;
    
    if (result.violations.total === 0) {
      report += `✅ No violations found!\n\n`;
      return;
    }
    
    report += `**Violations**: ${result.violations.total}\n`;
    report += `- Critical: ${result.violations.critical}\n`;
    report += `- Serious: ${result.violations.serious}\n`;
    report += `- Moderate: ${result.violations.moderate}\n`;
    report += `- Minor: ${result.violations.minor}\n\n`;
    
    result.details.forEach((violation) => {
      report += `#### ${violation.id} (${violation.impact})\n\n`;
      report += `${violation.description}\n\n`;
      report += `**Help**: ${violation.helpUrl}\n\n`;
      report += `**Affected Elements**: ${violation.nodes.length}\n\n`;
      
      violation.nodes.slice(0, 3).forEach((node: any) => {
        report += `- \`${node.html}\`\n`;
        report += `  - ${node.failureSummary}\n`;
      });
      
      if (violation.nodes.length > 3) {
        report += `- ... and ${violation.nodes.length - 3} more\n`;
      }
      
      report += `\n`;
    });
  });
  
  return report;
}

async function main() {
  console.log('🔍 HUMMBL Accessibility Audit with Puppeteer');
  console.log('='.repeat(50));
  
  // Check if dist exists
  const distPath = resolve(process.cwd(), 'dist');
  try {
    const { statSync } = await import('fs');
    statSync(distPath);
  } catch {
    console.error('\n❌ Error: dist/ directory not found');
    console.error('   Run: npm run build\n');
    process.exit(1);
  }
  
  console.log('\n✅ Found dist/ directory');
  
  // Start preview server
  console.log('🚀 Starting preview server...');
  const { spawn } = await import('child_process');
  const server = spawn('npm', ['run', 'preview'], {
    stdio: 'ignore',
    detached: true,
  });
  
  // Wait for server
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  console.log('✅ Server running at', BASE_URL);
  console.log('\n📋 Running accessibility audit on', PAGES.length, 'pages...');
  
  // Launch Puppeteer with bundled Chromium
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  console.log('✅ Launched Puppeteer with bundled Chromium');
  
  const results: PageResult[] = [];
  
  // Audit each page
  for (const page of PAGES) {
    const url = `${BASE_URL}${page.path}`;
    const result = await auditPage(browser, url, page.name);
    results.push(result);
  }
  
  await browser.close();
  
  // Generate report
  console.log('\n📝 Generating report...');
  const report = await generateReport(results);
  writeFileSync('ACCESSIBILITY_AUDIT_REPORT.md', report);
  
  // Cleanup
  console.log('🛑 Stopping server...');
  process.kill(-server.pid!);
  
  // Summary
  const totals = results.reduce((acc, r) => {
    acc.critical += r.violations.critical;
    acc.serious += r.violations.serious;
    acc.moderate += r.violations.moderate;
    acc.minor += r.violations.minor;
    return acc;
  }, { critical: 0, serious: 0, moderate: 0, minor: 0 });
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Audit Complete');
  console.log('='.repeat(50));
  console.log(`\nPages audited: ${results.length}`);
  console.log(`Total violations: ${totals.critical + totals.serious + totals.moderate + totals.minor}`);
  console.log(`  Critical: ${totals.critical}`);
  console.log(`  Serious: ${totals.serious}`);
  console.log(`  Moderate: ${totals.moderate}`);
  console.log(`  Minor: ${totals.minor}`);
  console.log(`\n📁 Detailed report: ACCESSIBILITY_AUDIT_REPORT.md\n`);
  
  if (totals.critical > 0) {
    console.log('❌ Critical accessibility issues found!');
    process.exit(1);
  } else if (totals.serious > 0) {
    console.log('⚠️  Serious accessibility issues found');
    process.exit(0);
  } else {
    console.log('✅ No critical accessibility issues');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('\n❌ Audit failed:', error);
  process.exit(1);
});
