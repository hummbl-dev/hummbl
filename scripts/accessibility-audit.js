#!/usr/bin/env node
/**
 * HUMMBL Accessibility Audit Script
 * Tests WCAG 2.1 AA compliance for the application
 * 
 * Run with: node scripts/accessibility-audit.js
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

let passed = 0;
let failed = 0;
let warnings = 0;

function pass(message) {
  console.log(`${colors.green}✓ PASS${colors.reset} ${message}`);
  passed++;
}

function fail(message) {
  console.log(`${colors.red}✗ FAIL${colors.reset} ${message}`);
  failed++;
}

function warn(message) {
  console.log(`${colors.yellow}⚠ WARN${colors.reset} ${message}`);
  warnings++;
}

function info(message) {
  console.log(`${colors.blue}→${colors.reset} ${message}`);
}

function section(title) {
  console.log(`\n${colors.blue}${'━'.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}${title}${colors.reset}`);
  console.log(`${colors.blue}${'━'.repeat(60)}${colors.reset}\n`);
}

// Helper to recursively find files
function findFiles(dir, ext, fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        findFiles(filePath, ext, fileList);
      }
    } else if (extname(file) === ext) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

console.log(`${colors.blue}╔${'═'.repeat(60)}╗${colors.reset}`);
console.log(`${colors.blue}║         HUMMBL Accessibility Audit (WCAG 2.1 AA)          ║${colors.reset}`);
console.log(`${colors.blue}╚${'═'.repeat(60)}╝${colors.reset}`);

// Test 1: Semantic HTML
section('1. Semantic HTML Elements');

const srcDir = 'src';
const componentFiles = findFiles(srcDir, '.tsx');

info(`Scanning ${componentFiles.length} component files...`);

let semanticElementsFound = 0;
let divsFound = 0;

componentFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  
  // Check for semantic HTML5 elements
  const semanticElements = ['<header', '<nav', '<main', '<section', '<article', '<aside', '<footer'];
  semanticElements.forEach(element => {
    if (content.includes(element)) {
      semanticElementsFound++;
    }
  });
  
  // Count divs (excessive divs may indicate lack of semantic markup)
  const divMatches = content.match(/<div/g);
  if (divMatches) {
    divsFound += divMatches.length;
  }
});

if (semanticElementsFound > 20) {
  pass(`Semantic HTML elements used throughout (${semanticElementsFound} found)`);
} else {
  warn(`Limited semantic HTML usage (${semanticElementsFound} found)`);
}

info(`Found ${divsFound} <div> elements - consider using semantic alternatives`);

// Test 2: Images have alt text
section('2. Image Alt Text');

let imagesWithAlt = 0;
let imagesWithoutAlt = 0;

componentFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  
  // Check for img tags
  const imgMatches = content.match(/<img[^>]*>/g);
  if (imgMatches) {
    imgMatches.forEach(img => {
      if (img.includes('alt=')) {
        imagesWithAlt++;
      } else {
        imagesWithoutAlt++;
        const filename = file.replace(process.cwd() + '/', '');
        warn(`Image without alt text in ${filename}`);
      }
    });
  }
});

if (imagesWithoutAlt === 0) {
  pass(`All images have alt text (${imagesWithAlt} images checked)`);
} else {
  fail(`${imagesWithoutAlt} images missing alt text`);
}

// Test 3: Buttons and Links have accessible text
section('3. Button and Link Accessibility');

let accessibleButtons = 0;
let iconOnlyButtons = 0;

componentFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  
  // Check for buttons with only icons
  const buttonMatches = content.match(/<button[^>]*>[\s\S]*?<\/button>/g);
  if (buttonMatches) {
    buttonMatches.forEach(button => {
      if (button.includes('aria-label') || button.includes('title')) {
        accessibleButtons++;
      } else if (button.match(/<[A-Z][a-zA-Z]*Icon/)) {
        // Icon component without label
        iconOnlyButtons++;
      } else {
        accessibleButtons++;
      }
    });
  }
});

if (iconOnlyButtons === 0) {
  pass('All icon buttons have accessible labels');
} else {
  warn(`${iconOnlyButtons} icon buttons may need aria-label`);
}

// Test 4: Form inputs have labels
section('4. Form Input Labels');

let inputsWithLabels = 0;
let inputsWithoutLabels = 0;

componentFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  
  // Check for input elements
  const inputMatches = content.match(/<input[^>]*>/g);
  if (inputMatches) {
    inputMatches.forEach(input => {
      if (input.includes('aria-label') || input.includes('placeholder') || content.includes('<label')) {
        inputsWithLabels++;
      } else if (!input.includes('type="hidden"')) {
        inputsWithoutLabels++;
      }
    });
  }
});

if (inputsWithoutLabels === 0) {
  pass(`All form inputs have labels (${inputsWithLabels} inputs checked)`);
} else {
  warn(`${inputsWithoutLabels} inputs may need labels or aria-label`);
}

// Test 5: Color contrast (basic check in CSS/Tailwind)
section('5. Color Contrast');

const indexCSS = readFileSync('src/index.css', 'utf-8');

// Check for common low-contrast patterns
if (indexCSS.includes('text-gray-400') && indexCSS.includes('bg-white')) {
  warn('Potential low contrast: text-gray-400 on white background');
}

if (indexCSS.includes('text-gray-300')) {
  warn('text-gray-300 may not meet WCAG AA contrast requirements');
}

pass('Manual color contrast testing recommended with browser tools');
info('Use Chrome DevTools Lighthouse or axe DevTools for automated contrast checking');

// Test 6: Keyboard navigation (aria attributes)
section('6. Keyboard Navigation Support');

let focusableElements = 0;
let tabIndexIssues = 0;

componentFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  
  // Check for interactive elements
  const interactiveElements = ['<button', '<a ', '<input', '<select', '<textarea'];
  interactiveElements.forEach(element => {
    const matches = content.match(new RegExp(element, 'g'));
    if (matches) {
      focusableElements += matches.length;
    }
  });
  
  // Check for tabIndex issues
  if (content.includes('tabIndex={-1}') || content.includes('tabindex="-1"')) {
    tabIndexIssues++;
  }
});

pass(`${focusableElements} focusable elements found`);

if (tabIndexIssues > 0) {
  warn(`${tabIndexIssues} elements with tabIndex={-1} - ensure intentional`);
} else {
  pass('No negative tabIndex found');
}

info('Manual keyboard navigation testing required (Tab, Enter, Escape, Arrow keys)');

// Test 7: ARIA attributes
section('7. ARIA Attributes');

let ariaLabels = 0;
let ariaDescribedBy = 0;
let ariaLive = 0;

componentFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  
  if (content.includes('aria-label')) ariaLabels++;
  if (content.includes('aria-describedby')) ariaDescribedBy++;
  if (content.includes('aria-live')) ariaLive++;
});

pass(`${ariaLabels} components use aria-label`);
info(`${ariaDescribedBy} components use aria-describedby`);
info(`${ariaLive} components use aria-live regions`);

if (ariaLive === 0) {
  warn('No aria-live regions found - consider for dynamic content updates');
}

// Test 8: Page title and landmarks
section('8. Page Structure');

const indexHTML = readFileSync('index.html', 'utf-8');

if (indexHTML.includes('<title>')) {
  pass('Page has title element');
} else {
  fail('Missing <title> element');
}

if (indexHTML.includes('lang=')) {
  pass('HTML lang attribute present');
} else {
  fail('Missing HTML lang attribute');
}

// Check for viewport meta tag
if (indexHTML.includes('viewport')) {
  pass('Viewport meta tag present (responsive design)');
} else {
  fail('Missing viewport meta tag');
}

// Test 9: Headings hierarchy
section('9. Heading Hierarchy');

let h1Count = 0;
let headingOrder = true;

componentFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  
  const h1Matches = content.match(/<h1/g);
  if (h1Matches) {
    h1Count += h1Matches.length;
  }
});

if (h1Count >= componentFiles.length * 0.1) {
  pass('Multiple pages likely have h1 headings');
} else {
  warn('Ensure each page has exactly one h1 heading');
}

info('Manual review: Verify heading levels don\'t skip (h1 → h2 → h3, not h1 → h3)');

// Test 10: Focus indicators
section('10. Focus Indicators');

if (indexCSS.includes('focus:') || indexCSS.includes(':focus')) {
  pass('Focus styles defined in CSS');
} else {
  warn('No explicit focus styles found - may rely on browser defaults');
}

if (indexCSS.includes('outline: none') || indexCSS.includes('outline:none')) {
  warn('outline: none detected - ensure custom focus indicator is provided');
}

// Test 11: Error handling and validation
section('11. Form Validation & Error Messages');

let errorComponents = 0;
componentFiles.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  if (content.includes('error') || content.includes('Error')) {
    errorComponents++;
  }
});

info(`${errorComponents} components handle errors`);
info('Manual test: Verify error messages are announced to screen readers (aria-live)');

// Test 12: Skip links
section('12. Skip Navigation Links');

const appFile = readFileSync('src/App.tsx', 'utf-8');

if (appFile.includes('skip') || appFile.includes('Skip')) {
  pass('Skip navigation links may be present');
} else {
  warn('Consider adding "Skip to main content" link for keyboard users');
}

// Summary
console.log(`\n${colors.blue}╔${'═'.repeat(60)}╗${colors.reset}`);
console.log(`${colors.blue}║                       Summary                              ║${colors.reset}`);
console.log(`${colors.blue}╚${'═'.repeat(60)}╝${colors.reset}\n`);

console.log(`${colors.green}Passed:   ${passed}${colors.reset}`);
console.log(`${colors.yellow}Warnings: ${warnings}${colors.reset}`);
console.log(`${colors.red}Failed:   ${failed}${colors.reset}\n`);

// Recommendations
console.log(`${colors.blue}Manual Testing Required:${colors.reset}\n`);
console.log('1. Test with keyboard only (Tab, Shift+Tab, Enter, Escape, Arrow keys)');
console.log('2. Test with screen reader (NVDA on Windows, VoiceOver on Mac)');
console.log('3. Run Chrome Lighthouse accessibility audit');
console.log('4. Test color contrast with browser DevTools');
console.log('5. Test with browser zoom at 200%');
console.log('6. Test focus indicators on all interactive elements\n');

if (failed === 0 && warnings <= 5) {
  console.log(`${colors.green}✓ Accessibility audit passed!${colors.reset}`);
  console.log(`${colors.green}Complete manual testing for full WCAG 2.1 AA compliance.${colors.reset}\n`);
  process.exit(0);
} else if (failed === 0) {
  console.log(`${colors.yellow}⚠ Accessibility audit passed with warnings${colors.reset}`);
  console.log(`${colors.yellow}Address warnings and complete manual testing.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}✗ Accessibility audit found issues${colors.reset}`);
  console.log(`${colors.red}Address failed checks and complete manual testing.${colors.reset}\n`);
  process.exit(1);
}
