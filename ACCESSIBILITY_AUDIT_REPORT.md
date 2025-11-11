# HUMMBL Accessibility Audit Report

Generated: 2025-11-11T20:00:40.558Z

## Summary

- **Pages Audited**: 10
- **Total Violations**: 4
- **Critical**: 0
- **Serious**: 0
- **Moderate**: 4
- **Minor**: 0

## Results by Page

### Home

URL: http://localhost:4173/

✅ No violations found!

### Workflows

URL: http://localhost:4173/workflows

✅ No violations found!

### Agents

URL: http://localhost:4173/agents

✅ No violations found!

### Analytics

URL: http://localhost:4173/analytics

**Violations**: 1
- Critical: 0
- Serious: 0
- Moderate: 1
- Minor: 0

#### heading-order (moderate)

Ensure the order of headings is semantically correct

**Help**: https://dequeuniversity.com/rules/axe/4.11/heading-order?application=axe-puppeteer

**Affected Elements**: 1

- `<h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>`
  - Fix any of the following:
  Heading order invalid

### Mental Models

URL: http://localhost:4173/mental-models

**Violations**: 1
- Critical: 0
- Serious: 0
- Moderate: 1
- Minor: 0

#### heading-order (moderate)

Ensure the order of headings is semantically correct

**Help**: https://dequeuniversity.com/rules/axe/4.11/heading-order?application=axe-puppeteer

**Affected Elements**: 1

- `<h3 class="font-bold text-gray-900">P1: First Principles</h3>`
  - Fix any of the following:
  Heading order invalid

### Templates

URL: http://localhost:4173/templates

✅ No violations found!

### Settings

URL: http://localhost:4173/settings

✅ No violations found!

### Notifications

URL: http://localhost:4173/notifications

✅ No violations found!

### Team

URL: http://localhost:4173/team

✅ No violations found!

### Login

URL: http://localhost:4173/login

**Violations**: 2
- Critical: 0
- Serious: 0
- Moderate: 2
- Minor: 0

#### landmark-one-main (moderate)

Ensure the document has a main landmark

**Help**: https://dequeuniversity.com/rules/axe/4.11/landmark-one-main?application=axe-puppeteer

**Affected Elements**: 1

- `<html lang="en">`
  - Fix all of the following:
  Document does not have a main landmark

#### region (moderate)

Ensure all page content is contained by landmarks

**Help**: https://dequeuniversity.com/rules/axe/4.11/region?application=axe-puppeteer

**Affected Elements**: 9

- `<h1 class="text-3xl font-bold text-gray-900">Welcome Back</h1>`
  - Fix any of the following:
  Some page content is not contained by landmarks
- `<p class="text-gray-600 mt-2">Sign in to your HUMMBL account</p>`
  - Fix any of the following:
  Some page content is not contained by landmarks
- `<label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>`
  - Fix any of the following:
  Some page content is not contained by landmarks
- ... and 6 more

